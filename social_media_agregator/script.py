import os
import re

filepath = '../social_media_agregator/app/services/scraper_service.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace process_active_configs block
pattern_configs = re.compile(
    r'    async def process_active_configs\(self\):.*?^\s*await self\.db\.commit\(\)',
    re.DOTALL | re.MULTILINE
)

new_configs = """    async def process_active_configs(self):
        \"\"\"Główna pętla wywoływana przez scheduler łącząca logikę z Frontendu.\"\"\"
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
            
        await self.db.commit()"""

# Replace generic RSS error processing logic
pattern_gen = re.compile(
    r'        try:\s+rss_response = await self\._fetch_rss\(rss_url, config\)\s+await self\._process_rss_feed\(rss_response\.text, platform, default_types\.get\(platform\.platform_type, PostType\.Post\)\)\s+except Exception as e:\s+logger\.error\(f"Error processing generic RSS for \{platform\.name\}: \{e\}"\)',
    re.DOTALL
)

new_gen = """        try:
            rss_response = await self._fetch_rss(rss_url, config)
            new_posts = await self._process_rss_feed(rss_response.text, platform, default_types.get(platform.platform_type, PostType.Post))
            
            if new_posts > 0:
                # Rozszerzamy czułość do np. streamów tak samo jak u TikToka dla nowej zawartości
                config.live_check_until = datetime.now() + timedelta(minutes=60)
                self.db.add(config)
                await self.db.commit()
                
        except Exception as e:
            logger.error(f"Error processing generic RSS for {platform.name}: {e}")"""

if pattern_configs.search(content):
    content = pattern_configs.sub(new_configs, content)
else:
    print("Could not match configs")

if pattern_gen.search(content):
    content = pattern_gen.sub(new_gen, content)
else:
    print("Could not match generic")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated via Regex.")
