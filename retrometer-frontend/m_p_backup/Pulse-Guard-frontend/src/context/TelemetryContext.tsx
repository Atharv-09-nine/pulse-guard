import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import type { CalibrationSettings, TelemetryData } from '../types/telemetry'

interface TelemetryContextType {
  telemetry: TelemetryData
  history: TelemetryData[]
  settings: CalibrationSettings
  updateSettings: (newSettings: Partial<CalibrationSettings>) => void
  resetOpticalBuffer: () => void
  serialLogs: string[]
  isWebSerialSupported: boolean
  isSerialConnected: boolean
  hasReceivedData: boolean
  lastPacketTime: number | null
  connectSerial: () => Promise<void>
  disconnectSerial: () => Promise<void>
  sendSerialResetCommand: () => Promise<void>
}

const DEFAULT_SETTINGS: CalibrationSettings = {
  voltageCal: 781.33,
  ctCal: 133.33,
  meterConstant: 3200.0,
  noiseGateVoltage: 15.0,
  noiseGateCurrent: 0.05,
  avgWindowSize: 50,
  lockoutUs: 35000,
  stepThresholdPercent: 25,
}

// Generate realistic waveform snippet from actual measured V and I
function generateWaveform(vRMS: number, iRMS: number, phaseShiftRad = 0.25) {
  const points = []
  const samples = 80
  const peakV = vRMS * Math.SQRT2
  const peakI = iRMS * Math.SQRT2

  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * 4 * Math.PI // 2 full 50Hz cycles
    points.push({
      timeMs: +( (i / samples) * 40 ).toFixed(1), // 40ms
      voltage: +( peakV * Math.sin(t) ).toFixed(2),
      current: +( peakI * Math.sin(t - phaseShiftRad) ).toFixed(3),
    })
  }
  return points
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined)

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CalibrationSettings>(DEFAULT_SETTINGS)
  const [hasReceivedData, setHasReceivedData] = useState(false)
  const [lastPacketTime, setLastPacketTime] = useState<number | null>(null)
  const [serialLogs, setSerialLogs] = useState<string[]>([
    'Waiting for ESP32 serial communication on USB (115200 baud)...',
    'Click "Connect ESP32 USB" above to start streaming from hardware.',
  ])

  // WebSerial connection state
  const [isSerialConnected, setIsSerialConnected] = useState(false)
  const serialPortRef = useRef<any>(null)
  const serialWriterRef = useRef<any>(null)
  const serialConnectedRef = useRef(false)
  const serialReaderRef = useRef<any>(null)

  const isWebSerialSupported = typeof navigator !== 'undefined' && 'serial' in navigator

  // Initial telemetry state: holds previous values, no synthetic fake updates
  const [telemetry, setTelemetry] = useState<TelemetryData>(() => ({
    timestamp: Date.now(),
    vRMS: 0.0,
    iRMS: 0.0,
    realPower: 0.0,
    apparentPower: 0.0,
    powerFactor: 1.0,
    frequency: 50.0,
    pulseCount: 0,
    rawInstantWatts: 0.0,
    stableReportedWatts: 0.0,
    certifiedEnergyKWh: 0.0,
    ctEnergyKWh: 0.0,
    stepChangeTriggered: false,
    idleWatchdogTriggered: false,
    tamperAlert: false,
    tamperSeverity: 'NORMAL',
    discrepancyPercent: 0.0,
    midVoltageDC: 1.65,
    midCurrentDC: 1.65,
    bufferFillCount: 0,
    bufferAverageIntervalSec: 0,
    voltageWaveform: generateWaveform(0, 0),
  }))

  const [history, setHistory] = useState<TelemetryData[]>([])

  const updateSettings = useCallback((newSettings: Partial<CalibrationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

  const resetOpticalBuffer = useCallback(() => {
    setTelemetry((prev) => ({
      ...prev,
      bufferFillCount: 0,
      stableReportedWatts: 0.0,
      rawInstantWatts: 0.0,
    }))
    setSerialLogs((prev) => [
      ...prev.slice(-40),
      `[RESET] Buffer cleared via 'R' Command at ${new Date().toLocaleTimeString()}`,
    ])
  }, [])

  // ESP32 WebSerial connection handler: STRICTLY reads from hardware
  const connectSerial = useCallback(async () => {
    if (!isWebSerialSupported) {
      alert('Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge.')
      return
    }
    try {
      const navSerial = (navigator as any).serial
      const port = await navSerial.requestPort()
      await port.open({ baudRate: 115200 })
      serialPortRef.current = port

      const textDecoder = new TextDecoderStream()
      port.readable.pipeTo(textDecoder.writable)
      const reader = textDecoder.readable.getReader()
      serialReaderRef.current = reader

      const textEncoder = new TextEncoderStream()
      textEncoder.readable.pipeTo(port.writable)
      serialWriterRef.current = textEncoder.writable.getWriter()

      serialConnectedRef.current = true
      setIsSerialConnected(true)
      setSerialLogs((prev) => [
        ...prev,
        `[SERIAL] Connected to ESP32 @ 115200 baud. Waiting for data...`,
      ])

      // Background read loop: strictly takes incoming packets from hardware
      ;(async () => {
        let buffer = ''
        while (serialConnectedRef.current) {
          try {
            const { value, done } = await reader.read()
            if (done) break
            if (value) {
              buffer += value
              const lines = buffer.split('\n')
              buffer = lines.pop() || ''
              for (const line of lines) {
                const trimmed = line.trim()
                if (trimmed) {
                  setSerialLogs((prevLogs) => [...prevLogs.slice(-60), trimmed])
                  const now = Date.now()
                  setHasReceivedData(true)
                  setLastPacketTime(now)

                  // 1. Parse Grid line from mp_backup.ino:
                  // "GRID: 230.1V | CT(D15): 4.120A, 948.5W"
                  const gridMatch = trimmed.match(/GRID:\s*([\d.-]+)V\s*\|\s*CT\(D15\):\s*([\d.-]+)A,\s*([\d.-]+)W/)
                  if (gridMatch) {
                    const v = parseFloat(gridMatch[1])
                    const i = parseFloat(gridMatch[2])
                    const p = parseFloat(gridMatch[3])
                    const s = v * i
                    const pf = s > 0 ? Math.min(1.0, +(p / s).toFixed(3)) : 1.0

                    setTelemetry((prev) => {
                      const delta = Math.abs(p - prev.stableReportedWatts)
                      const discPct = p > 20 ? +((delta / p) * 100).toFixed(1) : 0
                      const isTamper = p > 200 && (prev.stableReportedWatts < 10 || discPct > 40)
                      const severity: 'NORMAL' | 'WARNING' | 'CRITICAL' = discPct > 70 ? 'CRITICAL' : isTamper ? 'WARNING' : 'NORMAL'

                      const updatedPoint: TelemetryData = {
                        ...prev,
                        timestamp: now,
                        vRMS: v,
                        iRMS: i,
                        realPower: p,
                        apparentPower: +s.toFixed(1),
                        powerFactor: pf,
                        discrepancyPercent: discPct,
                        tamperAlert: isTamper,
                        tamperSeverity: severity,
                        voltageWaveform: generateWaveform(v, i),
                      }
                      setHistory((hist) => [...hist.slice(-29), updatedPoint])

                      // Relay to Render backend so phones viewing the site get live data
                      fetch('/api/telemetry', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedPoint),
                      }).catch(() => {})

                      return updatedPoint
                    })
                  }

                  // 2. Parse Optical line from mp_backup.ino:
                  // "--> [OPTICAL D5 #143] Raw: 950.2W | Fast-Tracking Load: 949.1W | Meter E: 0.04469kWh"
                  const optMatch = trimmed.match(/\[OPTICAL D5 #(\d+)\]\s*Raw:\s*([\d.-]+)W\s*\|\s*Fast-Tracking Load:\s*([\d.-]+)W\s*\|\s*Meter E:\s*([\d.-]+)kWh/)
                  if (optMatch) {
                    const pCount = parseInt(optMatch[1], 10)
                    const rawW = parseFloat(optMatch[2])
                    const smoothW = parseFloat(optMatch[3])
                    const certKWh = parseFloat(optMatch[4])

                    setTelemetry((prev) => {
                      const delta = Math.abs(prev.realPower - smoothW)
                      const discPct = prev.realPower > 20 ? +((delta / prev.realPower) * 100).toFixed(1) : 0
                      const isTamper = prev.realPower > 200 && (smoothW < 10 || discPct > 40)
                      const severity: 'NORMAL' | 'WARNING' | 'CRITICAL' = discPct > 70 ? 'CRITICAL' : isTamper ? 'WARNING' : 'NORMAL'

                      const updatedPoint: TelemetryData = {
                        ...prev,
                        pulseCount: pCount,
                        rawInstantWatts: rawW,
                        stableReportedWatts: smoothW,
                        certifiedEnergyKWh: certKWh,
                        idleWatchdogTriggered: false,
                        discrepancyPercent: discPct,
                        tamperAlert: isTamper,
                        tamperSeverity: severity,
                      }

                      // Relay to Render backend
                      fetch('/api/telemetry', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedPoint),
                      }).catch(() => {})

                      return updatedPoint
                    })
                  }

                  // 3. Parse Idle line from mp_backup.ino:
                  // "--> [OPTICAL D5] Idle (0.0 W)"
                  if (trimmed.includes('[OPTICAL D5] Idle')) {
                    setTelemetry((prev) => ({
                      ...prev,
                      stableReportedWatts: 0.0,
                      rawInstantWatts: 0.0,
                      idleWatchdogTriggered: true,
                    }))
                  }

                  // 4. Parse Reset confirmation:
                  if (trimmed.includes('[RESET] Buffer cleared')) {
                    setTelemetry((prev) => ({
                      ...prev,
                      stableReportedWatts: 0.0,
                      rawInstantWatts: 0.0,
                      bufferFillCount: 0,
                    }))
                  }
                }
              }
            }
          } catch (err) {
            console.error('Serial read error:', err)
            break
          }
        }
      })()
    } catch (err: any) {
      console.error('Serial connection error:', err)
      const errStr = String(err)
      if (errStr.includes('NetworkError') || errStr.includes('Failed to open serial port')) {
        alert(
          '⚠️ COM Port is Busy or Locked!\n\n' +
          'On Windows, only one application can access a COM port at a time.\n\n' +
          'Please do the following:\n' +
          '1. Close the "Serial Monitor" or "Serial Plotter" in Arduino IDE.\n' +
          '2. Make sure no other terminal (PuTTY, VS Code) is open on this COM port.\n' +
          '3. Click "Connect ESP32 USB" again.'
        )
      } else {
        alert('Could not open serial port: ' + errStr)
      }
    }
  }, [isWebSerialSupported])

  const disconnectSerial = useCallback(async () => {
    serialConnectedRef.current = false
    if (serialReaderRef.current) {
      try {
        await serialReaderRef.current.cancel()
      } catch (e) {
        console.error(e)
      }
    }
    if (serialPortRef.current) {
      try {
        await serialPortRef.current.close()
      } catch (e) {
        console.error(e)
      }
      serialPortRef.current = null
      setIsSerialConnected(false)
      setSerialLogs((prev) => [
        ...prev,
        `[SERIAL] Disconnected. Holding previous values from ESP32.`,
      ])
    }
  }, [])

  const sendSerialResetCommand = useCallback(async () => {
    if (serialWriterRef.current) {
      try {
        await serialWriterRef.current.write('R\n')
      } catch (e) {
        console.error('Failed to write serial:', e)
      }
    }
    resetOpticalBuffer()
  }, [resetOpticalBuffer])

  // Listen to Server-Sent Events (SSE) from Render backend (for mobile phones and remote devices)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.EventSource) return

    let es: EventSource | null = null
    try {
      es = new EventSource('/api/events')
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data && data.vRMS !== undefined && !serialConnectedRef.current) {
            setHasReceivedData(true)
            setLastPacketTime(data.receivedAt || Date.now())
            setTelemetry((prev) => ({
              ...prev,
              ...data,
              voltageWaveform: generateWaveform(data.vRMS, data.iRMS),
            }))
            setHistory((hist) => [...hist.slice(-29), data])
          }
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }

    return () => {
      if (es) es.close()
    }
  }, [])

  // NOTE: NO FAKE SIMULATION TIMER.
  // Values are strictly taken from ESP32.
  // If no communication, the dashboard strictly holds previous values.

  return (
    <TelemetryContext.Provider
      value={{
        telemetry,
        history,
        settings,
        updateSettings,
        resetOpticalBuffer,
        serialLogs,
        isWebSerialSupported,
        isSerialConnected,
        hasReceivedData,
        lastPacketTime,
        connectSerial,
        disconnectSerial,
        sendSerialResetCommand,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  )
}

export function useTelemetry() {
  const ctx = useContext(TelemetryContext)
  if (!ctx) throw new Error('useTelemetry must be used within TelemetryProvider')
  return ctx
}
