param([switch]$Foreground)
$ErrorActionPreference = 'Stop'
$entry = Join-Path $PSScriptRoot 'start-raw-automation.ps1'
& $entry -Foreground:$Foreground
