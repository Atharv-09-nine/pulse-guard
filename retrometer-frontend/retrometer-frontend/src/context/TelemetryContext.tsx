import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import type {
  TelemetryData,
  SimulatorControls,
  EnergySource,
  MultiCTChannelCalibration,
  SourcePresetType,
  WifiReceiverConfig,
  WifiStatus,
  RawWifiPacket,
} from '../types/telemetry'

interface TelemetryContextType {
  telemetry: TelemetryData
  history: TelemetryData[]
  controls: SimulatorControls
  updateControls: (newControls: Partial<SimulatorControls>) => void
  isPulseBlinking: boolean
  triggerPulse: () => void
  resetPulseCount: () => void

  // Wi-Fi Telemetry Receiver (ESP32 / Firebase / WebSocket)
  wifiConfig: WifiReceiverConfig
  updateWifiConfig: (newConfig: Partial<WifiReceiverConfig>) => void
  wifiStatus: WifiStatus
  lastPacketTime: number | null
  lastPacketRaw: RawWifiPacket | null
  wifiLogs: string[]
  isConnectingWifi: boolean
  triggerWifiPoll: () => Promise<void>

  // Admin Passcode & Config Lock
  isAdminUnlocked: boolean
  isAdminModalOpen: boolean
  isAdminDrawerOpen: boolean
  setIsAdminModalOpen: (open: boolean) => void
  setIsAdminDrawerOpen: (open: boolean) => void
  unlockAdmin: (passcode: string) => boolean
  lockAdmin: () => void
  setMeterConstant: (constant: 3200 | 1600) => void

  // Multi-CT Energy Sources (Shared Voltage Bus)
  sources: EnergySource[]
  ctCalibrations: MultiCTChannelCalibration[]
  addSource: (newSource: {
    name: string
    preset: SourcePresetType
    ctChannel: number
    isProducer: boolean
    current?: number
    powerFactor?: number
    tariffRate?: number
    calMultiplier?: number
  }) => void
  updateSource: (id: string, updates: Partial<EnergySource>) => void
  removeSource: (id: string) => void
  toggleSourceActive: (id: string) => void
  updateCTCalibration: (channel: number, updates: Partial<MultiCTChannelCalibration>) => void
  totalDemandWatts: number
  totalGenerationWatts: number
  netGridWatts: number
  solarCoveragePct: number
  activeCTCount: number
}

// Strictly OFF by default: zero fake data on load
const DEFAULT_SIMULATOR_CONTROLS: SimulatorControls = {
  active: false,
  loadWatts: 1850,
  powerFactor: 0.94,
  tamperDriftPercent: 0,
  gridNoise: false,
  tariffRatePerKWh: 6.50,
}

const DEFAULT_WIFI_CONFIG: WifiReceiverConfig = {
  mode: 'LOCAL_HTTP',
  localIp: '192.168.1.150',
  localEndpoint: 'http://192.168.1.150/data',
  firebaseUrl: 'https://retrometer-default-rtdb.firebaseio.com/telemetry.json',
  websocketUrl: 'ws://192.168.1.150:81',
  pollIntervalMs: 1000,
  autoConnect: true,
}

// Initial state has ONLY Utility Grid on CT-1 (No solar, No DG)
const DEFAULT_INITIAL_SOURCES: EnergySource[] = [
  {
    id: 'src-grid',
    name: 'Utility Grid (Mains)',
    preset: 'grid',
    ctChannel: 1,
    active: true,
    isProducer: false,
    current: 0.0,
    voltage: 0.0,
    powerFactor: 0.0,
    activeWatts: 0,
    apparentVA: 0,
    todayKWh: 0.0,
    totalKWh: 0.0,
    tariffRate: 6.50,
    calMultiplier: 1.000,
  },
]

// Zero baseline when waiting for real Wi-Fi telemetry
const ZERO_TELEMETRY: TelemetryData = {
  timestamp: Date.now(),
  rtcTime: 'Awaiting Wi-Fi Sync',
  voltage: 0.0,
  current: 0.0,
  activeWatts: 0,
  apparentVA: 0,
  reactiveVAR: 0,
  powerFactor: 0.0,
  frequency: 0.0,
  meterConstant: 3200,
  pulseCount: 0,
  opticalWatts: 0,
  pulseIntervalMs: 0,
  totalKWh: 0.0,
  ctKWh: 0.0,
  todayCostInr: 0.0,
  discrepancyPercent: 0,
  tamperSeverity: 'NORMAL',
  tamperMessage: 'System Ready: Waiting for ESP32 Wi-Fi telemetry stream...',
  tamperDetected: false,
  thdPercent: 0.0,
  h3Percent: 0.0,
  h5Percent: 0.0,
  h7Percent: 0.0,
  gridStatus: 'NORMAL',
  loadBreakdown: {
    hvacWatts: 0,
    hvacPercent: 0,
    kitchenWatts: 0,
    kitchenPercent: 0,
    geyserWatts: 0,
    geyserPercent: 0,
    baseWatts: 0,
    basePercent: 0,
  },
  waveform: [],
}

function initCTCalibrations(sources: EnergySource[]): MultiCTChannelCalibration[] {
  const calibs: MultiCTChannelCalibration[] = []
  for (let ch = 1; ch <= 16; ch++) {
    const matchedSource = sources.find((s) => s.ctChannel === ch)
    calibs.push({
      channel: ch,
      sourceId: matchedSource ? matchedSource.id : null,
      sourceName: matchedSource ? matchedSource.name : `Unassigned CT-${ch}`,
      kiGain: matchedSource ? matchedSource.calMultiplier : 1.000,
      burdenOhms: 3.3,
      phaseOffsetDeg: 0.0,
      active: !!matchedSource?.active,
    })
  }
  return calibs
}

function generateWaveform(vRMS: number, iRMS: number, pf: number) {
  if (vRMS <= 0 || iRMS <= 0) return []
  const points = []
  const samples = 80
  const peakV = vRMS * Math.SQRT2
  const peakI = iRMS * Math.SQRT2
  const phi = Math.acos(Math.max(0.1, Math.min(1.0, pf || 1.0)))

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
  // Test Signal Injector Controls (OFF by default)
  const [controls, setControls] = useState<SimulatorControls>(DEFAULT_SIMULATOR_CONTROLS)
  const [meterConstantVal, setMeterConstantVal] = useState<number>(3200)
  const [isPulseBlinking, setIsPulseBlinking] = useState(false)

  // Wi-Fi Receiver State
  const [wifiConfig, setWifiConfig] = useState<WifiReceiverConfig>(() => {
    try {
      const saved = localStorage.getItem('retrometer-wifi-config')
      if (saved) {
        return { ...DEFAULT_WIFI_CONFIG, ...JSON.parse(saved) }
      }
    } catch (e) {
      console.warn('Could not read retrometer-wifi-config', e)
    }
    return DEFAULT_WIFI_CONFIG
  })

  const [wifiStatus, setWifiStatus] = useState<WifiStatus>('WAITING')
  const [lastPacketTime, setLastPacketTime] = useState<number | null>(null)
  const [lastPacketRaw, setLastPacketRaw] = useState<RawWifiPacket | null>(null)
  const [isConnectingWifi, setIsConnectingWifi] = useState(false)
  const [wifiLogs, setWifiLogs] = useState<string[]>([
    '⚡ RetroMeter Real-Time Metrology Core Initialized.',
    'Wi-Fi Telemetry Receiver active: Waiting for ESP32 packets.',
    'Initial Configuration: Only Utility Grid (CT-1) configured.',
    'Test Signal Injector: OFF (Zero baseline active until real telemetry arrives).',
  ])

  // Save Wi-Fi config to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('retrometer-wifi-config', JSON.stringify(wifiConfig))
    } catch (e) {
      console.warn('Could not persist retrometer-wifi-config', e)
    }
  }, [wifiConfig])

  // Admin Passcode & Drawer Lock States
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false)
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState<boolean>(false)

  // Energy Sources State (Only Utility Grid CT-1 by default, no solar/DG on clean load)
  const [sources, setSources] = useState<EnergySource[]>(() => {
    try {
      const saved = localStorage.getItem('retrometer-sources')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out older hardcoded default demo sources (src-solar, src-dg) if they were legacy defaults
          const cleaned = parsed.filter(
            (s) => s.id === 'src-grid' || s.id.startsWith('src-user-') || s.ctChannel > 3
          )
          if (cleaned.length > 0) return cleaned
        }
      }
    } catch (e) {
      console.warn('Could not read retrometer-sources from localStorage', e)
    }
    return DEFAULT_INITIAL_SOURCES
  })

  // Multi-CT Calibration Channels (1 to 16)
  const [ctCalibrations, setCtCalibrations] = useState<MultiCTChannelCalibration[]>(() =>
    initCTCalibrations(sources)
  )

  // Sync sources changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('retrometer-sources', JSON.stringify(sources))
    } catch (e) {
      console.warn('Could not persist retrometer-sources', e)
    }
  }, [sources])

  // Telemetry Data (Zeroed baseline by default)
  const [telemetry, setTelemetry] = useState<TelemetryData>(ZERO_TELEMETRY)
  const [history, setHistory] = useState<TelemetryData[]>([])

  const prevPulseCountRef = useRef<number>(0)
  const lastPacketTimestampRef = useRef<number>(0)

  const triggerPulse = useCallback(() => {
    setIsPulseBlinking(true)
    setTimeout(() => setIsPulseBlinking(false), 120)
  }, [])

  const resetPulseCount = useCallback(() => {
    setTelemetry((prev) => ({
      ...prev,
      pulseCount: 0,
      totalKWh: 0,
      todayCostInr: 0,
    }))
    setWifiLogs((prev) => [...prev.slice(-40), `[RESET] Energy & pulse counters zeroed at ${new Date().toLocaleTimeString()}`])
  }, [])

  const updateControls = useCallback((newControls: Partial<SimulatorControls>) => {
    setControls((prev) => {
      const updated = { ...prev, ...newControls }
      if (newControls.active !== undefined) {
        setWifiLogs((logs) => [
          ...logs.slice(-40),
          `[ADMIN] Test Signal Injector toggled: ${newControls.active ? 'ACTIVE (Synthetic Signals ON)' : 'OFF (Real Telemetry Enforced)'}`,
        ])
        if (!newControls.active && wifiStatus !== 'CONNECTED') {
          // Revert to zeroed telemetry when test injector is disabled
          setTelemetry(ZERO_TELEMETRY)
        }
      }
      return updated
    })
  }, [wifiStatus])

  const setMeterConstant = useCallback((constant: 3200 | 1600) => {
    setMeterConstantVal(constant)
    setTelemetry((prev) => ({ ...prev, meterConstant: constant }))
    setWifiLogs((prev) => [...prev.slice(-40), `[CONFIG] Meter Constant set to ${constant} imp/kWh`])
  }, [])

  const updateWifiConfig = useCallback((newConfig: Partial<WifiReceiverConfig>) => {
    setWifiConfig((prev) => ({ ...prev, ...newConfig }))
  }, [])

  // Admin Passcode Lock Functions (Passcode: admin1234)
  const unlockAdmin = useCallback((passcode: string): boolean => {
    if (passcode.trim() === 'admin1234') {
      setIsAdminUnlocked(true)
      setIsAdminModalOpen(false)
      setIsAdminDrawerOpen(true)
      setWifiLogs((prev) => [...prev.slice(-40), `[AUTH] Admin Configuration Unlocked at ${new Date().toLocaleTimeString()}`])
      return true
    }
    return false
  }, [])

  const lockAdmin = useCallback(() => {
    setIsAdminUnlocked(false)
    setIsAdminDrawerOpen(false)
    setIsAdminModalOpen(false)
    setWifiLogs((prev) => [...prev.slice(-40), `[AUTH] Admin Configuration Locked: Consumer Mode active.`])
  }, [])

  // --- PARSE AND APPLY INCOMING WI-FI PACKET ---
  const processIncomingPacket = useCallback((raw: RawWifiPacket) => {
    const now = Date.now()
    lastPacketTimestampRef.current = now
    setLastPacketTime(now)
    setLastPacketRaw(raw)
    setWifiStatus('CONNECTED')

    // Voltage extraction
    const v = raw.voltage ?? raw.vRMS ?? raw.v_rms ?? raw.v ?? 0
    // Current extraction
    const i = raw.current ?? raw.iRMS ?? raw.i_rms ?? raw.i1 ?? (raw.ct && raw.ct[0]?.current) ?? 0
    // Power Factor
    const pf = Math.max(0.0, Math.min(1.0, raw.pf ?? raw.powerFactor ?? (v > 0 && i > 0 && (raw.power ?? raw.activeWatts) ? (raw.power ?? raw.activeWatts)! / (v * i) : 0.94)))
    // Active Watts
    const p = raw.power ?? raw.activeWatts ?? raw.active_watts ?? raw.p ?? +(v * i * pf).toFixed(1)
    // Apparent VA
    const s = v > 0 && i > 0 ? +(v * i).toFixed(1) : +(p / (pf || 1.0)).toFixed(1)
    // Reactive VAR
    const varQ = Math.sqrt(Math.max(0, s * s - p * p))
    // Frequency
    const freq = raw.frequency ?? raw.freq ?? (v > 20 ? 50.0 : 0.0)

    // Optical pulses & metrology
    const pOpt = raw.opt_power ?? raw.opticalWatts ?? raw.optWatts ?? p
    const pulses = raw.opt_pulses ?? raw.pulseCount ?? raw.optPulses ?? 0
    const pulseInterval = raw.opt_interval ?? raw.pulseIntervalMs ?? (pOpt > 10 ? Math.round((3600 * 1000) / (meterConstantVal * (pOpt / 1000))) : 0)
    const totKWh = raw.opt_kwh ?? raw.totalKWh ?? raw.optEnergyKWh ?? +(pulses / meterConstantVal).toFixed(4)
    const ctKWhVal = raw.ct_kwh ?? raw.ctEnergyKWh ?? raw.ctKWh ?? totKWh
    const costInr = +(totKWh * controls.tariffRatePerKWh).toFixed(2)

    // Blink optical pulse LED if pulse count incremented
    if (pulses > prevPulseCountRef.current && prevPulseCountRef.current > 0) {
      triggerPulse()
    }
    prevPulseCountRef.current = pulses

    // Discrepancy analysis
    let discPct = 0
    if (p > 20) {
      discPct = +(((p - pOpt) / p) * 100).toFixed(1)
    }
    const epsilon = Math.abs(discPct)
    let tamperSeverity: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL'
    let tamperDetected = false
    let tamperMessage = 'Verified: Optical pulses match ADE7953 CT vector within ±2% metrology standard.'

    if (epsilon > 10 || (p > 150 && pOpt < 10)) {
      tamperSeverity = 'CRITICAL'
      tamperDetected = true
      tamperMessage = `Tamper Alert: Optical divergence is ${discPct}%. Pulse output throttled relative to line current!`
    } else if (epsilon > 2) {
      tamperSeverity = 'WARNING'
      tamperMessage = `Notice: Minor vector divergence (${discPct}%) between ADE7953 CT and utility optical pulses.`
    }

    // Grid Status
    let gridStatus: 'NORMAL' | 'OVERVOLTAGE' | 'UNDERVOLTAGE' | 'TAMPER_ALERT' = (raw.status as any) || 'NORMAL'
    if (v >= 260.0) gridStatus = 'OVERVOLTAGE'
    else if (v <= 200.0 && v > 20.0) gridStatus = 'UNDERVOLTAGE'
    else if (tamperDetected) gridStatus = 'TAMPER_ALERT'

    // Harmonic Spectrum
    const thd = raw.thd ?? raw.thdPercent ?? 4.0
    const h3 = raw.h3 ?? raw.h3Percent ?? 3.4
    const h5 = raw.h5 ?? raw.h5Percent ?? 1.9
    const h7 = raw.h7 ?? raw.h7Percent ?? 0.8

    // NILM Load Breakdown
    let hvacPct = 42, kitchenPct = 26, geyserPct = 18, basePct = 14
    if (p < 400 && p > 0) {
      basePct = 65; kitchenPct = 20; hvacPct = 15; geyserPct = 0
    } else if (p > 3000) {
      hvacPct = 52; geyserPct = 28; kitchenPct = 12; basePct = 8
    } else if (p === 0) {
      basePct = 0; kitchenPct = 0; hvacPct = 0; geyserPct = 0
    }

    const hvacWatts = Math.round(p * (hvacPct / 100))
    const kitchenWatts = Math.round(p * (kitchenPct / 100))
    const geyserWatts = Math.round(p * (geyserPct / 100))
    const baseWatts = Math.max(0, Math.round(p - (hvacWatts + kitchenWatts + geyserWatts)))

    const newPoint: TelemetryData = {
      timestamp: now,
      rtcTime: raw.time || raw.rtcTime || getFormattedRtcTime(new Date(now)),
      voltage: +v.toFixed(1),
      current: +i.toFixed(3),
      activeWatts: +p.toFixed(1),
      apparentVA: +s.toFixed(1),
      reactiveVAR: +varQ.toFixed(1),
      powerFactor: +pf.toFixed(2),
      frequency: +freq.toFixed(2),
      meterConstant: meterConstantVal,
      pulseCount: pulses,
      opticalWatts: +pOpt.toFixed(1),
      pulseIntervalMs: pulseInterval,
      totalKWh: +totKWh.toFixed(4),
      ctKWh: +ctKWhVal.toFixed(4),
      todayCostInr: costInr,
      discrepancyPercent: discPct,
      tamperSeverity,
      tamperMessage,
      tamperDetected,
      thdPercent: +thd.toFixed(1),
      h3Percent: +h3.toFixed(1),
      h5Percent: +h5.toFixed(1),
      h7Percent: +h7.toFixed(1),
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
      waveform: generateWaveform(v, i, pf),
    }

    setTelemetry(newPoint)
    setHistory((prev) => [...prev.slice(-40), newPoint])

    // Update Multi-CT Sources dynamically based on incoming channel data
    setSources((prevSources) => {
      return prevSources.map((source) => {
        if (!source.active) return { ...source, current: 0, activeWatts: 0, apparentVA: 0 }

        let chCurrent = 0
        let chWatts = 0
        let chPF = source.powerFactor || pf

        // 1. Check if packet has explicit multi-channel array 'ct'
        if (Array.isArray(raw.ct)) {
          const match = raw.ct.find((c) => c.channel === source.ctChannel)
          if (match) {
            chCurrent = match.current ?? chCurrent
            chWatts = match.power ?? +(v * chCurrent * (match.pf || pf)).toFixed(1)
            chPF = match.pf ?? chPF
          }
        }
        // 2. Check channel-keyed properties (i1, i2, i3, ct1, ct2...)
        else if ((raw as any)[`i${source.ctChannel}`] !== undefined) {
          chCurrent = (raw as any)[`i${source.ctChannel}`]
          chWatts = +(v * chCurrent * chPF).toFixed(1)
        } else if ((raw as any)[`ct${source.ctChannel}`] !== undefined) {
          chCurrent = (raw as any)[`ct${source.ctChannel}`]
          chWatts = +(v * chCurrent * chPF).toFixed(1)
        }
        // 3. Fallback for CT-1 (Utility Grid) when only single-phase telemetry is transmitted
        else if (source.ctChannel === 1) {
          chCurrent = i
          chWatts = p
          chPF = pf
        }

        const calMul = source.calMultiplier || 1.0
        const activeWattsCalc = +(chWatts * calMul).toFixed(1)
        const apparentVACalc = +(v * chCurrent * calMul).toFixed(1)
        const dKWh = (activeWattsCalc / 1000) * (1.0 / 3600)
        const todayKWh = +(source.todayKWh + dKWh).toFixed(4)

        return {
          ...source,
          voltage: +v.toFixed(1),
          current: +chCurrent.toFixed(2),
          powerFactor: +chPF.toFixed(2),
          activeWatts: activeWattsCalc,
          apparentVA: apparentVACalc,
          todayKWh: todayKWh > 0 ? todayKWh : source.todayKWh,
          totalKWh: todayKWh > 0 ? todayKWh : source.totalKWh,
        }
      })
    })
  }, [meterConstantVal, controls.tariffRatePerKWh, triggerPulse])

  // --- WI-FI POLLING TRIGGER ---
  const triggerWifiPoll = useCallback(async () => {
    setIsConnectingWifi(true)
    try {
      if (wifiConfig.mode === 'LOCAL_HTTP') {
        const targetUrl = wifiConfig.localEndpoint || `http://${wifiConfig.localIp}/data`
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2500)

        const res = await fetch(targetUrl, { signal: controller.signal })
        clearTimeout(timeoutId)

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        const data = await res.json()
        processIncomingPacket(data)
        setWifiLogs((logs) => [
          ...logs.slice(-40),
          `[WIFI-HTTP] Received packet from ${targetUrl} (V:${data.voltage || data.vRMS || 0}V, P:${data.power || data.activeWatts || 0}W)`,
        ])
      } else if (wifiConfig.mode === 'CLOUD_FIREBASE') {
        const targetUrl = wifiConfig.firebaseUrl
        if (!targetUrl) throw new Error('Firebase URL is not configured')
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        const res = await fetch(targetUrl, { signal: controller.signal })
        clearTimeout(timeoutId)

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        const data = await res.json()
        if (data) {
          processIncomingPacket(data)
          setWifiLogs((logs) => [
            ...logs.slice(-40),
            `[WIFI-CLOUD] Synced telemetry from Firebase Realtime DB.`,
          ])
        }
      }
    } catch (err: any) {
      const isAbort = err.name === 'AbortError'
      const errMsg = isAbort ? 'Connection Timed Out' : err.message || 'Offline'
      // Only set offline if no packet received within the last 4 seconds
      if (Date.now() - lastPacketTimestampRef.current > 4000) {
        setWifiStatus('WAITING')
      }
      setWifiLogs((logs) => [
        ...logs.slice(-40),
        `[WIFI-WARN] Polling failed (${errMsg}). Waiting for telemetry...`,
      ])
    } finally {
      setIsConnectingWifi(false)
    }
  }, [wifiConfig, processIncomingPacket])

  // --- RECURRING WI-FI RECEIVER POLLING LOOP ---
  useEffect(() => {
    if (!wifiConfig.autoConnect) {
      setWifiStatus('OFFLINE')
      return
    }

    // Immediate first attempt
    triggerWifiPoll()

    const interval = setInterval(() => {
      // If Test Signal Injector is ACTIVE, do not poll to avoid overwriting test data
      if (controls.active) return
      triggerWifiPoll()
    }, Math.max(800, wifiConfig.pollIntervalMs || 1000))

    return () => clearInterval(interval)
  }, [wifiConfig, controls.active, triggerWifiPoll])

  // --- TEST SIGNAL INJECTOR ENGINE (ADMIN ONLY, OFF BY DEFAULT) ---
  useEffect(() => {
    // Strictly runs ONLY when explicitly enabled by Admin
    if (!controls.active) return

    const intervalId = setInterval(() => {
      const now = Date.now()
      const noise = controls.gridNoise ? (Math.random() - 0.5) : 0

      const timeSec = now / 1000
      const baseV = 230.2 + Math.sin(timeSec / 8) * 1.4 + noise * 0.6
      const voltage = +baseV.toFixed(1)

      const pElecBase = controls.loadWatts + noise * 12
      const activeWatts = Math.max(0, +pElecBase.toFixed(1))
      const driftMult = 1 - controls.tamperDriftPercent / 100
      const opticalWatts = Math.max(0, +(activeWatts * driftMult).toFixed(1))
      const pf = Math.max(0.65, Math.min(1.0, +(controls.powerFactor + noise * 0.005).toFixed(2)))
      const frequency = +(50.0 + Math.sin(timeSec / 4) * 0.03 + noise * 0.01).toFixed(2)

      const apparentVA = activeWatts > 0 ? +(activeWatts / pf).toFixed(1) : 0
      const current = voltage > 0 ? +(apparentVA / voltage).toFixed(3) : 0
      const reactiveVAR = +Math.sqrt(Math.max(0, apparentVA * apparentVA - activeWatts * activeWatts)).toFixed(1)

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
        tamperMessage = `Notice: Minor vector divergence (${discPct}%) between ADE7953 CT and utility optical pulses.`
      }

      let gridStatus: 'NORMAL' | 'OVERVOLTAGE' | 'UNDERVOLTAGE' | 'TAMPER_ALERT' = 'NORMAL'
      if (voltage >= 260.0) gridStatus = 'OVERVOLTAGE'
      else if (voltage <= 200.0 && voltage > 20.0) gridStatus = 'UNDERVOLTAGE'
      else if (tamperDetected) gridStatus = 'TAMPER_ALERT'

      const kw = opticalWatts / 1000
      const pulseIntervalMs = kw > 0.005 ? Math.round((3600 * 1000) / (meterConstantVal * kw)) : 0

      let hvacPct = 42, kitchenPct = 26, geyserPct = 18, basePct = 14
      if (activeWatts < 400) {
        basePct = 65; kitchenPct = 20; hvacPct = 15; geyserPct = 0
      } else if (activeWatts > 3000) {
        hvacPct = 52; geyserPct = 28; kitchenPct = 12; basePct = 8
      }

      const hvacWatts = Math.round(activeWatts * (hvacPct / 100))
      const kitchenWatts = Math.round(activeWatts * (kitchenPct / 100))
      const geyserWatts = Math.round(activeWatts * (geyserPct / 100))
      const baseWatts = Math.max(0, Math.round(activeWatts - (hvacWatts + kitchenWatts + geyserWatts)))

      const testPoint: TelemetryData = {
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
        pulseCount: 15420,
        opticalWatts,
        pulseIntervalMs,
        totalKWh: 4.8214,
        ctKWh: 4.8214,
        todayCostInr: +(4.8214 * controls.tariffRatePerKWh).toFixed(2),
        discrepancyPercent: discPct,
        tamperSeverity,
        tamperMessage,
        tamperDetected,
        thdPercent: 4.0,
        h3Percent: 3.4,
        h5Percent: 1.9,
        h7Percent: 0.8,
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

      setTelemetry(testPoint)
      setHistory((prev) => [...prev.slice(-40), testPoint])

      // Update source cards for test
      setSources((prev) =>
        prev.map((s) => ({
          ...s,
          voltage,
          current: s.active ? (s.preset === 'grid' ? current : 3.5) : 0,
          activeWatts: s.active ? (s.preset === 'grid' ? activeWatts : 800) : 0,
          apparentVA: s.active ? apparentVA : 0,
        }))
      )
    }, 250)

    return () => clearInterval(intervalId)
  }, [controls, meterConstantVal])

  // --- MULTI-CT SOURCE METHODS ---
  const addSource = useCallback((newSource: {
    name: string
    preset: SourcePresetType
    ctChannel: number
    isProducer: boolean
    current?: number
    powerFactor?: number
    tariffRate?: number
    calMultiplier?: number
  }) => {
    const id = `src-user-${Date.now()}`
    const defaultCurrent = newSource.current ?? (newSource.isProducer ? 3.5 : 4.0)
    const pf = newSource.powerFactor ?? 0.95
    const tariffRate = newSource.tariffRate ?? 6.50
    const calMult = newSource.calMultiplier ?? 1.000

    setSources((prev) => {
      const created: EnergySource = {
        id,
        name: newSource.name,
        preset: newSource.preset,
        ctChannel: newSource.ctChannel,
        active: true,
        isProducer: newSource.isProducer,
        current: defaultCurrent,
        voltage: telemetry.voltage || 230.0,
        powerFactor: pf,
        activeWatts: +((telemetry.voltage || 230.0) * defaultCurrent * pf * calMult).toFixed(1),
        apparentVA: +((telemetry.voltage || 230.0) * defaultCurrent).toFixed(1),
        todayKWh: 0.0000,
        totalKWh: 0.0000,
        tariffRate,
        calMultiplier: calMult,
      }
      return [...prev, created]
    })

    setCtCalibrations((prev) =>
      prev.map((c) =>
        c.channel === newSource.ctChannel
          ? { ...c, sourceId: id, sourceName: newSource.name, active: true, kiGain: calMult }
          : c
      )
    )

    setWifiLogs((prev) => [
      ...prev.slice(-40),
      `[USER] Added Source "${newSource.name}" on CT-${newSource.ctChannel} (${newSource.isProducer ? 'Producer' : 'Consumer'})`,
    ])
  }, [telemetry.voltage])

  const updateSource = useCallback((id: string, updates: Partial<EnergySource>) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }, [])

  const removeSource = useCallback((id: string) => {
    setSources((prev) => {
      const target = prev.find((s) => s.id === id)
      // Never allow deletion of CT-1 Utility Grid
      if (target && (target.ctChannel === 1 || target.id === 'src-grid')) {
        alert('Cannot remove the primary Utility Grid meter on CT-1.')
        return prev
      }

      if (target) {
        setCtCalibrations((cPrev) =>
          cPrev.map((c) =>
            c.channel === target.ctChannel
              ? { ...c, sourceId: null, sourceName: `Unassigned CT-${c.channel}`, active: false }
              : c
          )
        )
        setWifiLogs((lPrev) => [
          ...lPrev.slice(-40),
          `[USER] Removed Source "${target.name}" from Channel CT-${target.ctChannel}`,
        ])
      }
      return prev.filter((s) => s.id !== id)
    })
  }, [])

  const toggleSourceActive = useCallback((id: string) => {
    setSources((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        const nextActive = !s.active
        setCtCalibrations((cPrev) =>
          cPrev.map((c) => (c.channel === s.ctChannel ? { ...c, active: nextActive } : c))
        )
        setWifiLogs((lPrev) => [
          ...lPrev.slice(-40),
          `[USER] ${s.name} (CT-${s.ctChannel}) set to ${nextActive ? 'ACTIVE' : 'STANDBY'}`,
        ])
        return {
          ...s,
          active: nextActive,
          current: nextActive ? (s.current > 0 ? s.current : 3.5) : 0,
        }
      })
    )
  }, [])

  const updateCTCalibration = useCallback((channel: number, updates: Partial<MultiCTChannelCalibration>) => {
    setCtCalibrations((prev) =>
      prev.map((c) => (c.channel === channel ? { ...c, ...updates } : c))
    )
    if (updates.kiGain !== undefined) {
      setSources((prev) =>
        prev.map((s) => (s.ctChannel === channel ? { ...s, calMultiplier: updates.kiGain! } : s))
      )
    }
  }, [])

  // Derived Aggregates
  const totalDemandWatts = telemetry.activeWatts
  const totalGenerationWatts = sources
    .filter((s) => s.active && s.isProducer)
    .reduce((sum, s) => sum + s.activeWatts, 0)
  const gridSource = sources.find((s) => s.preset === 'grid' || s.ctChannel === 1)
  const netGridWatts = gridSource && gridSource.active ? gridSource.activeWatts : telemetry.activeWatts
  const solarSources = sources.filter((s) => s.preset === 'solar' && s.active)
  const solarGen = solarSources.reduce((sum, s) => sum + s.activeWatts, 0)
  const solarCoveragePct = totalDemandWatts > 0 ? Math.min(100, +((solarGen / totalDemandWatts) * 100).toFixed(1)) : 0
  const activeCTCount = sources.filter((s) => s.active).length

  return (
    <TelemetryContext.Provider
      value={{
        telemetry,
        history,
        controls,
        updateControls,
        isPulseBlinking,
        triggerPulse,
        resetPulseCount,

        // Wi-Fi Telemetry Receiver
        wifiConfig,
        updateWifiConfig,
        wifiStatus,
        lastPacketTime,
        lastPacketRaw,
        wifiLogs,
        isConnectingWifi,
        triggerWifiPoll,

        // Admin Passcode Lock
        isAdminUnlocked,
        isAdminModalOpen,
        isAdminDrawerOpen,
        setIsAdminModalOpen,
        setIsAdminDrawerOpen,
        unlockAdmin,
        lockAdmin,
        setMeterConstant,

        // Multi-CT Sources
        sources,
        ctCalibrations,
        addSource,
        updateSource,
        removeSource,
        toggleSourceActive,
        updateCTCalibration,
        totalDemandWatts,
        totalGenerationWatts,
        netGridWatts,
        solarCoveragePct,
        activeCTCount,
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
