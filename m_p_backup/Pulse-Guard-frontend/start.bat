@echo off
title PulseGuard - AC Grid & Optical Meter Telemetry
color 0E

echo ===============================================================================
echo                PULSEGUARD - ESP32 TELEMETRY WEB APP
echo ===============================================================================
echo.
echo Starting Vite dev server on port 5174...
cd /d "%~dp0"
start "PulseGuard Vite Server" cmd /k "npx vite --port 5174"
timeout /t 2 >nul
echo Opening Dashboard...
start http://localhost:5174/dashboard
echo.
echo Application live at: http://localhost:5174/dashboard
echo.
pause
