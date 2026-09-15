$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent $PSScriptRoot
$launcher = Join-Path $PSScriptRoot 'start-raw-automation.ps1'
$nodeCandidates = @(Get-Command node.exe -All -ErrorAction Stop | Select-Object -ExpandProperty Source -Unique)
$node = $nodeCandidates | Where-Object { $_ -notmatch '\\OpenAI\\Codex\\runtimes\\' } | Select-Object -First 1
if (-not $node) { $node = $nodeCandidates | Select-Object -First 1 }
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$principal = New-ScheduledTaskPrincipal -UserId $currentUser -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit (New-TimeSpan -Days 3650) -MultipleInstances IgnoreNew

$startupAction = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$launcher`"" -WorkingDirectory $workspace
$startupTrigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
Register-ScheduledTask -TaskName 'Liaosongping-Raw-Automation' -Action $startupAction -Trigger $startupTrigger -Principal $principal -Settings $settings -Force | Out-Null

$backfillScript = Join-Path $PSScriptRoot 'lark-minutes-bridge.mjs'
$backfillAction = New-ScheduledTaskAction -Execute $node -Argument "`"$backfillScript`" backfill" -WorkingDirectory $workspace
$backfillTrigger = New-ScheduledTaskTrigger -Daily -At '09:00'
Register-ScheduledTask -TaskName 'Liaosongping-Lark-Minutes-Backfill' -Action $backfillAction -Trigger $backfillTrigger -Principal $principal -Settings $settings -Force | Out-Null

# 2026-09-15：Agent 聊天自动同步已关闭，重装时注销每日聊天补漏，避免再次启用。
Unregister-ScheduledTask -TaskName 'Liaosongping-Agent-Chat-Backfill' -Confirm:$false -ErrorAction SilentlyContinue

Write-Output 'Windows tasks installed:'
Get-ScheduledTask -TaskName 'Liaosongping-Raw-Automation','Liaosongping-Lark-Minutes-Backfill' | Select-Object TaskName,State
