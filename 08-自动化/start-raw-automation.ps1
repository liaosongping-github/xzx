param([switch]$Foreground)
$ErrorActionPreference = 'Stop'

# Codex 等宿主可能同时注入仅大小写不同的 Path/PATH；Windows PowerShell
# 会在 Start-Process 构造环境字典时因此报重复键，启动 worker 前先归一化。
$processEnvironment = [System.Environment]::GetEnvironmentVariables('Process')
$pathKeys = @($processEnvironment.Keys | Where-Object { [string]$_ -ieq 'PATH' })
if ($pathKeys.Count -gt 1) {
    $pathValue = [string]$processEnvironment[$pathKeys[0]]
    foreach ($key in $pathKeys) {
        [System.Environment]::SetEnvironmentVariable([string]$key, $null, 'Process')
    }
    [System.Environment]::SetEnvironmentVariable('Path', $pathValue, 'Process')
}

$workspace = Split-Path -Parent $PSScriptRoot
$nodeCandidates = @(Get-Command node.exe -All -ErrorAction Stop | Select-Object -ExpandProperty Source -Unique)
$node = $nodeCandidates | Where-Object { $_ -notmatch '\\OpenAI\\Codex\\runtimes\\' } | Select-Object -First 1
if (-not $node) { $node = $nodeCandidates | Select-Object -First 1 }
$runtime = Join-Path $PSScriptRoot '.runtime'
New-Item -ItemType Directory -Force -Path $runtime | Out-Null

function Start-Worker([string]$name, [string]$script, [string]$mode) {
    $pidFile = Join-Path $runtime "$name.pid"
    if (Test-Path -LiteralPath $pidFile) {
        $oldPid = Get-Content -LiteralPath $pidFile -ErrorAction SilentlyContinue
        if ($oldPid -and (Get-Process -Id $oldPid -ErrorAction SilentlyContinue)) { return }
    }
    $stdout = Join-Path $runtime "$name.stdout.log"
    $stderr = Join-Path $runtime "$name.stderr.log"
    $process = Start-Process -FilePath $node -ArgumentList @($script, $mode) -WorkingDirectory $workspace -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
    Start-Sleep -Milliseconds 750
    $process.Refresh()
    if ($process.HasExited) {
        $errorText = Get-Content -LiteralPath $stderr -Raw -ErrorAction SilentlyContinue
        throw "$name 启动失败（退出码 $($process.ExitCode)）：$errorText"
    }
    Set-Content -LiteralPath $pidFile -Value $process.Id -Encoding ascii
    if ($Foreground) { Wait-Process -Id $process.Id }
}

Start-Worker 'raw-pipeline' (Join-Path $PSScriptRoot 'raw-pipeline.mjs') 'watch'
Start-Worker 'lark-minutes' (Join-Path $PSScriptRoot 'lark-minutes-bridge.mjs') 'watch'
# 2026-09-15：Agent 聊天自动同步已关闭，登录自启不再拉起 agent-chat worker。
