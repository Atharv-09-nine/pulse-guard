export interface TelemetryData {
  timestamp: number
  vRMS: number // Volts
  iRMS: number // Amperes
  realPower: number // Watts from CT
  apparentPower: number // VA
  powerFactor: number // 0 - 1.0
  frequency: number // Hz (e.g. 50.0)

  // Optical Meter Engine
  pulseCount: number
  rawInstantWatts: number
  stableReportedWatts: number
  certifiedEnergyKWh: number
  ctEnergyKWh: number

  // Engine state flags
  stepChangeTriggered: boolean
  idleWatchdogTriggered: boolean
  tamperAlert: boolean
  tamperSeverity: 'NORMAL' | 'WARNING' | 'CRITICAL'
  discrepancyPercent: number // difference between CT & Optical

  // Signal offsets & hardware health
  midVoltageDC: number // Volts DC bias
  midCurrentDC: number // Volts DC bias
  bufferFillCount: number // out of 50
  bufferAverageIntervalSec: number

  // 800 sample waveform snippets (downsampled to 80 points for smooth graphing)
  voltageWaveform: { timeMs: number; voltage: number; current: number }[]
}

export interface CalibrationSettings {
  voltageCal: number // default 781.33
  ctCal: number // default 133.33
  meterConstant: number // default 3200.0 imp/kWh
  noiseGateVoltage: number // 15.0 V
  noiseGateCurrent: number // 0.05 A
  avgWindowSize: number // 50
  lockoutUs: number // 35000 us (35ms)
  stepThresholdPercent: number // 25%
}

export interface MeterNode {
  id: string
  name: string
  substation: string
  feeder: string
  lat: number
  lng: number
  status: 'ONLINE' | 'STEP_ALERT' | 'TAMPER_DETECTED' | 'IDLE'
  voltage: number
  loadWatts: number
  meterPower: number
  meterConstant: number
  discrepancy: number
  lastPulseTime: string
}
