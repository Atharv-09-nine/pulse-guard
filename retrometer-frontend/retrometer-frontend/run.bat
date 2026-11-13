@echo off
title PulseGuard - AC Grid & Optical Telemetry
color 0E

echo ===============================================================================
echo                PULSEGUARD - ESP32 TELEMETRY SYSTEM LAUNCHER
echo ===============================================================================
echo.
echo [1/2] Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! Please install from https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js detected:
node -v

echo.
echo [2/2] Launching PulseGuard server (Port 5174)...
cd /d "%~dp0Pulse-Guard-frontend"
start "PulseGuard Vite Server" cmd /k "npx vite --port 5174"
timeout /t 2 >nul

echo Opening browser...
start http://localhost:5174/dashboard

echo.
echo ===============================================================================
echo  PulseGuard is running at: http://localhost:5174/dashboard
echo.
echo  TO CONNECT ESP32:
echo   1. Close Serial Monitor in Arduino IDE (to free the COM port)
echo   2. Click "Connect ESP32 USB" on the top right
echo ===============================================================================
echo.
pause
