import { useState } from 'react'
import {
  Activity,
  CheckCircle2,
  Cpu,
  Flame,
  Power,
  RotateCcw,
  Save,
  ShieldAlert,
  Sliders,
  Sparkles,
  Usb,
  Zap,
} from 'lucide-react'
import { useTelemetry } from '../context/TelemetryContext'

export default function Calibration() {
  const {
    settings,
    updateSettings,
    resetOpticalBuffer,
    isWebSerialSupported,
    isSerialConnected,
    hasReceivedData,
    lastPacketTime,
    connectSerial,
    disconnectSerial,
    sendSerialResetCommand,
  } = useTelemetry()

  // Local form state
  const [formData, setFormData] = useState(settings)
  const [savedNotice, setSavedNotice] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings(formData)
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2500)
  }

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-7">
      {/* Header */}
      <section className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
            Hardware & Firmware Engine
          </p>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">
            ESP32 Sensor Calibration & Communication
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Configure firmware calibration constants and monitor physical ESP32 UART stream on COM port.
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={16} />
            <span>Parameters Updated Successfully</span>
          </div>
        )}
      </section>

      {/* Main Grid: Parameters Form & Hardware Connection */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calibration Settings Form (2 columns on lg) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs lg:col-span-2 sm:p-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Sliders size={20} />
              </span>
              <div>
                <h3 className="text-base font-bold text-[#0f172a]">Firmware Calibration Matrix</h3>
                <p className="text-xs text-slate-500 font-mono">Direct mapping to mp_backup.ino definitions</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFormData(settings)
                resetOpticalBuffer()
              }}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Reset Defaults</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* VOLTAGE_CAL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>VOLTAGE_CAL</span>
                  <span className="font-mono text-[11px] text-slate-400">Default: 781.33</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.voltageCal}
                  onChange={(e) => setFormData({ ...formData, voltageCal: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-mono text-sm text-[#0f172a] outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                />
                <p className="text-[11px] text-slate-500">Scale factor for ZMPT101B Voltage Transformer (D2)</p>
              </div>

              {/* CT_CAL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>CT_CAL</span>
                  <span className="font-mono text-[11px] text-slate-400">Default: 133.33</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ctCal}
                  onChange={(e) => setFormData({ ...formData, ctCal: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-mono text-sm text-[#0f172a] outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                />
                <p className="text-[11px] text-slate-500">Scale factor for SCT-013 Split-core Current Sensor (D15)</p>
              </div>

              {/* METER_CONSTANT */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>METER_CONSTANT (imp/kWh)</span>
                  <span className="font-mono text-[11px] text-slate-400">Default: 3200.0</span>
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.meterConstant}
                  onChange={(e) => setFormData({ ...formData, meterConstant: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-mono text-sm text-[#0f172a] outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                />
                <p className="text-[11px] text-slate-500">Pulses emitted per kilowatt-hour by optical meter LED</p>
              </div>

              {/* AVG_WINDOW_SIZE */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>AVG_WINDOW_SIZE (Samples)</span>
                  <span className="font-mono text-[11px] text-slate-400">Default: 50</span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={formData.avgWindowSize}
                  onChange={(e) => setFormData({ ...formData, avgWindowSize: parseInt(e.target.value, 10) || 50 })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-mono text-sm text-[#0f172a] outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                />
                <p className="text-[11px] text-slate-500">Circular buffer history size for optical pulse smoothing</p>
              </div>

              {/* NOISE_GATE_VOLTAGE */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>NOISE_GATE_VOLTAGE (V)</span>
                  <span className="font-mono text-[11px] text-slate-400">Default: 15.0</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.noiseGateVoltage}
                  onChange={(e) => setFormData({ ...formData, noiseGateVoltage: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-mono text-sm text-[#0f172a] outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                />
                <p className="text-[11px] text-slate-500">Cutoff threshold below which voltage is treated as 0V</p>
              </div>

              {/* NOISE_GATE_CURRENT */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>NOISE_GATE_CURRENT (A)</span>
                  <span className="font-mono text-[11px] text-slate-400">Default: 0.05</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.noiseGateCurrent}
                  onChange={(e) => setFormData({ ...formData, noiseGateCurrent: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-mono text-sm text-[#0f172a] outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                />
                <p className="text-[11px] text-slate-500">Current cutoff below which real power is suppressed</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/20 hover:bg-amber-700 transition-all cursor-pointer"
              >
                <Save size={15} />
                <span>Apply Firmware Calibration</span>
              </button>
            </div>
          </form>
        </div>

        {/* Hardware Status & Command Controls (1 column on lg) */}
        <div className="space-y-6">
          {/* Telemetry Status Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex items-center gap-2 font-bold text-sm text-[#0f172a]">
              <Cpu size={17} className="text-amber-600" />
              <span>Hardware Communication</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Only takes data from ESP32. Holds previous values if no connection is active.
            </p>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Port State</span>
                <span className={`font-bold ${isSerialConnected ? 'text-emerald-600' : 'text-slate-700'}`}>
                  {isSerialConnected ? 'OPEN (115200 Baud)' : 'DISCONNECTED'}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Data Feed</span>
                <span className={`font-bold ${hasReceivedData ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {hasReceivedData ? 'STREAMING PACKETS' : 'HOLDING PREVIOUS'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => sendSerialResetCommand()}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50/70 p-3 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-all cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Send 'R' Reset Command to ESP32</span>
              </button>
            </div>
          </div>

          {/* WebSerial ESP32 Direct Plug Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-900 p-5 text-white shadow-xs sm:p-6">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <Usb size={17} className="text-emerald-400" />
              <span>Direct ESP32 USB Connection</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Plug your ESP32 running <code className="font-mono text-amber-300">mp_backup.ino</code> into your computer and stream live telemetry straight into this UI!
            </p>

            <div className="mt-5">
              {isWebSerialSupported ? (
                <button
                  type="button"
                  onClick={isSerialConnected ? disconnectSerial : connectSerial}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
                    isSerialConnected
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                  }`}
                >
                  <Usb size={15} />
                  <span>{isSerialConnected ? 'Disconnect ESP32 (COM)' : 'Connect ESP32 (115200 Baud)'}</span>
                </button>
              ) : (
                <div className="rounded-xl bg-slate-800 p-3 text-xs text-slate-400">
                  Web Serial API requires Chrome, Edge, or Opera.
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-slate-800 pt-3 text-[11px] font-mono text-slate-400 space-y-1">
              <div>Baud Rate: 115200 8N1</div>
              <div>Buffer Reset Command: 'R'</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
