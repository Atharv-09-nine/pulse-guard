import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import {
  Activity,
  Cpu,
  Info,
  Maximize2,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useTelemetry } from '../context/TelemetryContext'

export default function WaveformScope() {
  const { telemetry, settings } = useTelemetry()
  const [scopeMode, setScopeMode] = useState<'COMBINED' | 'SPLIT' | 'INST_POWER'>('COMBINED')
  const [scaleFactor, setScaleFactor] = useState(50)

  // Compute instantaneous power wave: p(t) = v(t) * i(t)
  const powerWaveform = telemetry.voltageWaveform.map((pt) => ({
    timeMs: pt.timeMs,
    voltage: pt.voltage,
    current: pt.current,
    instPower: +(pt.voltage * pt.current).toFixed(1),
  }))

  const peakV = (telemetry.vRMS * Math.SQRT2).toFixed(1)
  const peakI = (telemetry.iRMS * Math.SQRT2).toFixed(2)
  const phaseAngleDeg = (Math.acos(Math.min(1, telemetry.powerFactor)) * (180 / Math.PI)).toFixed(1)

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-7">
      {/* Page Header */}
      <section className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            ADC Oscilloscope & Synchronous Sampling
          </p>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">
            800-Point AC Waveform Analysis
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Real-time capture via ESP32 ADC attenuation 11dB (12-bit, 4095 counts) with 100μs inter-sample spacing.
          </p>
        </div>

        {/* Scope View Switcher */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 text-xs shadow-2xs">
          <button
            type="button"
            onClick={() => setScopeMode('COMBINED')}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              scopeMode === 'COMBINED'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            V & I Overlay
          </button>
          <button
            type="button"
            onClick={() => setScopeMode('INST_POWER')}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              scopeMode === 'INST_POWER'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            p(t) Instant Power
          </button>
        </div>
      </section>

      {/* Primary Oscilloscope Screen */}
      <section className="rounded-2xl border border-slate-200/90 bg-slate-950 p-5 sm:p-7 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Activity size={20} />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Dual-Channel AC Digital Scope</h3>
              <p className="text-xs text-slate-400 font-mono">
                CH1: ZMPT101B (D2) • CH2: SCT-013 (D15) • Timebase: 40ms / 2 Cycles (50Hz)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 border border-slate-800">
              <span className="size-2 rounded-full bg-cyan-400" />
              <span className="text-slate-300">V_peak: ±{peakV} V</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 border border-slate-800">
              <span className="size-2 rounded-full bg-rose-400" />
              <span className="text-slate-300">I_peak: ±{peakI} A</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 border border-slate-800">
              <span className="text-amber-400 font-bold">φ: {phaseAngleDeg}°</span>
              <span className="text-slate-400">({telemetry.powerFactor >= 0.9 ? 'Resistive' : 'Inductive'})</span>
            </div>
          </div>
        </div>

        {/* Scope Chart Canvas */}
        <div className="mt-6 h-80 w-full bg-black/60 rounded-xl p-3 border border-slate-800 relative">
          <ResponsiveContainer width="100%" height="100%">
            {scopeMode === 'COMBINED' ? (
              <LineChart data={powerWaveform} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
                <XAxis dataKey="timeMs" tick={{ fontSize: 10, fill: '#64748b' }} unit="ms" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[-350, 350]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="voltage"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={false}
                  name="Voltage V(t)"
                />
                <Line
                  type="monotone"
                  dataKey={(d) => d.current * scaleFactor}
                  stroke="#fb7185"
                  strokeWidth={2.5}
                  dot={false}
                  name={`Current I(t) × ${scaleFactor}`}
                />
              </LineChart>
            ) : (
              <AreaChart data={powerWaveform} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
                <XAxis dataKey="timeMs" tick={{ fontSize: 10, fill: '#64748b' }} unit="ms" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="instPower"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fill="url(#pGrad)"
                  name="Instantaneous Power p(t) [W]"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Scope Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>Current Display Gain:</span>
            {[20, 50, 100].map((gain) => (
              <button
                key={gain}
                type="button"
                onClick={() => setScaleFactor(gain)}
                className={`rounded px-2 py-0.5 border ${
                  scaleFactor === gain
                    ? 'border-rose-500 bg-rose-500/20 text-rose-300 font-bold'
                    : 'border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                ×{gain}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Sampling: 800 pts/window</span>
            <span>•</span>
            <span>ADC Resolution: 12-Bit (4095)</span>
          </div>
        </div>
      </section>

      {/* Firmware Signal Processing Math & Explanations */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
            <Cpu size={16} className="text-amber-600" />
            <span>DC Bias Offset Tracking</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            The ESP32 ADC accepts only unipolar 0-3.3V signals. An op-amp / resistor divider shifts AC sine waves to mid-rail (1.65V). The firmware computes:
          </p>
          <pre className="mt-3 rounded-xl bg-slate-900 p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto">
{`midVoltageDC = (sumV / 800 / 4095) * 3.3;
midCurrentDC = (sumI / 800 / 4095) * 3.3;`}
          </pre>
          <div className="mt-3 flex justify-between text-xs font-mono text-slate-700">
            <span>Measured V_mid: <strong>{telemetry.midVoltageDC.toFixed(3)} V</strong></span>
            <span>Measured I_mid: <strong>{telemetry.midCurrentDC.toFixed(3)} V</strong></span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
            <Zap size={16} className="text-blue-600" />
            <span>True RMS & Power Calculation</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Instantaneous products are summed across all 800 sample slices to compute real active power regardless of harmonic distortion:
          </p>
          <pre className="mt-3 rounded-xl bg-slate-900 p-3 text-[11px] font-mono text-cyan-300 overflow-x-auto">
{`vRMS = sqrt(sumSquaredV / 800);
iRMS = sqrt(sumSquaredI / 800);
realPower = sumInstPower / 800;`}
          </pre>
          <div className="mt-3 flex justify-between text-xs font-mono text-slate-700">
            <span>P_active: <strong>{telemetry.realPower.toFixed(1)} W</strong></span>
            <span>PF: <strong>{telemetry.powerFactor.toFixed(3)}</strong></span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
            <Info size={16} className="text-emerald-600" />
            <span>Noise Gate Rejection</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Suppresses ADC thermal noise drift when the line is disconnected or in an open circuit condition:
          </p>
          <pre className="mt-3 rounded-xl bg-slate-900 p-3 text-[11px] font-mono text-amber-300 overflow-x-auto">
{`if (vRMS < 15.0) vRMS = 0.0;
if (iRMS < 0.05) {
  iRMS = 0.0;
  realPower = 0.0;
}`}
          </pre>
          <div className="mt-3 flex justify-between text-xs font-mono text-slate-700">
            <span>V_floor: <strong>15.0 V</strong></span>
            <span>I_floor: <strong>0.050 A</strong></span>
          </div>
        </div>
      </section>
    </div>
  )
}
