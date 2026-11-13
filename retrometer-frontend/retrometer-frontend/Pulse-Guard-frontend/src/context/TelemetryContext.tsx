import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import type { TelemetryData, SimulatorControls } from '../types/telemetry'
import { HARDWARE_SPECS } from '../config/hardwareMap'

interface TelemetryContextType {
  telemetry: TelemetryData
  history: TelemetryData[]
  controls: SimulatorControls
  updateControls: (newControls: Partial<SimulatorControls>) => void
  isPulseBlinking: boolean
  triggerPulse: () => void
  connectionMode: 'SIMULATOR' | 'HARDWARE_SERIAL' | 'HARDWARE_WIFI'
  setConnectionMode: (mode: 'SIMULATOR' | 'HARDWARE_SERIAL' | 'HARDWARE_WIFI') => void
  hardwareIp: string
  setHardwareIp: (ip: string) => void
  isSerialConnected: boolean
  connectSerial: () => Promise<void>
  disconnectSerial: () => Promise<void>
  serialLogs: string[]
  resetPulseCount: () => void

  // Admin Passcode & Config Lock
  isAdminUnlocked: boolean
  isAdminModalOpen: boolean
  isAdminDrawerOpen: boolean
  setIsAdminModalOpen: (open: boolean) => void
  setIsAdminDrawerOpen: (open: boolean) => void
  unlockAdmin: (passcode: string) => boolean
  lockAdmin: () => void
  setMeterConstant: (constant: 3200 | 1600) => void
}

const DEFAULT_CONTROLS: SimulatorControls = {
  active: true,
  loadWatts: 1850,
  powerFactor: 0.94,
  tamperDriftPercent: 0,
  gridNoise: true,
  tariffRatePerKWh: 6.50, // Standard residential tariff in ₹/kWh
}

function generateWaveform(vRMS: number, iRMS: number, pf: number) {
  const points = []
  const samples = 80
  const peakV = vRMS * Math.SQRT2
  const peakI = iRMS * Math.SQRT2
  const phi = Math.acos(Math.max(0.1, Math.min(1.0, pf)))

  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * 4 * Math.PI
    points.push({
      timeMs: +((i / samples) * 40).toFixed(1),
      voltage: +(peakV * Math.sin(t)).toFixed(2),
      current: +(peakI * Math.sin(t - phi)).toFixed(3),
    })
  }
  return points
}

function getFormattedRtcTime(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${s}`
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined)

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [controls, setControls] = useState<SimulatorControls>(DEFAULT_CONTROLS)
  const [meterConstantVal, setMeterConstantVal] = useState<number>(3200)
  const [connectionMode, setConnectionMode] = useState<'SIMULATOR' | 'HARDWARE_SERIAL' | 'HARDWARE_WIFI'>('SIMULATOR')
  const [hardwareIp, setHardwareIp] = useState<string>('192.168.1.150')
  const [isPulseBlinking, setIsPulseBlinking] = useState(false)
  const [isSerialConnected, setIsSerialConnected] = useState(false)
  const [serialLogs, setSerialLogs] = useState<string[]>([
    '⚡ RetroMeter Dual-Domain Metrology Engine Initialized.',
    'System Meter Constant: 3200 imp/kWh (ADE7953 + BPW34 on GPIO 7).',
    'Interactive Simulator Engine running: Live physics generation active.',
  ])

  // Admin Lock States
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false)
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState<boolean>(false)

  const serialPortRef = useRef<any>(null)
  const serialReaderRef = useRef<any>(null)
  const lastPulseTimeRef = useRef<number>(Date.now())
  const accumulatedEnergyKWhRef = useRef<number>(4.8214)
  const pulseCounterRef = useRef<number>(Math.floor(4.8214 * 3200))

  // Initial State
  const [telemetry, setTelemetry] = useState<TelemetryData>(() => {
    const pElec = 1850
    const pf = 0.94
    const v = 230.4
    const s = pElec / pf
    const i = s / v
    const pOpt = pElec
    const discPct = 0
    const pulseInterval = (3600 * 1000) / (3200 * (pOpt / 1000))

    return {
      timestamp: Date.now(),
      rtcTime: getFormattedRtcTime(),
      voltage: v,
      current: +i.toFixed(3),
      activeWatts: pElec,
      apparentVA: +s.toFixed(1),
      reactiveVAR: +Math.sqrt(Math.max(0, s * s - pElec * pElec)).toFixed(1),
      powerFactor: pf,
      frequency: 50.02,
      meterConstant: 3200,
      pulseCount: pulseCounterRef.current,
      opticalWatts: pOpt,
      pulseIntervalMs: Math.round(pulseInterval),
      totalKWh: +accumulatedEnergyKWhRef.current.toFixed(4),
      ctKWh: +accumulatedEnergyKWhRef.current.toFixed(4),
      todayCostInr: +(accumulatedEnergyKWhRef.current * DEFAULT_CONTROLS.tariffRatePerKWh).toFixed(2),
      discrepancyPercent: discPct,
      tamperSeverity: 'NORMAL',
      tamperMessage: 'Normal Sync: Optical pulses match ADE7953 CT vector.',
      tamperDetected: false,
      thdPercent: 4.0,
      h3Percent: 3.4,
      h5Percent: 1.9,
      h7Percent: 0.8,
      gridStatus: 'NORMAL',
      loadBreakdown: {
        hvacWatts: Math.round(pElec * 0.42),
        hvacPercent: 42,
        kitchenWatts: Math.round(pElec * 0.26),
        kitchenPercent: 26,
        geyserWatts: Math.round(pElec * 0.18),
        geyserPercent: 18,
        baseWatts: Math.round(pElec * 0.14),
        basePercent: 14,
      },
      waveform: generateWaveform(v, i, pf),
    }
  })

  const [history, setHistory] = useState<TelemetryData[]>([])

  const updateControls = useCallback((newControls: Partial<SimulatorControls>) => {
    setControls((prev) => ({ ...prev, ...newControls }))
  }, [])

  const setMeterConstant = useCallback((constant: 3200 | 1600) => {
    setMeterConstantVal(constant)
    setTelemetry((prev) => ({ ...prev, meterConstant: constant }))
    setSerialLogs((prev) => [...prev.slice(-40), `[CONFIG] Meter Constant updated to ${constant} imp/kWh`])
  }, [])

  const triggerPulse = useCallback(() => {
    setIsPulseBlinking(true)
    setTimeout(() => setIsPulseBlinking(false), 120)
  }, [])

  const resetPulseCount = useCallback(() => {
    pulseCounterRef.current = 0
    accumulatedEnergyKWhRef.current = 0
    setTelemetry((prev) => ({
      ...prev,
      pulseCount: 0,
      totalKWh: 0,
      todayCostInr: 0,
    }))
    setSerialLogs((prev) => [...prev.slice(-40), `[RESET] Energy & pulse counters zeroed at ${new Date().toLocaleTimeString()}`])
  }, [])

  // Admin Passcode Lock Functions (Passcode: admin1234)
  const unlockAdmin = useCallback((passcode: string): boolean => {
    if (passcode.trim() === 'admin1234') {
      setIsAdminUnlocked(true)
      setIsAdminModalOpen(false)
      setIsAdminDrawerOpen(true)
      setSerialLogs((prev) => [...prev.slice(-40), `[AUTH] Admin Configuration Unlocked at ${new Date().toLocaleTimeString()}`])
      return true
    }
    return false
  }, [])

  const lockAdmin = useCallback(() => {
    setIsAdminUnlocked(false)
    setIsAdminDrawerOpen(false)
    setIsAdminModalOpen(false)
    setSerialLogs((prev) => [...prev.slice(-40), `[AUTH] Admin Configuration Locked: Consumer Mode active.`])
  }, [])

  // --- SIMULATOR ENGINE LOOP ---
  useEffect(() => {
    if (connectionMode !== 'SIMULATOR') return

    const intervalId = setInterval(() => {
      const now = Date.now()
      const noise = controls.gridNoise ? (Math.random() - 0.5) : 0

      // Realistic grid voltage ~230V
      const timeSec = now / 1000
      const baseV = 230.2 + Math.sin(timeSec / 8) * 1.4 + noise * 0.6
      const voltage = +baseV.toFixed(1)

      // Electrical CT Active Power (P_elec)
      const pElecBase = controls.loadWatts + noise * 12
      const activeWatts = Math.max(0, +pElecBase.toFixed(1))

      // Optical Power (P_opt) affected by Tamper Drift %
      const driftMult = 1 - controls.tamperDriftPercent / 100
      const opticalWatts = Math.max(0, +(activeWatts * driftMult).toFixed(1))

      // Power Factor
      const pf = Math.max(0.65, Math.min(1.0, +(controls.powerFactor + noise * 0.005).toFixed(2)))

      // Frequency nominal 50Hz
      const frequency = +(50.0 + Math.sin(timeSec / 4) * 0.03 + noise * 0.01).toFixed(2)

      // Apparent & Current
      const apparentVA = activeWatts > 0 ? +(activeWatts / pf).toFixed(1) : 0
      const current = voltage > 0 ? +(apparentVA / voltage).toFixed(3) : 0
      const reactiveVAR = +Math.sqrt(Math.max(0, apparentVA * apparentVA - activeWatts * activeWatts)).toFixed(1)

      // Discrepancy & Anti-Tamper Logic
      // epsilon = |(activeWatts - opticalWatts) / activeWatts| * 100
      let discPct = 0
      if (activeWatts > 20) {
        discPct = +(((activeWatts - opticalWatts) / activeWatts) * 100).toFixed(1)
      }

      const epsilon = Math.abs(discPct)
      let tamperSeverity: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL'
      let tamperMessage = 'Verified: Optical pulses match ADE7953 CT vector within ±2% metrology standard.'
      let tamperDetected = false

      if (epsilon > 10 || (activeWatts > 150 && opticalWatts < 10)) {
        tamperSeverity = 'CRITICAL'
        tamperDetected = true
        tamperMessage = `Tamper Alert: Optical divergence is ${discPct}%. Pulse output throttled relative to line current!`
      } else if (epsilon > 2) {
        tamperSeverity = 'WARNING'
        tamperDetected = false
        tamperMessage = `Notice: Minor vector divergence (${discPct}%) between ADE7953 CT and utility optical pulses.`
      }

      // Grid Status
      let gridStatus: 'NORMAL' | 'OVERVOLTAGE' | 'UNDERVOLTAGE' | 'TAMPER_ALERT' = 'NORMAL'
      if (voltage >= 260.0) {
        gridStatus = 'OVERVOLTAGE'
      } else if (voltage <= 200.0 && voltage > 20.0) {
        gridStatus = 'UNDERVOLTAGE'
      } else if (tamperDetected) {
        gridStatus = 'TAMPER_ALERT'
      }

      // Pulse Interval in ms
      const kw = opticalWatts / 1000
      const pulseIntervalMs = kw > 0.005 ? Math.round((3600 * 1000) / (meterConstantVal * kw)) : 60000

      // Pulse Timing Simulation
      const elapsedSinceLastPulse = now - lastPulseTimeRef.current
      if (opticalWatts > 10 && elapsedSinceLastPulse >= pulseIntervalMs) {
        lastPulseTimeRef.current = now
        pulseCounterRef.current += 1
        triggerPulse()
      }

      // Energy Accumulation
      const dtHours = 0.25 / 3600
      const dKWh = (opticalWatts / 1000) * dtHours
      accumulatedEnergyKWhRef.current += dKWh
      const totalKWh = +accumulatedEnergyKWhRef.current.toFixed(4)
      const todayCostInr = +(totalKWh * controls.tariffRatePerKWh).toFixed(2)

      // Harmonics (Goertzel Simulation)
      const h3 = +(3.4 + (1 - pf) * 12 + noise * 0.2).toFixed(1)
      const h5 = +(1.9 + (1 - pf) * 6 + noise * 0.1).toFixed(1)
      const h7 = +(0.8 + (1 - pf) * 3 + noise * 0.1).toFixed(1)
      const thd = +Math.sqrt(h3 * h3 + h5 * h5 + h7 * h7).toFixed(1)

      // NILM Load Breakdown
      let hvacPct = 42
      let kitchenPct = 26
      let geyserPct = 18
      let basePct = 14

      if (activeWatts < 400) {
        basePct = 65
        kitchenPct = 20
        hvacPct = 15
        geyserPct = 0
      } else if (activeWatts > 3000) {
        hvacPct = 52
        geyserPct = 28
        kitchenPct = 12
        basePct = 8
      }

      const hvacWatts = Math.round(activeWatts * (hvacPct / 100))
      const kitchenWatts = Math.round(activeWatts * (kitchenPct / 100))
      const geyserWatts = Math.round(activeWatts * (geyserPct / 100))
      const baseWatts = Math.max(0, Math.round(activeWatts - (hvacWatts + kitchenWatts + geyserWatts)))

      const newPoint: TelemetryData = {
        timestamp: now,
        rtcTime: getFormattedRtcTime(new Date(now)),
        voltage,
        current,
        activeWatts,
        apparentVA,
        reactiveVAR,
        powerFactor: pf,
        frequency,
        meterConstant: meterConstantVal,
        pulseCount: pulseCounterRef.current,
        opticalWatts,
        pulseIntervalMs,
        totalKWh,
        ctKWh: totalKWh,
        todayCostInr,
        discrepancyPercent: discPct,
        tamperSeverity,
        tamperMessage,
        tamperDetected,
        thdPercent: thd,
        h3Percent: h3,
        h5Percent: h5,
        h7Percent: h7,
        gridStatus,
        loadBreakdown: {
          hvacWatts,
          hvacPercent: hvacPct,
          kitchenWatts,
          kitchenPercent: kitchenPct,
          geyserWatts,
          geyserPercent: geyserPct,
          baseWatts,
          basePercent: basePct,
        },
        waveform: generateWaveform(voltage, current, pf),
      }

      setTelemetry(newPoint)
      setHistory((prev) => [...prev.slice(-40), newPoint])
    }, 250)

    return () => clearInterval(intervalId)
  }, [connectionMode, controls, meterConstantVal, triggerPulse])

  // --- HARDWARE WEBSERIAL CONNECT ---
  const connectSerial = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('serial' in navigator)) {
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

      setIsSerialConnected(true)
      setConnectionMode('HARDWARE_SERIAL')
      setSerialLogs((prev) => [...prev, `[SERIAL] Connected to ESP32 @ 115200 baud.`])

      ;(async () => {
        let buffer = ''
        while (true) {
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
                  if (trimmed.includes('ADE7953:') && trimmed.includes('V:')) {
                    const vM = trimmed.match(/V:\s*([\d.]+)/)
                    const iM = trimmed.match(/I:\s*([\d.]+)/)
                    const pM = trimmed.match(/P:\s*([\d.]+)/)
                    const pfM = trimmed.match(/PF:\s*([\d.]+)/)
                    if (vM && iM && pM && pfM) {
                      const v = parseFloat(vM[1])
                      const i = parseFloat(iM[1])
                      const p = parseFloat(pM[1])
                      const pf = parseFloat(pfM[1])
                      setTelemetry((prev) => ({
                        ...prev,
                        voltage: v,
                        current: i,
                        activeWatts: p,
                        powerFactor: pf,
                        apparentVA: +(p / (pf || 1)).toFixed(1),
                        waveform: generateWaveform(v, i, pf),
                      }))
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.error('Serial stream error:', e)
            break
          }
        }
      })()
    } catch (err: any) {
      alert(`Could not open serial port: ${err.message || err}`)
    }
  }, [])

  const disconnectSerial = useCallback(async () => {
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
    }
    serialPortRef.current = null
    setIsSerialConnected(false)
    setConnectionMode('SIMULATOR')
    setSerialLogs((prev) => [...prev, `[SERIAL] Disconnected. Restored simulator engine.`])
  }, [])

  return (
    <TelemetryContext.Provider
      value={{
        telemetry,
        history,
        controls,
        updateControls,
        isPulseBlinking,
        triggerPulse,
        connectionMode,
        setConnectionMode,
        hardwareIp,
        setHardwareIp,
        isSerialConnected,
        connectSerial,
        disconnectSerial,
        serialLogs,
        resetPulseCount,

        isAdminUnlocked,
        isAdminModalOpen,
        isAdminDrawerOpen,
        setIsAdminModalOpen,
        setIsAdminDrawerOpen,
        unlockAdmin,
        lockAdmin,
        setMeterConstant,
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
