import asyncio
import random
import logging
from datetime import datetime, time
from typing import List, Optional
from sqlmodel import Session, select, or_, and_

import httpx
from app.models.ScraperSettings import ScraperConfig, ScraperStatus
from app.models.Platforms import Platform, PlatformType

logger = logging.getLogger(__name__)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1"
]

class ScraperService:
    def __init__(self, db_session: Session):
        self.db = db_session
        self.client = httpx.AsyncClient(timeout=30.0)

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

    async def _make_request(self, url: str, config: ScraperConfig, headers: Optional[dict] = None) -> httpx.Response:
        """Wykonuje zapytanie z rotacją User-Agent i obsługą błędów (Hard Stop)."""
        if config.status == ScraperStatus.HARD_STOP:
            raise RuntimeWarning(f"Scraper for platform {config.platform_id} is in HARD_STOP mode.")

        final_headers = headers or {}
        final_headers["User-Agent"] = config.user_agent_override or random.choice(USER_AGENTS)
        
        # Jitter przed każdym zapytaniem (1-5s) by udawać człowieka
        await self._get_random_jitter(1, 4)

        try:
            response = await self.client.get(url, headers=final_headers)
            
            if response.status_code in [403, 429]:
                logger.critical(f"Detection suspected (Status {response.status_code}) for config {config.id}. Triggering HARD_STOP.")
                config.status = ScraperStatus.HARD_STOP
                self.db.add(config)
                self.db.commit()
                # Tutaj można dodać wywołanie zewnętrznego powiadomienia (e.g. Discord Webhook)
            
            response.raise_for_status()
            return response

        except httpx.HTTPStatusError as e:
            config.fail_count += 1
            self.db.add(config)
            self.db.commit()
            raise e

    async def run_tiktok_logic(self, platform: Platform, config: ScraperConfig):
        """
        Specyficzna logika dla TikToka:
        1. Sprawdź RSS (RSS Bridge) co x minut.
        2. Jeśli okno czasowe sprzyja, sprawdź czy jest LIVE.
        """
        rss_url = f"http://localhost:3000/?action=display&bridge=TikTokBridge&context=User&user={platform.name}&format=Atom"
        
        try:
            # 1. RSS Check
            response = await self._make_request(rss_url, config)
            logger.info(f"RSS check for TikTok {platform.name} successful.")
            # Tutaj logika parsowania xml i dodawania Postów do DB...

            # 2. Live Check (jeśli jesteśmy w oknie)
            # Uproszczony check statusu LIVE bez ciężkich bibliotek
            live_url = f"https://www.tiktok.com/@{platform.name}/live"
            live_resp = await self._make_request(live_url, config)
            
            if 'RENDER_DATA' in live_resp.text and '"status":4' in live_resp.text:
                logger.info(f"TikTok Creator {platform.name} is LIVE! Starting yt-dlp...")
                # Wywołanie yt-dlp jako subprocess (nie blokujące)
                asyncio.create_task(self._start_recording(platform.name, "tiktok"))

        except Exception as e:
            logger.error(f"Error during TikTok scraping for {platform.name}: {e}")

    async def _start_recording(self, username: str, platform_name: str):
        """Uruchamia yt-dlp dla streamów."""
        # Przykładowa komenda yt-dlp zoptymalizowana pod RPi (limitowanie formatu)
        url = f"https://www.tiktok.com/@{username}/live"
        output = f"/mnt/storage/media/streams/{platform_name}_{username}_{datetime.now().strftime('%Y%m%d_%H%M')}.mp4"
        
        process = await asyncio.create_subprocess_exec(
            'yt-dlp', 
            '--format', 'bestvideo[height<=720]+bestaudio/best', 
            '--output', output, 
            url,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        logger.info(f"Started yt-dlp recording for {username}")
        stdout, stderr = await process.communicate()
        if process.returncode == 0:
            logger.info(f"Finished recording {username}")
        else:
            logger.error(f"yt-dlp error for {username}: {stderr.decode()}")

    async def process_active_configs(self):
        """Główna pętla wywoływana przez scheduler."""
        query = select(ScraperConfig, Platform).join(Platform).where(
            ScraperConfig.status == ScraperStatus.ACTIVE
        )
        results = self.db.exec(query).all()

        for config, platform in results:
            if not self._is_within_window(config):
                continue
            
            # Dodajemy losowy jitter na poziomie pętli (0-60s), by starty nie były sztywne
            await self._get_random_jitter(0, 60)

            if platform.platform_type == PlatformType.TikTok:
                await self.run_tiktok_logic(platform, config)
            else:
                # Generyczna logika dla innych platform przez RSS Bridge
                await self._process_generic_rss(platform, config)
            
            config.last_run = datetime.now()
            self.db.add(config)
        
        self.db.commit()

    async def _process_generic_rss(self, platform: Platform, config: ScraperConfig):
        # Podobna logika do TikToka, ale bez Live checka
        pass