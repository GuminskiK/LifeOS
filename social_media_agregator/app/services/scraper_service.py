import asyncio
import random
import logging
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

import httpx
import feedparser
from app.core.config import settings
from app.models.ScraperSettings import ScraperConfig, ScraperStatus
from app.models.Platforms import Platform, PlatformType
from app.models.Posts import Post, PostType
from app.services.notification_service import send_discord_notification

# Konfiguracja logowania dla RPi - warto pisać do pliku, by nie zapchać RAMu
logger = logging.getLogger(__name__)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1"
]

class ScraperService:
    def __init__(self, db_session: AsyncSession):
        self.db = db_session
        self.client = httpx.AsyncClient(timeout=20.0) # Krótszy timeout dla lokalnego RSS Bridge

    async def close(self):
        """Zamyka klienta HTTP."""
        await self.client.aclose()

    async def _get_random_jitter(self, base_delay: int = 0, max_jitter: int = 10):
        """Dodaje losowe opóźnienie w sekundach."""
        delay = base_delay + random.uniform(0, max_jitter)
        await asyncio.sleep(delay)

    def _is_within_window(self, config: ScraperConfig) -> bool:
        """Sprawdza, czy obecny czas mieści się w zdefiniowanym oknie configu."""
        if not config.active_from or not config.active_to:
            return True
        
        now = datetime.now().time()
        if config.active_from <= config.active_to:
            return config.active_from <= now <= config.active_to
        else:  # Okno przechodzące przez północ (np. 22:00 - 04:00)
            return now >= config.active_from or now <= config.active_to

    async def _fetch_rss(self, url: str, config: ScraperConfig) -> httpx.Response:
        """Pobiera dane z LOKALNEGO RSS Bridge. Nie potrzebujemy tu rotacji UA."""
        try:
            response = await self.client.get(url)
            
            # Jeśli RSS Bridge zwraca błąd od serwisu zewnętrznego (np. 429)
            if response.status_code in [403, 429]:
                await self._handle_hard_stop(config)
                response.raise_for_status()
                
            response.raise_for_status()
            return response
        except httpx.HTTPStatusError as e:
            logger.error(f"RSS Bridge HTTP error: {e}")
            raise
        except Exception as e:
            logger.error(f"RSS Bridge connection error: {e}")
            raise

    def _get_ua(self, config: ScraperConfig) -> str:
        """Zwraca dedykowany lub losowy User-Agent."""
        return config.user_agent_override or random.choice(USER_AGENTS)

    async def run_tiktok_logic(self, platform: Platform, config: ScraperConfig):
        """
        Specyficzna logika dla TikToka:
        1. Sprawdź RSS (RSS Bridge) co x minut.
        2. Jeśli okno czasowe sprzyja, sprawdź czy jest LIVE.
        """
        rss_url = f"http://localhost:3000/?action=display&bridge=TikTokBridge&context=User&user={platform.name}&format=Atom"
        
        try:
            # 1. RSS Check
            rss_response = await self._fetch_rss(rss_url, config)
            new_posts = await self._process_rss_feed(rss_response.text, platform, PostType.Video)

            # Jeśli wykryto nowy post, ustawiamy okno sprawdzania live na 25 minut
            if new_posts > 0:
                config.live_check_until = datetime.now() + timedelta(minutes=25)
                self.db.add(config)
                await self.db.commit()

            # 2. Live Check - tylko jeśli jesteśmy w oknie czasowym
            if config.live_check_until and datetime.now() < config.live_check_until:
                is_live = await self._check_live_status(platform.name, config)
                if is_live:
                    logger.info(f"TikTok Creator {platform.name} is LIVE! Starting recording...")
                    asyncio.create_task(self._start_recording(platform.name, "tiktok", config))
            
        except Exception as e:
            logger.error(f"Error during TikTok scraping for {platform.name}: {e}")

    async def _check_live_status(self, username: str, config: ScraperConfig) -> bool:
        """Używa yt-dlp do sprawdzenia statusu live (bez pobierania)."""
        url = f"https://www.tiktok.com/@{username}/live"
        ua = self._get_ua(config)
        
        process = await asyncio.create_subprocess_exec(
            'yt-dlp', '--print', 'is_live', '--user-agent', ua, url,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        
        # Jeśli yt-dlp wypluje 'True', znaczy że stream trwa
        output = stdout.decode().strip()
        
        # Detekcja bana przez yt-dlp
        if "403" in stderr.decode() or "429" in stderr.decode():
            await self._handle_hard_stop(config)
            return False
            
        return output == "True"

    async def _start_recording(self, username: str, platform_name: str, config: ScraperConfig, custom_url: Optional[str] = None):
        """Uruchamia yt-dlp dla streamów."""
        url = custom_url or f"https://www.tiktok.com/@{username}/live"
        output = str(Path(settings.MEDIA_ROOT) / "streams" / f"{platform_name}_{username}_{datetime.now().strftime('%Y%m%d_%H%M')}.mp4")
        ua = self._get_ua(config)
        quality = config.target_quality

        process = await asyncio.create_subprocess_exec(
            'yt-dlp', 
            '--format', f'bestvideo[height<={quality}]+bestaudio/best',
            '--user-agent', ua,
            '--output', output,
            '--no-part', # Ważne dla streamów, by nie tworzyć plików .part
            url,
            stdout=asyncio.subprocess.DEVNULL, # Nie chcemy spamu w logach
            stderr=asyncio.subprocess.PIPE
        )
        logger.info(f"Started yt-dlp recording for {username}")
        stdout, stderr = await process.communicate()
        if process.returncode == 0:
            logger.info(f"Finished recording {username}")
        else:
            logger.error(f"yt-dlp error for {username}: {stderr.decode()}")

    async def _handle_hard_stop(self, config: ScraperConfig):
        """Aktywuje tryb bezpieczeństwa po wykryciu blokady."""
        logger.critical(f"HARD_STOP triggered for config {config.id}")
        config.status = ScraperStatus.HARD_STOP
        self.db.add(config)
        await self.db.commit()
        
        # Wysyłka alertu na Discord
        message = (
            f"🚨 **SOCIAL MEDIA AGREGATOR ALERT** 🚨\n"
            f"Wykryto podejrzenie blokady bota! Uruchomiono **HARD STOP**.\n"
            f"**Konfiguracja ID:** `{config.id}`\n**Platforma ID:** `{config.platform_id}`"
        )
        await send_discord_notification(message)

    def _save_file(self, path: Path, content: bytes):
        """Pomocnicza funkcja do zapisu binarnego (wywoływana w wątku)."""
        with open(path, "wb") as f:
            f.write(content)

    async def _download_media(self, url: str, folder_name: str) -> Optional[str]:
        """Pobiera obraz i zapisuje go lokalnie na dysku."""
        try:
            # Określenie ścieżki (zgodnie z Twoją strukturą na RPi)
            base_dir = Path(settings.MEDIA_ROOT) / "images" / folder_name
            base_dir.mkdir(parents=True, exist_ok=True)
            
            # Wyciągnięcie nazwy pliku z URL lub wygenerowanie timestampu
            filename = url.split("/")[-1].split("?")[0]
            if not filename or "." not in filename:
                filename = f"img_{int(datetime.now().timestamp())}.jpg"
            
            file_path = base_dir / filename
            
            response = await self.client.get(url)
            response.raise_for_status()
            
            await asyncio.to_thread(self._save_file, file_path, response.content)
            return str(file_path)
        except Exception as e:
            logger.error(f"Failed to download media from {url}: {e}")
            return None

    async def _process_rss_feed(self, xml_content: str, platform: Platform, default_type: PostType):
        """Parsuje XML z RSS Bridge i zapisuje nowe posty w bazie."""
        feed = feedparser.parse(xml_content)
        new_posts_count = 0

        for entry in feed.entries:
            # Prosta deduplikacja po URL źródłowym
            result = await self.db.exec(
                select(Post).where(Post.source_url == entry.link)
            )
            existing = result.first()
            
            if existing:
                continue

            # Mapowanie pól z RSS/Atom na model Post
            # RSS Bridge zazwyczaj daje datę w formacie entry.published_parsed
            created_at = datetime.now()
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                created_at = datetime(*entry.published_parsed[:6])

            # Wybieramy typ posta (można rozbudować o analizę contentu)
            p_type = default_type
            original_content = entry.get('summary', entry.get('description', ""))
            content_snippet = original_content.lower()

            if platform.platform_type == PlatformType.YouTube:
                # Jeśli w tytule/linku jest 'shorts', ustawiamy Short
                if "/shorts/" in entry.link:
                    p_type = PostType.Short
            elif platform.platform_type == PlatformType.Instagram:
                # Jeśli opis jest krótki i są tagi img, prawdopodobnie Post (zdjęcie)
                if "<img" in content_snippet:
                    p_type = PostType.Post
            elif platform.platform_type == PlatformType.X:
                # X to głównie tekst
                p_type = PostType.Text
                # Ale jeśli ma link do wideo/obrazka w opisie:
                if "video" in content_snippet or ".mp4" in content_snippet:
                    p_type = PostType.Video

            # Wyciąganie i pobieranie obrazów dla Instagrama/X
            local_media_path = None
            if platform.platform_type in [PlatformType.Instagram, PlatformType.X]:
                # RSS Bridge zazwyczaj osadza obraz w tagu <img>
                match = re.search(r'<img [^>]*src="([^"]+)"', original_content)
                if match:
                    img_url = match.group(1)
                    local_media_path = await self._download_media(img_url, platform.name)

            new_post = Post(
                name=entry.title,
                text=original_content,
                source_url=entry.link,
                created_at=created_at,
                post_type=p_type,
                platform_id=platform.id,
                media_path=local_media_path
            )
            
            self.db.add(new_post)
            new_posts_count += 1

        if new_posts_count > 0:
            await self.db.commit()
            logger.info(f"Added {new_posts_count} new posts for {platform.name} ({platform.platform_type})")
        return new_posts_count

    async def manual_trigger(self, platform_id: int):
        """Wymusza natychmiastowe pobranie danych dla konkretnej platformy."""
        statement = select(ScraperConfig, Platform).join(Platform).where(
            Platform.id == platform_id
        )
        result = await self.db.exec(statement)
        data = result.first()
        
        if not data:
            raise ValueError(f"Nie znaleziono konfiguracji dla platformy o ID {platform_id}")
            
        config, platform = data
        await self._run_scraper_for_platform(config, platform)
        
        config.last_run = datetime.now()
        self.db.add(config)
        await self.db.commit()

    async def process_active_configs(self):
        """Główna pętla wywoływana przez scheduler łącząca logikę z Frontendu."""
        statement = select(ScraperConfig, Platform).join(Platform).where(
            ScraperConfig.status == ScraperStatus.ACTIVE
        )
        result = await self.db.exec(statement)
        results = result.all()
        now = datetime.now()

        for config, platform in results:
            is_intensive_window = config.live_check_until and now < config.live_check_until
            jitter_sec = 60
            
            if not is_intensive_window:
                if config.trigger_type in [ScraperTriggerType.MANUAL, ScraperTriggerType.DISCORD]:
                    continue  # Wywoływane ręcznie albo webhookiem
                
                if config.trigger_type == ScraperTriggerType.POST_DEPENDENT:
                    # Nasłuchuje, odpali się tylko z innej akcji podczas intensive window
                    continue
                
                sched = config.schedule_config or {}
                
                days = sched.get('days') or []
                if days:
                    current_day = now.weekday() + 1
                    if current_day not in days:
                        continue
                        
                start_str = sched.get('start')
                end_str = sched.get('end')
                if start_str and end_str:
                    try:
                        start_time = datetime.strptime(start_str, "%H:%M").time()
                        end_time = datetime.strptime(end_str, "%H:%M").time()
                        now_time = now.time()
                        if start_time <= end_time:
                            if not (start_time <= now_time <= end_time):
                                continue
                        else:
                            if not (now_time >= start_time or now_time <= end_time):
                                continue
                    except ValueError:
                        pass
                else:
                    if not self._is_within_window(config):
                        continue
                        
                # Sprawdzenie zadanego interwału w konfiguracji
                interval_min = config.poll_interval_minutes or 15
                if config.last_run and now - config.last_run < timedelta(minutes=interval_min):
                    continue
                    
                jitter_min = float(sched.get('jitter') or 0)
                jitter_sec = jitter_min * 60 + 60
            else:
                # Intensive window (po wykryciu nowej treści / POST_DEPENDENT) - np. co 2m
                interval_min = max(2, config.poll_interval_minutes // 5 if config.poll_interval_minutes else 2)
                if config.last_run and now - config.last_run < timedelta(minutes=interval_min):
                    continue
                jitter_sec = 30
            
            if jitter_sec > 0:
                await self._get_random_jitter(0, jitter_sec)

            await self._run_scraper_for_platform(config, platform)
            
            config.last_run = datetime.now()
            self.db.add(config)
            
        await self.db.commit()

    async def _run_scraper_for_platform(self, config: ScraperConfig, platform: Platform):
        """Pomocnicza metoda do uruchomienia scrapowania dla pojedynczej platformy."""
        if platform.platform_type == PlatformType.TikTok:
            await self.run_tiktok_logic(platform, config)
        else:
            await self._process_generic_rss(platform, config)

    async def _process_generic_rss(self, platform: Platform, config: ScraperConfig):
        """Obsługa YouTube, Instagram i X przez RSS Bridge."""
        # Mapowanie platform na parametry RSS Bridge
        bridge_params = {
            PlatformType.YouTube: f"action=display&bridge=YouTubeBridge&context=By+User&user={platform.name}&format=Atom",
            PlatformType.Instagram: f"action=display&bridge=InstagramBridge&context=Username&u={platform.name}&format=Atom",
            PlatformType.X: f"action=display&bridge=TwitterBridge&context=By+username&u={platform.name}&format=Atom",
        }

        query_string = bridge_params.get(platform.platform_type)
        if not query_string:
            logger.warning(f"No bridge config for platform type: {platform.platform_type}")
            return

        rss_url = f"http://localhost:3000/?{query_string}"
        
        # Domyślne typy dla platform
        default_types = {
            PlatformType.YouTube: PostType.Video,
            PlatformType.Instagram: PostType.Post,
            PlatformType.X: PostType.Text
        }

        try:
            rss_response = await self._fetch_rss(rss_url, config)
            new_posts = await self._process_rss_feed(rss_response.text, platform, default_types.get(platform.platform_type, PostType.Post))
            
            if new_posts > 0:
                # Rozszerzamy czułość do np. streamów tak samo jak u TikToka dla nowej zawartości
                config.live_check_until = datetime.now() + timedelta(minutes=60)
                self.db.add(config)
                await self.db.commit()
                
        except Exception as e:
            logger.error(f"Error processing generic RSS for {platform.name}: {e}")