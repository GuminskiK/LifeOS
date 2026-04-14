import os
import re

filepath = '../social_media_agregator/app/services/scraper_service.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

pattern_gen = re.compile(
    r'        try:\n            rss_response = await self._fetch_rss\(rss_url, config\)\n            await self._process_rss_feed\(rss_response\.text, platform, default_types\.get\(platform\.platform_type, PostType\.Post\)\)\n        except Exception as e:\n            logger\.error\(f"Error processing generic RSS for \{platform\.name\}: \{e\}"\)',
    re.DOTALL
)

new_gen = """        try:
            rss_response = await self._fetch_rss(rss_url, config)
            new_posts = await self._process_rss_feed(rss_response.text, platform, default_types.get(platform.platform_type, PostType.Post))
            
            if new_posts > 0:
                # Otwarcie okna Live na wypadek, gdyby twórca po wrzuceniu wideo przeszedł na live
                config.live_check_until = datetime.now() + timedelta(minutes=60)
                self.db.add(config)
                await self.db.commit()
                
        except Exception as e:
            logger.error(f"Error processing generic RSS for {platform.name}: {e}")"""

if pattern_gen.search(content):
    content = pattern_gen.sub(new_gen, content)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Generic matched and replaced")
else:
    print("Still no match")
