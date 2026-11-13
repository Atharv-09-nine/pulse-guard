@echo off
title PulseGuard USB-to-Render Bridge
color 0B

echo ===============================================================================
echo                PULSEGUARD ESP32 USB-TO-RENDER CLOUD BRIDGE
echo ===============================================================================
echo.
echo Starting PowerShell bridge to relay ESP32 USB COM port to Render...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0bridge.ps1"

pause
