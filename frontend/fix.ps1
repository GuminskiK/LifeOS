$content = Get-Content -Path 'src/api/socialApi.ts' -Raw
$content = $content -replace '\/social/aggregator/scraper-configs/,\s*data\)', '`/social/aggregator/scraper-configs/${configId}`, data)'
Set-Content -Path 'src/api/socialApi.ts' -Value $content
