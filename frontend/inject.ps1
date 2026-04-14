$content = Get-Content -Path 'src/pages/social/SocialMain.tsx' -Raw
$importStr = "import { fetchGlobalFeed, fetchCreators, fetchProcessStatuses, updateScraperConfig, Post, Creator, ScraperConfig } from '../../api/socialApi';
"
if ($content -notmatch 'fetchGlobalFeed') {
    $content = $content -replace "import React, \{ useState, useEffect \} from 'react';", "import React, { useState, useEffect } from 'react';
$importStr"
}
Set-Content -Path 'src/pages/social/SocialMain.tsx' -Value $content
