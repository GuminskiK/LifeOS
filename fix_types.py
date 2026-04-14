import sys
import re

with open('frontend/src/api/socialApi.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Add mock properties to interfaces
text = text.replace("  platforms?: Platform[];", "  platforms?: Platform[];\n  bio?: string;\n  followers?: string;")
text = text.replace("  scraper_config?: ScraperConfig;", "  scraper_config?: ScraperConfig;\n  url?: string;")
text = text.replace("  creator_name?: string;", "  creator_name?: string;\n  last_run?: string;\n  nextPoll?: string;")

with open('frontend/src/api/socialApi.ts', 'w', encoding='utf-8') as f:
    f.write(text)

with open('frontend/src/pages/social/SocialMain.tsx', 'r', encoding='utf-8') as f:
    main_text = f.read()

main_text = main_text.replace("c.platforms.slice", "(c.platforms || []).slice")
main_text = main_text.replace("creator.platforms.map", "(creator.platforms || []).map")
main_text = main_text.replace("c.platforms.map", "(c.platforms || []).map")

main_text = main_text.replace("status.platform", "status.platform_name")
main_text = main_text.replace("status.lastPoll", "status.last_run")
main_text = main_text.replace("status.platform_name_name", "status.platform_name")
main_text = main_text.replace("status.platform_name_type", "status.platform_type")
main_text = main_text.replace("status.status === 'active'", "status.status === 'active'")

with open('frontend/src/pages/social/SocialMain.tsx', 'w', encoding='utf-8') as f:
    f.write(main_text)
