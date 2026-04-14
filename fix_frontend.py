import sys
import re

with open('frontend/src/pages/social/SocialMain.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Make sure we have the right API imports
api_import = "import { fetchGlobalFeed, fetchCreators, fetchProcessStatuses, updateScraperConfig, Post, Creator, ScraperConfig } from '../../api/socialApi';\n"
if 'fetchGlobalFeed' not in text:
    if 'import React, { useState } from' in text:
        text = text.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';\n" + api_import)
    elif "import { useState } from 'react';" in text:
        text = text.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';\n" + api_import)

text = re.sub(r'const MOCK_CREATORS = \[.*?\n\];', '', text, flags=re.DOTALL)
text = re.sub(r'const MOCK_FEED = \[.*?\n\];', '', text, flags=re.DOTALL)
text = re.sub(r'const INITIAL_STATUSES = \[.*?\n\];', '', text, flags=re.DOTALL)

with open('frontend/src/pages/social/SocialMain.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
