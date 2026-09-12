# Start the Google Flow Browser MCP server on Windows
# Automatically checks and launches Chrome with CDP debugging if not already running.
$ErrorActionPreference = "Stop"

function Log-Info($msg) {
    [Console]::Error.WriteLine("[$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')] INFO  $msg")
}

function Log-Warn($msg) {
    [Console]::Error.WriteLine("[$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')] WARN  $msg")
}

function Log-Error($msg) {
    [Console]::Error.WriteLine("[$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')] ERROR $msg")
}

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

Log-Info "Checking Chrome on CDP port $cdpPort..."

$chromeReady = $false
try {
    $resp = Invoke-RestMethod -Uri "http://127.0.0.1:$cdpPort/json/version" -TimeoutSec 2 -ErrorAction Stop
    if ($resp) {
        Log-Info "Chrome is already running on CDP port $cdpPort"
        $chromeReady = $true
    }
} catch {
    # Port not open yet, launch Chrome
}

if (-not $chromeReady) {
    Log-Info "Chrome is not running on CDP port $cdpPort. Launching automatically..."

    Log-Info "Launching Chrome on CDP port $cdpPort"
    Log-Info "Chrome executable: $chromePath"
    Log-Info "User Data Dir: $userDataDir"

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

    Start-Process -FilePath $chromePath -ArgumentList $arguments | Out-Null

    for ($i = 1; $i -le 15; $i++) {
        Start-Sleep -Seconds 1
        try {
            $resp = Invoke-RestMethod -Uri "http://127.0.0.1:$cdpPort/json/version" -TimeoutSec 1 -ErrorAction Stop
            if ($resp) {
                Log-Info "Chrome CDP ready on port $cdpPort"
                $chromeReady = $true
                break
            }
        } catch {}
    }

    if (-not $chromeReady) {
        Log-Error "Chrome did not respond on CDP port $cdpPort within 15 seconds"
        exit 1
    }
}

Log-Info "Starting Google Flow Browser MCP server..."
Set-Location $projectDir
& node src/index.js
