<#
.SYNOPSIS
    PulseGuard PC-to-Cloud Serial Bridge (Option B)
.DESCRIPTION
    Reads telemetry from an ESP32 connected via USB and relays it to your Render server
    so you can view live readings on your phone from anywhere.
#>

$Host.UI.RawUI.WindowTitle = "PulseGuard USB-to-Render Bridge"
Clear-Host

Write-Host "===============================================================================" -ForegroundColor Yellow
Write-Host "               PULSEGUARD ESP32 USB-TO-RENDER CLOUD BRIDGE                     " -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Yellow
Write-Host ""

# 1. Detect available COM ports
$availablePorts = [System.IO.Ports.SerialPort]::GetPortNames()

if ($availablePorts.Count -eq 0) {
    Write-Host "[ERROR] No COM ports detected! Please plug in your ESP32 via USB." -ForegroundColor Red
    pause
    exit 1
}

Write-Host "Detected COM Ports:" -ForegroundColor Green
for ($i = 0; $i -lt $availablePorts.Count; $i++) {
    Write-Host "  [$($i+1)] $($availablePorts[$i])" -ForegroundColor White
}
Write-Host ""

$portChoice = Read-Host "Select COM Port (1-$($availablePorts.Count)) [Default: 1]"
if ([string]::IsNullOrWhiteSpace($portChoice)) { $portChoice = "1" }
$portIndex = [int]$portChoice - 1
$selectedPort = $availablePorts[$portIndex]

Write-Host ""
$renderUrl = Read-Host "Enter your Render URL (e.g. https://pulse-guard.onrender.com) [or press Enter for localhost:3000]"
if ([string]::IsNullOrWhiteSpace($renderUrl)) {
    $renderUrl = "http://localhost:3000"
}
$renderUrl = $renderUrl.TrimEnd('/')

Write-Host ""
Write-Host "Connecting to $selectedPort @ 115200 baud..." -ForegroundColor Yellow
Write-Host "Target Render Endpoint: $renderUrl/api/telemetry" -ForegroundColor Yellow
Write-Host "Reminder: Make sure Arduino IDE Serial Monitor is CLOSED." -ForegroundColor Gray
Write-Host ""

$serial = New-Object System.IO.Ports.SerialPort $selectedPort, 115200, None, 8, One
$serial.ReadTimeout = 5000

try {
    $serial.Open()
    Write-Host "[CONNECTED] Serial port $selectedPort is open! Streaming to Render..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop.`n" -ForegroundColor Gray

    $latestV = 0.0
    $latestI = 0.0
    $latestP = 0.0
    $latestOptical = 0.0
    $latestPulse = 0
    $latestKWh = 0.0

    while ($serial.IsOpen) {
        try {
            $line = $serial.ReadLine().Trim()
            if (-not [string]::IsNullOrWhiteSpace($line)) {
                # Display to terminal
                Write-Host $line -ForegroundColor DarkGray

                # Parse GRID line: "GRID: 230.1V | CT(D15): 4.120A, 948.5W"
                if ($line -match "GRID:\s*([\d.-]+)V\s*\|\s*CT\(D15\):\s*([\d.-]+)A,\s*([\d.-]+)W") {
                    $latestV = [double]$matches[1]
                    $latestI = [double]$matches[2]
                    $latestP = [double]$matches[3]

                    $payload = @{
                        vRMS = $latestV
                        iRMS = $latestI
                        realPower = $latestP
                        stableReportedWatts = $latestOptical
                        pulseCount = $latestPulse
                        certifiedEnergyKWh = $latestKWh
                        timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
                    } | ConvertTo-Json

                    try {
                        $resp = Invoke-RestMethod -Uri "$renderUrl/api/telemetry" -Method Post -Body $payload -ContentType "application/json" -TimeoutSec 3
                        Write-Host "  -> [SYNCED TO CLOUD] $latestV V | $latestI A | $latestP W (Phone updated)" -ForegroundColor Cyan
                    } catch {
                        Write-Host "  [WARN] Cloud sync error: $_" -ForegroundColor DarkYellow
                    }
                }

                # Parse OPTICAL line
                if ($line -match "\[OPTICAL D5 #(\d+)\]\s*Raw:\s*([\d.-]+)W\s*\|\s*Fast-Tracking Load:\s*([\d.-]+)W\s*\|\s*Meter E:\s*([\d.-]+)kWh") {
                    $latestPulse = [int]$matches[1]
                    $latestOptical = [double]$matches[3]
                    $latestKWh = [double]$matches[4]

                    $payload = @{
                        vRMS = $latestV
                        iRMS = $latestI
                        realPower = $latestP
                        stableReportedWatts = $latestOptical
                        pulseCount = $latestPulse
                        certifiedEnergyKWh = $latestKWh
                        timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
                    } | ConvertTo-Json

                    try {
                        $resp = Invoke-RestMethod -Uri "$renderUrl/api/telemetry" -Method Post -Body $payload -ContentType "application/json" -TimeoutSec 3
                        Write-Host "  -> [OPTICAL SYNCED] Pulses: #$latestPulse | Meter: $latestOptical W | $latestKWh kWh" -ForegroundColor Green
                    } catch {}
                }

                # Parse Idle line
                if ($line -like "*[OPTICAL D5] Idle*") {
                    $latestOptical = 0.0
                    $payload = @{
                        vRMS = $latestV
                        iRMS = $latestI
                        realPower = $latestP
                        stableReportedWatts = 0.0
                        pulseCount = $latestPulse
                        certifiedEnergyKWh = $latestKWh
                        idleWatchdogTriggered = $true
                        timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
                    } | ConvertTo-Json

                    try {
                        $resp = Invoke-RestMethod -Uri "$renderUrl/api/telemetry" -Method Post -Body $payload -ContentType "application/json" -TimeoutSec 3
                    } catch {}
                }
            }
        } catch [TimeoutException] {
            # Timeout is normal when no new characters sent
        } catch {
            Write-Host "[ERROR] Serial Read: $_" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "[ERROR] Could not open $selectedPort: $_" -ForegroundColor Red
    Write-Host "Is the Serial Monitor open in Arduino IDE? Please close it." -ForegroundColor Yellow
} finally {
    if ($serial -and $serial.IsOpen) {
        $serial.Close()
        Write-Host "`n[DISCONNECTED] Closed serial port $selectedPort." -ForegroundColor Yellow
    }
}

pause
