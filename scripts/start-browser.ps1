# Start Chrome with configured Google profile and CDP debugging on Windows
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$configPath = Join-Path $projectDir "config\flow.config.json"

if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
} else {
    $config = [PSCustomObject]@{}
}

$cdpPort = if ($config.cdpPort) { $config.cdpPort } else { 9222 }
$userDataDir = if ($config.chromeUserDataDir) { $config.chromeUserDataDir } else { "$env:LOCALAPPDATA\Google\Chrome\User Data" }

$chromePath = if ($config.chromePath -and (Test-Path $config.chromePath)) {
    $config.chromePath
} elseif (Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe") {
    "C:\Program Files\Google\Chrome\Application\chrome.exe"
} elseif (Test-Path "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe") {
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
} elseif (Test-Path "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe") {
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
} else {
    "chrome.exe"
}

Write-Host "[$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')] INFO Checking Chrome on CDP port $cdpPort..."

try {
    $resp = Invoke-RestMethod -Uri "http://127.0.0.1:$cdpPort/json/version" -TimeoutSec 2 -ErrorAction Stop
    if ($resp) {
        Write-Host "[$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')] INFO Chrome already running on CDP port $cdpPort"
        exit 0
    }
} catch {
    # Port not open yet, proceed to launch
}

Write-Host "[$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')] INFO Launching Chrome on CDP port $cdpPort"
Write-Host "[$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')] INFO Chrome: $chromePath"
Write-Host "[$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')] INFO User Data Dir: $userDataDir"

$arguments = @(
    "--user-data-dir=`"$userDataDir`"",
    "--remote-debugging-port=$cdpPort",
    "--remote-allow-origins=*",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-sync",
    "--disable-features=ChromeWhatsNewUI,DevToolsRemoteDebuggingAllowNotice",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-sync-preferences"
)

if ($config.headless -eq $true) {
    $arguments += "--headless=new"
}

$flowUrl = if ($config.flowUrl) { $config.flowUrl } else { "https://labs.google/fx/zh/tools/flow" }
$arguments += $flowUrl

Start-Process -FilePath $chromePath -ArgumentList $arguments

for ($i = 1; $i -le 15; $i++) {
    Start-Sleep -Seconds 1
    try {
        $resp = Invoke-RestMethod -Uri "http://127.0.0.1:$cdpPort/json/version" -TimeoutSec 1 -ErrorAction Stop
        if ($resp) {
            Write-Host "[$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')] INFO Chrome CDP ready on port $cdpPort"
            exit 0
        }
    } catch {}
}

Write-Error "Chrome did not respond on CDP port $cdpPort within 15 seconds"
exit 1
