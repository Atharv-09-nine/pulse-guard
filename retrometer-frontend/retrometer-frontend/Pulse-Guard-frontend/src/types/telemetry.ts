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

  // Top Load Breakdown (NILM Disaggregation)
  loadBreakdown: {
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
  active: boolean // simulator enabled
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
