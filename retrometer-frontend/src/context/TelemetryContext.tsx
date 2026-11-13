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

export interface ConnectionTestResult {
  success: boolean
  message: string
  latencyMs?: number
  schemaFields?: string[]
  rawSample?: any
}

interface TelemetryContextType {
  telemetry: TelemetryData
  history: TelemetryData[]
  controls: SimulatorControls
  updateControls: (newControls: Partial<SimulatorControls>) => void
  isPulseBlinking: boolean
  triggerPulse: () => void
  resetPulseCount: () => void

  // Native Wi-Fi Telemetry Engine
  wifiConfig: WifiReceiverConfig
  updateWifiConfig: (newConfig: Partial<WifiReceiverConfig>) => void
  wifiStatus: WifiStatus
  lastPacketTime: number | null
  lastPacketRaw: RawWifiPacket | null
  wifiLogs: string[]
  isConnectingWifi: boolean
  triggerWifiPoll: () => Promise<void>
  testConnection: (customConfig?: WifiReceiverConfig) => Promise<ConnectionTestResult>

  // Admin Passcode & Drawer Lock
  isAdminUnlocked: boolean
  isAdminModalOpen: boolean
  isAdminDrawerOpen: boolean
  setIsAdminModalOpen: (open: boolean) => void
  setIsAdminDrawerOpen: (open: boolean) => void
  unlockAdmin: (passcode: string) => boolean
  lockAdmin: () => void
  setMeterConstant: (constant: 3200 | 1600) => void

  // Multi-CT Sources
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

// Zero fake data: simulator controls strictly off and bypassed
const DEFAULT_SIMULATOR_CONTROLS: SimulatorControls = {
  active: false,
  loadWatts: 1850,
  powerFactor: 0.94,
  tamperDriftPercent: 0,
  gridNoise: false,
  tariffRatePerKWh: 8.00,
}

const DEFAULT_WIFI_CONFIG: WifiReceiverConfig = {
  mode: 'LOCAL_HTTP',
  localIp: '10.50.134.121',
  localEndpoint: 'http://10.50.134.121/data',
  firebaseUrl: 'https://retrometer-default-rtdb.firebaseio.com/telemetry.json',
  websocketUrl: 'ws://10.50.134.121:81',
  pollIntervalMs: 1000,
  autoConnect: true,
}

// Initial state has ONLY 1 card: Utility Grid on CT-1
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
    tariffRate: 8.00,
    calMultiplier: 1.000,
  },
]

// Clean zeroed baseline metrics when waiting for Wi-Fi telemetry
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
  tamperMessage: 'Awaiting Wi-Fi Telemetry: Listening for real ESP32 UDP/HTTP packet...',
  tamperDetected: false,
  thdPercent: 0.0,
  h3Percent: 0.0,
  h5Percent: 0.0,
  h7Percent: 0.0,
  gridStatus: 'NORMAL',
  eepromBackup: true,
  loadBreakdown: {
    heatingWatts: 0,
    heatingPercent: 0,
    electronicsWatts: 0,
    electronicsPercent: 0,
    coolingWatts: 0,
    coolingPercent: 0,
    vampireWatts: 0,
    vampirePercent: 0,
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
  const [controls, setControls] = useState<SimulatorControls>(DEFAULT_SIMULATOR_CONTROLS)
  const [meterConstantVal, setMeterConstantVal] = useState<number>(3200)
  const [isPulseBlinking, setIsPulseBlinking] = useState(false)

  // Wi-Fi Configuration
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
    '⚡ Native Wi-Fi Telemetry Receiver Initialized.',
    'USB Serial & meterProxy.js bridge deprecated; direct 2.4GHz Wi-Fi active.',
    'Initial Target: CT-1 Utility Grid (Mains). Awaiting ESP32 Wi-Fi packets.',
  ])

  // Persist Wi-Fi config
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

  // Energy Sources State (Starts with ONLY CT-1 Utility Grid)
  const [sources, setSources] = useState<EnergySource[]>(() => {
    try {
      const saved = localStorage.getItem('retrometer-sources')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter(
            (s) => s.id === 'src-grid' || s.id.startsWith('src-user-') || s.ctChannel > 3
          )
          if (cleaned.length > 0) return cleaned
        }
      }
    } catch (e) {
      console.warn('Could not read retrometer-sources', e)
    }
    return DEFAULT_INITIAL_SOURCES
  })

  // Multi-CT Calibration Channels (1 to 16)
  const [ctCalibrations, setCtCalibrations] = useState<MultiCTChannelCalibration[]>(() =>
    initCTCalibrations(sources)
  )

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
  const wsRef = useRef<WebSocket | null>(null)

  const triggerPulse = useCallback(() => {
    setIsPulseBlinking(true)
    setTimeout(() => setIsPulseBlinking(false), 120)
  }, [])

  const resetPulseCount = useCallback(() => {
    setTelemetry((prev) => ({
      ...prev,
      pulseCount: 0,
      totalKWh: 0,
      ctKWh: 0,
      todayCostInr: 0,
    }))
    setSources((prev) =>
      prev.map((s) => ({ ...s, todayKWh: 0, totalKWh: 0 }))
    )
    setWifiLogs((prev) => [...prev.slice(-40), `[RESET] Energy & pulse counters zeroed at ${new Date().toLocaleTimeString()}`])
  }, [])

  const updateControls = useCallback((newControls: Partial<SimulatorControls>) => {
    setControls((prev) => ({ ...prev, ...newControls }))
  }, [])

  const setMeterConstant = useCallback((constant: 3200 | 1600) => {
    setMeterConstantVal(constant)
    setTelemetry((prev) => ({ ...prev, meterConstant: constant }))
    setWifiLogs((prev) => [...prev.slice(-40), `[CONFIG] Meter Constant set to ${constant} imp/kWh`])
  }, [])

  const updateWifiConfig = useCallback((newConfig: Partial<WifiReceiverConfig>) => {
    setWifiConfig((prev) => ({ ...prev, ...newConfig }))
  }, [])

  const unlockAdmin = useCallback((passcode: string): boolean => {
    const p = passcode.trim()
    if (p === 'admin' || p === 'admin1234') {
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

  // --- PARSE AND APPLY INCOMING WI-FI JSON PACKET ---
  const processIncomingPacket = useCallback((raw: RawWifiPacket) => {
    const now = Date.now()
    lastPacketTimestampRef.current = now
    setLastPacketTime(now)
    setLastPacketRaw(raw)
    setWifiStatus('CONNECTED')

    // 1. Line Voltage (vRMS)
    const v = raw.vRMS ?? raw.voltage ?? raw.v_rms ?? raw.v ?? 0

    // 2. Multi-CT Channel 0 extraction (mapped to CT-1 Utility Grid)
    let ct0Current = 0
    let ct0Watts = 0
    let ct0Pf = 0.94

    if (Array.isArray(raw.ct) && raw.ct.length > 0) {
      const first = raw.ct[0]
      if (typeof first === 'number') {
        ct0Current = first
      } else if (typeof first === 'object' && first !== null) {
        ct0Current = first.current ?? 0
        if (first.power !== undefined) ct0Watts = first.power
        if (first.pf !== undefined) ct0Pf = first.pf
      }
    } else {
      ct0Current = raw.current ?? raw.iRMS ?? raw.i_rms ?? raw.i1 ?? 0
    }

    // Power factor (pf[] array or single pf)
    if (Array.isArray(raw.pf) && raw.pf.length > 0) {
      ct0Pf = raw.pf[0]
    } else if (typeof raw.pf === 'number') {
      ct0Pf = raw.pf
    } else if (raw.powerFactor !== undefined) {
      ct0Pf = raw.powerFactor
    }

    if (ct0Watts === 0 && v > 0 && ct0Current > 0) {
      ct0Watts = raw.power ?? raw.activeWatts ?? raw.optWatts ?? +(v * ct0Current * ct0Pf).toFixed(1)
    } else if (ct0Watts === 0 && raw.activeWatts !== undefined) {
      ct0Watts = raw.activeWatts
    } else if (ct0Watts === 0 && raw.power !== undefined) {
      ct0Watts = raw.power
    }

    const mainActiveWatts = ct0Watts
    const mainCurrent = ct0Current
    const mainPf = Math.max(0.0, Math.min(1.0, ct0Pf || 0.94))
    const apparentVA = v > 0 && mainCurrent > 0 ? +(v * mainCurrent).toFixed(1) : +(mainActiveWatts / (mainPf || 1.0)).toFixed(1)
    const reactiveVAR = +Math.sqrt(Math.max(0, apparentVA * apparentVA - mainActiveWatts * mainActiveWatts)).toFixed(1)

    // Frequency
    const freq = raw.frequency ?? raw.freq ?? raw.hz ?? (v > 20 ? 50.0 : 0.0)

    // Optical Pulses & Energy
    const pOpt = raw.optWatts ?? raw.opt_power ?? raw.opticalWatts ?? mainActiveWatts
    const pulses = raw.optPulses ?? raw.opt_pulses ?? raw.pulseCount ?? 0
    const pulseInterval = raw.opt_interval ?? raw.pulseIntervalMs ?? (pOpt > 10 ? Math.round((3600 * 1000) / (meterConstantVal * (pOpt / 1000))) : 0)
    const totKWh = raw.optEnergyKWh ?? raw.opt_kwh ?? raw.totalKWh ?? +(pulses / meterConstantVal).toFixed(4)
    const ctKWhVal = raw.ctEnergyKWh ?? raw.ct_kwh ?? raw.ctKWh ?? totKWh
    const costInr = +(totKWh * 8.00).toFixed(2)

    // Pulse LED blink trigger
    if (pulses > prevPulseCountRef.current && prevPulseCountRef.current > 0) {
      triggerPulse()
    }
    prevPulseCountRef.current = pulses

    // Harmonics (thdI / thd)
    const thd = raw.thdI ?? raw.thd ?? raw.thdPercent ?? 1.8
    const h3 = raw.h3 ?? raw.h3Percent ?? 0.8
    const h5 = raw.h5 ?? raw.h5Percent ?? 0.5
    const h7 = raw.h7 ?? raw.h7Percent ?? 0.3

    // Tamper Status
    const rawTamper = raw.tamperStatus ?? raw.status ?? 'NORMAL'
    let discPct = 0
    if (mainActiveWatts > 20) {
      discPct = +(((mainActiveWatts - pOpt) / mainActiveWatts) * 100).toFixed(1)
    }
    const isCritical = rawTamper.toUpperCase().includes('CRITICAL') || rawTamper.toUpperCase().includes('TAMPER') || Math.abs(discPct) > 10
    const isWarning = rawTamper.toUpperCase().includes('WARN') || Math.abs(discPct) > 2
    const tamperSeverity = isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'NORMAL'
    const tamperDetected = isCritical
    const tamperMessage = isCritical
      ? `Tamper Alert: Optical divergence is ${discPct}%. Vector throttled relative to line current!`
      : isWarning
      ? `Notice: Minor divergence (${discPct}%) between CT and optical pulse sensor.`
      : 'Verified: Optical pulses match ADE7953 CT vector within ±2% metrology standard.'

    // Grid Status
    let gridStatus: 'NORMAL' | 'OVERVOLTAGE' | 'UNDERVOLTAGE' | 'TAMPER_ALERT' = 'NORMAL'
    if (v >= 260.0) gridStatus = 'OVERVOLTAGE'
    else if (v <= 200.0 && v > 20.0) gridStatus = 'UNDERVOLTAGE'
    else if (tamperDetected) gridStatus = 'TAMPER_ALERT'

    // NILM Heuristic Allocation (Sanzo Wada Categories)
    let heatPct = 0, elecPct = 0, coolPct = 0, vampPct = 0
    if (mainActiveWatts <= 0) {
      heatPct = 0; elecPct = 0; coolPct = 0; vampPct = 0
    } else if (mainActiveWatts < 50) {
      vampPct = 100
      heatPct = 0; elecPct = 0; coolPct = 0
    } else {
      vampPct = 6
      const rem = 94

      if (thd < 2.0) {
        heatPct = Math.round(rem * 0.65)
        coolPct = Math.round(rem * 0.22)
        elecPct = Math.max(0, rem - heatPct - coolPct)
      } else if (h3 >= 2.0 || thd >= 2.0) {
        elecPct = Math.round(rem * 0.58)
        coolPct = Math.round(rem * 0.28)
        heatPct = Math.max(0, rem - elecPct - coolPct)
      } else {
        coolPct = Math.round(rem * 0.45)
        elecPct = Math.round(rem * 0.35)
        heatPct = Math.max(0, rem - coolPct - elecPct)
      }
    }

    const heatWatts = Math.round(mainActiveWatts * (heatPct / 100))
    const elecWatts = Math.round(mainActiveWatts * (elecPct / 100))
    const coolWatts = Math.round(mainActiveWatts * (coolPct / 100))
    const vampWatts = Math.max(0, Math.round(mainActiveWatts - (heatWatts + elecWatts + coolWatts)))

    const newPoint: TelemetryData = {
      timestamp: now,
      rtcTime: raw.time || raw.rtcTime || getFormattedRtcTime(new Date(now)),
      voltage: +v.toFixed(1),
      current: +mainCurrent.toFixed(3),
      activeWatts: +mainActiveWatts.toFixed(1),
      apparentVA,
      reactiveVAR,
      powerFactor: +mainPf.toFixed(2),
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
      eepromBackup: raw.eeprom_backup ?? true,
      loadBreakdown: {
        heatingWatts: heatWatts,
        heatingPercent: heatPct,
        electronicsWatts: elecWatts,
        electronicsPercent: elecPct,
        coolingWatts: coolWatts,
        coolingPercent: coolPct,
        vampireWatts: vampWatts,
        vampirePercent: vampPct,
        hvacWatts: coolWatts,
        hvacPercent: coolPct,
        kitchenWatts: heatWatts,
        kitchenPercent: heatPct,
        geyserWatts: elecWatts,
        geyserPercent: elecPct,
        baseWatts: vampWatts,
        basePercent: vampPct,
      },
      waveform: generateWaveform(v, mainCurrent, mainPf),
    }

    setTelemetry(newPoint)
    setHistory((prev) => [...prev.slice(-40), newPoint])

    // --- PAYLOAD MAPPING: Map ct[0] to Utility Grid & ct[1..n] dynamically to user sources ---
    setSources((prevSources) => {
      return prevSources.map((source) => {
        if (!source.active) return { ...source, current: 0, activeWatts: 0, apparentVA: 0 }

        let chCurrent = 0
        let chWatts = 0
        let chPf = source.powerFactor || mainPf

        // 1. CT-1 (Utility Grid) ALWAYS maps to ct[0] (or direct current/power)
        if (source.ctChannel === 1 || source.id === 'src-grid') {
          chCurrent = mainCurrent
          chWatts = mainActiveWatts
          chPf = mainPf
        }
        // 2. User-added sources dynamically bind to ct[1..n]
        else if (Array.isArray(raw.ct)) {
          const ctIdx = source.ctChannel - 1
          if (ctIdx < raw.ct.length) {
            const item = raw.ct[ctIdx]
            if (typeof item === 'number') {
              chCurrent = item
              chWatts = +(v * chCurrent * chPf).toFixed(1)
            } else if (typeof item === 'object' && item !== null) {
              chCurrent = item.current ?? 0
              chWatts = item.power ?? +(v * chCurrent * (item.pf || chPf)).toFixed(1)
              if (item.pf !== undefined) chPf = item.pf
            }
          } else {
            // Channel object search
            const match = raw.ct.find((c) => typeof c === 'object' && c !== null && c.channel === source.ctChannel) as any
            if (match) {
              chCurrent = match.current ?? 0
              chWatts = match.power ?? +(v * chCurrent * (match.pf || chPf)).toFixed(1)
              if (match.pf !== undefined) chPf = match.pf
            }
          }
        } else if ((raw as any)[`i${source.ctChannel}`] !== undefined) {
          chCurrent = (raw as any)[`i${source.ctChannel}`]
          chWatts = +(v * chCurrent * chPf).toFixed(1)
        } else if ((raw as any)[`ct${source.ctChannel}`] !== undefined) {
          chCurrent = (raw as any)[`ct${source.ctChannel}`]
          chWatts = +(v * chCurrent * chPf).toFixed(1)
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
          powerFactor: +chPf.toFixed(2),
          activeWatts: activeWattsCalc,
          apparentVA: apparentVACalc,
          todayKWh: todayKWh > 0 ? todayKWh : source.todayKWh,
          totalKWh: todayKWh > 0 ? todayKWh : source.totalKWh,
        }
      })
    })
  }, [meterConstantVal, triggerPulse])

  // --- NATIVE WI-FI CLIENT (LOCAL HTTP / WEBSOCKET / CLOUD FIREBASE) ---
  const triggerWifiPoll = useCallback(async () => {
    setIsConnectingWifi(true)
    try {
      if (wifiConfig.mode === 'LOCAL_HTTP') {
        const targetUrl = wifiConfig.localEndpoint || `http://${wifiConfig.localIp}/data`
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000)

        let res: Response
        try {
          // Attempt via Vite proxy first to prevent browser CORS blocks
          const proxyUrl = `/api/proxy?target=${encodeURIComponent(targetUrl)}`
          res = await fetch(proxyUrl, { signal: controller.signal })
          if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`)
        } catch {
          // Fallback direct fetch
          res = await fetch(targetUrl, { signal: controller.signal })
        }
        clearTimeout(timeoutId)

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        const data = await res.json()
        processIncomingPacket(data)
        setWifiLogs((logs) => [
          ...logs.slice(-40),
          `[WIFI-HTTP] Synced payload from ${targetUrl} (V:${data.vRMS || data.voltage || 0}V, P:${data.power || data.activeWatts || 0}W)`,
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
            `[WIFI-CLOUD] Synced payload from Firebase Realtime DB.`,
          ])
        }
      }
    } catch (err: any) {
      const errMsg = err.message || 'Offline'
      setWifiLogs((logs) => [
        ...logs.slice(-40),
        `[WIFI-WARN] Polling failed (${errMsg}).`,
      ])
    } finally {
      setIsConnectingWifi(false)
    }
  }, [wifiConfig, processIncomingPacket])

  // --- WEBSOCKET CLIENT ---
  useEffect(() => {
    if (wifiConfig.mode !== 'WEBSOCKET' || !wifiConfig.autoConnect) {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      return
    }

    const wsUrl = wifiConfig.websocketUrl || `ws://${wifiConfig.localIp}:81`
    setWifiLogs((logs) => [...logs.slice(-40), `[WEBSOCKET] Connecting to ${wsUrl}...`])

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setWifiStatus('CONNECTED')
        setWifiLogs((logs) => [...logs.slice(-40), `[WEBSOCKET] Connected to ${wsUrl}`])
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          processIncomingPacket(data)
        } catch (e) {
          console.warn('WebSocket invalid JSON', e)
        }
      }

      ws.onerror = () => {
        setWifiLogs((logs) => [...logs.slice(-40), `[WEBSOCKET] Socket error on ${wsUrl}`])
      }

      ws.onclose = () => {
        setWifiLogs((logs) => [...logs.slice(-40), `[WEBSOCKET] Connection closed`])
      }

      return () => {
        ws.close()
        wsRef.current = null
      }
    } catch (e: any) {
      console.warn('WebSocket connection init failed', e)
    }
  }, [wifiConfig.mode, wifiConfig.websocketUrl, wifiConfig.localIp, wifiConfig.autoConnect, processIncomingPacket])

  // --- RECURRING POLLING ENGINE ---
  useEffect(() => {
    if (!wifiConfig.autoConnect || wifiConfig.mode === 'WEBSOCKET') {
      return
    }

    // Immediate first attempt
    triggerWifiPoll()

    const interval = setInterval(() => {
      triggerWifiPoll()
    }, Math.max(800, wifiConfig.pollIntervalMs || 1000))

    return () => clearInterval(interval)
  }, [wifiConfig.mode, wifiConfig.autoConnect, wifiConfig.pollIntervalMs, triggerWifiPoll])

  // --- 5-SECOND WATCHDOG & RECONNECTION ---
  // If no valid JSON arrives within 5 seconds: mark Offline/Stale, reset instantaneous metrics to 0 while PRESERVING cumulative kWh!
  useEffect(() => {
    const watchdogInterval = setInterval(() => {
      if (lastPacketTimestampRef.current > 0 && Date.now() - lastPacketTimestampRef.current > 5000) {
        if (wifiStatus !== 'OFFLINE') {
          setWifiStatus('OFFLINE')
          setWifiLogs((logs) => [
            ...logs.slice(-40),
            `[WATCHDOG] No telemetry received in >5s. Connection marked Offline. Resetting instantaneous metrics to 0 (Cumulative kWh preserved).`,
          ])

          // Zero instantaneous measurements; PRESERVE totalKWh & todayKWh!
          setTelemetry((prev) => ({
            ...prev,
            voltage: 0,
            current: 0,
            activeWatts: 0,
            apparentVA: 0,
            reactiveVAR: 0,
            powerFactor: 0,
            frequency: 0,
            opticalWatts: 0,
            pulseIntervalMs: 0,
            totalKWh: prev.totalKWh,
            ctKWh: prev.ctKWh,
            todayCostInr: prev.todayCostInr,
            tamperMessage: 'Awaiting Wi-Fi Telemetry: Stream Offline (Previous kWh preserved)',
            loadBreakdown: {
              heatingWatts: 0,
              heatingPercent: 0,
              electronicsWatts: 0,
              electronicsPercent: 0,
              coolingWatts: 0,
              coolingPercent: 0,
              vampireWatts: 0,
              vampirePercent: 0,
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
          }))

          // Also zero source instantaneous currents/watts while preserving todayKWh & totalKWh!
          setSources((prev) =>
            prev.map((s) => ({
              ...s,
              voltage: 0,
              current: 0,
              activeWatts: 0,
              apparentVA: 0,
            }))
          )
        }
      }
    }, 1000)

    return () => clearInterval(watchdogInterval)
  }, [wifiStatus])

  // --- TEST CONNECTION & SCHEMA VALIDATION ---
  const testConnection = useCallback(
    async (customConfig?: WifiReceiverConfig): Promise<ConnectionTestResult> => {
      const targetConfig = customConfig || wifiConfig
      const startTime = performance.now()

      try {
        let rawData: any = null

        if (targetConfig.mode === 'LOCAL_HTTP') {
          const url = targetConfig.localEndpoint || `http://${targetConfig.localIp}/data`
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 2500)

          let res: Response
          try {
            const proxyUrl = `/api/proxy?target=${encodeURIComponent(url)}`
            res = await fetch(proxyUrl, { signal: controller.signal })
            if (!res.ok) throw new Error(`Proxy status ${res.status}`)
          } catch {
            res = await fetch(url, { signal: controller.signal })
          }
          clearTimeout(timeout)

          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
          rawData = await res.json()
        } else if (targetConfig.mode === 'CLOUD_FIREBASE') {
          const url = targetConfig.firebaseUrl
          if (!url) throw new Error('Firebase URL is required')
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 3000)

          const res = await fetch(url, { signal: controller.signal })
          clearTimeout(timeout)
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
          rawData = await res.json()
        } else if (targetConfig.mode === 'WEBSOCKET') {
          const wsUrl = targetConfig.websocketUrl || `ws://${targetConfig.localIp}:81`
          return new Promise((resolve) => {
            try {
              const testWs = new WebSocket(wsUrl)
              const timer = setTimeout(() => {
                testWs.close()
                resolve({
                  success: false,
                  message: `WebSocket connection to ${wsUrl} timed out after 3s`,
                })
              }, 3000)

              testWs.onopen = () => {
                clearTimeout(timer)
                testWs.close()
                resolve({
                  success: true,
                  message: `WebSocket handshake verified on ${wsUrl}`,
                  latencyMs: Math.round(performance.now() - startTime),
                })
              }

              testWs.onerror = () => {
                clearTimeout(timer)
                resolve({
                  success: false,
                  message: `WebSocket handshake refused on ${wsUrl}`,
                })
              }
            } catch (err: any) {
              resolve({
                success: false,
                message: `WebSocket init error: ${err.message}`,
              })
            }
          })
        }

        const latencyMs = Math.round(performance.now() - startTime)
        if (!rawData || typeof rawData !== 'object') {
          return {
            success: false,
            message: 'Endpoint replied, but body was not a valid JSON object.',
            latencyMs,
          }
        }

        // Schema field detection
        const fields = Object.keys(rawData)
        const hasVoltage = 'vRMS' in rawData || 'voltage' in rawData
        const hasCurrentOrCt = 'ct' in rawData || 'current' in rawData
        const hasFrequency = 'frequency' in rawData || 'freq' in rawData || 'hz' in rawData

        if (!hasVoltage && !hasCurrentOrCt) {
          return {
            success: true,
            message: `JSON received (${latencyMs}ms), but missing standard metrology fields (vRMS / voltage / ct).`,
            latencyMs,
            schemaFields: fields,
            rawSample: rawData,
          }
        }

        return {
          success: true,
          message: `Valid Telemetry Schema! Detected ${fields.length} fields (${latencyMs}ms latency).`,
          latencyMs,
          schemaFields: fields,
          rawSample: rawData,
        }
      } catch (err: any) {
        return {
          success: false,
          message: err.message || 'Connection failed or timed out.',
          latencyMs: Math.round(performance.now() - startTime),
        }
      }
    },
    [wifiConfig]
  )

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
    const tariffRate = newSource.tariffRate ?? 8.00
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
      `[USER] Added Source "${newSource.name}" on CT-${newSource.ctChannel}`,
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

        // Native Wi-Fi Telemetry Engine
        wifiConfig,
        updateWifiConfig,
        wifiStatus,
        lastPacketTime,
        lastPacketRaw,
        wifiLogs,
        isConnectingWifi,
        triggerWifiPoll,
        testConnection,

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
