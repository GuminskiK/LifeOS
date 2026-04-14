$content = Get-Content -Path 'frontend/src/api/socialApi.ts' -Raw
$content = $content -replace "import \{ api \} from '\./client';", "import { smaApi as api } from './client';"
Set-Content -Path 'frontend/src/api/socialApi.ts' -Value $content
