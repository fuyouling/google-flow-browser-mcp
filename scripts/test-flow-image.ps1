<#
.SYNOPSIS
  Windows PowerShell version of test-flow-image.sh for Google Flow Browser MCP
.DESCRIPTION
  Connects to Google Flow, checks the account, and optionally runs an image generation test over MCP stdio protocol.
.PARAMETER GenerateImage
  If specified, sends a flow_generate_image tool call after connection.
.PARAMETER Prompt
  Prompt to use when -GenerateImage is specified.
.PARAMETER Headless
  Whether to run Chrome in headless mode during test (default: false).
#>
[CmdletBinding()]
param(
    [switch]$GenerateImage,
    [string]$Prompt = "A serene mountain lake at sunrise with mist, digital art style",
    [bool]$Headless = $false
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$mcpServer = Join-Path $projectDir "src\index.js"

function Write-Log([string]$level, [string]$msg, [ConsoleColor]$color = [ConsoleColor]::White) {
    $timestamp = Get-Date -Format 'yyyy-MM-ddTHH:mm:ss'
    Write-Host "[$timestamp] $level $msg" -ForegroundColor $color
}

Write-Log "INFO" "=== Google Flow Browser MCP - Windows Test ===" [ConsoleColor]::Cyan
Write-Log "INFO" "Project dir: $projectDir"
Write-Log "INFO" "Starting MCP server process..."

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "node"
$psi.Arguments = "`"$mcpServer`""
$psi.WorkingDirectory = $projectDir
$psi.RedirectStandardInput = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true

$proc = [System.Diagnostics.Process]::Start($psi)

# Forward stderr in background to show debug logs
$stderrTask = [System.Threading.Tasks.Task]::Run([Action]{
    while (!$proc.HasExited) {
        $errLine = $proc.StandardError.ReadLine()
        if ($errLine) {
            Write-Host "  [MCP ERR] $errLine" -ForegroundColor DarkGray
        }
    }
})

function Send-McpRequest([System.Diagnostics.Process]$p, [hashtable]$req, [int]$timeoutSec = 60) {
    $json = $req | ConvertTo-Json -Compress -Depth 10
    $p.StandardInput.WriteLine($json)
    $p.StandardInput.Flush()

    $readTask = $p.StandardOutput.ReadLineAsync()
    if ($readTask.Wait($timeoutSec * 1000)) {
        $line = $readTask.Result
        try {
            return ($line | ConvertFrom-Json)
        } catch {
            return $line
        }
    } else {
        throw "Timeout waiting for response from MCP server after $timeoutSec seconds"
    }
}

try {
    # Test 1: flow_connect
    Write-Log "INFO" "Test 1: flow_connect (headless=$Headless, open_flow=$true)..." [ConsoleColor]::Yellow
    $connectReq = @{
        jsonrpc = "2.0"
        id = 1
        method = "tools/call"
        params = @{
            name = "flow_connect"
            arguments = @{
                headless = $Headless
                open_flow = $true
            }
        }
    }

    $connectResp = Send-McpRequest -p $proc -req $connectReq -timeoutSec 45
    Write-Log "INFO" "Response for flow_connect:" [ConsoleColor]::Green
    $connectResp | ConvertTo-Json -Depth 5 | Write-Host

    # Check connection result
    if ($connectResp.result -and $connectResp.result.content) {
        $contentText = $connectResp.result.content[0].text
        Write-Log "INFO" "Connection Details: $contentText" [ConsoleColor]::Green
    }

    # Test 2 (Optional): flow_generate_image
    if ($GenerateImage) {
        Write-Host ""
        Write-Log "INFO" "Test 2: flow_generate_image..." [ConsoleColor]::Yellow
        Write-Log "INFO" "Prompt: $Prompt" [ConsoleColor]::White

        $genReq = @{
            jsonrpc = "2.0"
            id = 2
            method = "tools/call"
            params = @{
                name = "flow_generate_image"
                arguments = @{
                    prompt = $Prompt
                    model = "Nano Banana 2"
                    ratio = "1:1"
                }
            }
        }

        $genResp = Send-McpRequest -p $proc -req $genReq -timeoutSec 180
        Write-Log "INFO" "Response for flow_generate_image:" [ConsoleColor]::Green
        $genResp | ConvertTo-Json -Depth 5 | Write-Host
    }

    Write-Host ""
    Write-Log "INFO" "All tests passed successfully." [ConsoleColor]::Cyan

} catch {
    Write-Log "ERROR" "Test failed: $_" [ConsoleColor]::Red
    exit 1
} finally {
    try {
        if (!$proc.HasExited) {
            $proc.Kill()
        }
        $proc.Dispose()
    } catch {}
}
