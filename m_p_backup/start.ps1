$Host.UI.RawUI.WindowTitle = "PulseGuard Launcher"
Clear-Host

Write-Host "===============================================================================" -ForegroundColor Yellow
Write-Host "                PULSEGUARD - ESP32 TELEMETRY LAUNCHER                          " -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Yellow
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not found in PATH! Please install from https://nodejs.org" -ForegroundColor Red
    pause
    exit 1
}

$pulsePath = Join-Path $PSScriptRoot "Pulse-Guard-frontend"

Write-Host "Launching PulseGuard Vite Server on port 5174..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k cd /d `"$pulsePath`" && npx vite --port 5174"
Start-Sleep -Seconds 2
Start-Process "http://localhost:5174/dashboard"

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Yellow
Write-Host "  PulseGuard Dashboard:   http://localhost:5174/dashboard" -ForegroundColor White
Write-Host "  Close Serial Monitor in Arduino IDE before clicking 'Connect ESP32 USB'." -ForegroundColor Gray
Write-Host "===============================================================================" -ForegroundColor Yellow
Write-Host ""
