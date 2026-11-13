export interface TelemetryData {
  timestamp: number
  rtcTime: string // DS1302 format "YYYY-MM-DD HH:MM:SS"

  // Core Measurements
  voltage: number // V_RMS in Volts (ADE7953)
  current: number // I_RMS in Amperes (ADE7953 + CT)
  activeWatts: number // P_elec in Watts (ADE7953 AWATT)
  apparentVA: number // S = V * I in VA
  reactiveVAR: number // Q = sqrt(S^2 - P^2) in VAR
  powerFactor: number // cos(phi) 0.00 - 1.00
  frequency: number // Hz (nominal 50.00 Hz)

  // Optical Meter Engine (BPW34 + LM393 on Pin 7)
  meterConstant: number // 3200 imp/kWh (from mp_backup.ino)
  pulseCount: number // Total optical pulses
  opticalWatts: number // P_opt derived from pulse interval
  pulseIntervalMs: number // Milliseconds between pulses
  totalKWh: number // Cumulative energy in kWh (pulseCount / 3200)
  ctKWh: number // Electrical energy in kWh integrated from activeWatts
  todayCostInr: number // Energy cost in Indian Rupees (₹)

  // Anti-Tamper & Discrepancy Analysis
  discrepancyPercent: number // ((activeWatts - opticalWatts) / activeWatts) * 100
  tamperSeverity: 'NORMAL' | 'WARNING' | 'CRITICAL'
  tamperMessage: string
  tamperDetected: boolean

  // Harmonic Spectrum (Goertzel Filter from mp_backup.ino)
  thdPercent: number // Total Harmonic Distortion %
  h3Percent: number // 3rd Harmonic (150 Hz) %
  h5Percent: number // 5th Harmonic (250 Hz) %
  h7Percent: number // 7th Harmonic (350 Hz) %

  // Grid Status
  gridStatus: 'NORMAL' | 'OVERVOLTAGE' | 'UNDERVOLTAGE' | 'TAMPER_ALERT'

  // Hardware AT24C32 EEPROM Persistent Indicator
  eepromBackup: boolean

  // Top Load Breakdown (Harmonics / NILM Disaggregation)
  loadBreakdown: {
    heatingWatts: number
    heatingPercent: number
    electronicsWatts: number
    electronicsPercent: number
    coolingWatts: number
    coolingPercent: number
    vampireWatts: number
    vampirePercent: number

    // Compatibility keys
    hvacWatts: number
    hvacPercent: number
    kitchenWatts: number
    kitchenPercent: number
    geyserWatts: number
    geyserPercent: number
    baseWatts: number
    basePercent: number
  }

  // Waveform snippet for visual scopes (80 points)
  waveform: {
    timeMs: number
    voltage: number
    current: number
  }[]
}

export interface SimulatorControls {
  active: boolean // test signal injector enabled (OFF by default)
  loadWatts: number // slider 100 - 5000 W
  powerFactor: number // slider 0.70 - 1.00
  tamperDriftPercent: number // slider -50% to +50%
  gridNoise: boolean // subtle realistic jitter
  tariffRatePerKWh: number // ₹/kWh (default ₹6.50)
}

export interface HardwarePinMap {
  pin: number
  name: string
  function: string
  protocol: string
  chip: string
  description: string
  status: 'ACTIVE' | 'OK' | 'INTERRUPT'
}

export interface HardwareSpecs {
  meterConstant: number // 3200
  ctRatio: number // 2000:1
  burdenOhms: number // 3.3
  pgaGain: number // 22.0
  voltageDividerRatio: number // ~2002
  calCurrentGain: number // 0.979
  calVoltageGain: number // 0.974
  debounceMicros: number // 5000 (5ms)
  goertzelWindowN: number // 699
  sampleRateHz: number // 6990
}

export type SourcePresetType = 'grid' | 'solar' | 'dg' | 'battery' | 'custom'

export interface EnergySource {
  id: string
  name: string
  preset: SourcePresetType
  ctChannel: number // 1 to 16 for CD74HC4067 multiplexer
  active: boolean
  isProducer: boolean // true for solar / DG generation vs grid consumption / battery
  current: number // I_RMS in Amperes
  voltage: number // V_RMS from common bus
  powerFactor: number // cos(phi)
  activeWatts: number // P_n = V_RMS * I_CT,n * cos(phi)
  apparentVA: number
  todayKWh: number // Accumulated today energy in kWh
  totalKWh: number
  tariffRate: number // ₹/kWh
  calMultiplier: number // Ki_ph calibration factor (default 1.0)
  iconColor?: string
}

export interface MultiCTChannelCalibration {
  channel: number // 1 to 16
  sourceId: string | null
  sourceName: string
  kiGain: number // default 1.000
  burdenOhms: number // default 3.3
  phaseOffsetDeg: number // default 0.0
  active: boolean
}

// Wi-Fi Telemetry Receiver Configuration & Status Types
export type WifiConnectionMode = 'LOCAL_HTTP' | 'CLOUD_FIREBASE' | 'WEBSOCKET'
export type WifiStatus = 'CONNECTED' | 'WAITING' | 'OFFLINE' | 'ERROR'

export interface WifiReceiverConfig {
  mode: WifiConnectionMode
  localIp: string // e.g. "10.50.134.121" or "192.168.1.150"
  localEndpoint: string // e.g. "http://10.50.134.121/telemetry" or "/data"
  firebaseUrl: string // e.g. "https://retrometer-default-rtdb.firebaseio.com/telemetry.json"
  websocketUrl: string // e.g. "ws://10.50.134.121:81"
  pollIntervalMs: number // e.g. 1000
  autoConnect: boolean
}

export interface RawWifiPacket {
  status?: string
  tamperStatus?: string
  time?: string
  rtcTime?: string
  voltage?: number
  vRMS?: number
  v_rms?: number
  v?: number
  current?: number
  iRMS?: number
  i_rms?: number
  power?: number
  activeWatts?: number
  active_watts?: number
  p?: number
  pf?: number | number[]
  powerFactor?: number
  frequency?: number
  freq?: number
  hz?: number
  opt_power?: number
  opticalWatts?: number
  optWatts?: number
  opt_kwh?: number
  optEnergyKWh?: number
  totalKWh?: number
  ctEnergyKWh?: number
  ct_kwh?: number
  ctKWh?: number
  opt_pulses?: number
  pulseCount?: number
  optPulses?: number
  opt_interval?: number
  pulseIntervalMs?: number
  thd?: number
  thdPercent?: number
  thdI?: number
  h3?: number
  h3Percent?: number
  h5?: number
  h5Percent?: number
  h7?: number
  h7Percent?: number
  eeprom_backup?: boolean
  // Multi-CT array supporting both number[] and object[] formats
  ct?: (number | {
    channel?: number
    current?: number
    power?: number
    pf?: number
  })[]
  i1?: number
  i2?: number
  i3?: number
  ct1?: number
  ct2?: number
  ct3?: number
}
