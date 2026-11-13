import React from 'react'
import { useTelemetry } from '../context/TelemetryContext'
import { ShieldAlert, AlertTriangle, CheckCircle, Activity, Waves, Zap, Terminal } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function AntiTamperPowerQuality() {
  const { telemetry, controls, updateControls } = useTelemetry()

  const {
    activeWatts,
    opticalWatts,
    discrepancyPercent,
    tamperSeverity,
    tamperMessage,
    tamperDetected,
    thdPercent,
    h3Percent,
    h5Percent,
    h7Percent,
  } = telemetry

  // Goertzel bins from mp_backup.ino: int k_bins[6] = {50, 150, 250, 350, 550, 650};
  const harmonicSpectrumData = [
    { freq: '50 Hz (Fund)', mag: 100.0, name: '1st Fundamental', fill: '#00F0FF' },
    { freq: '150 Hz (H3)', mag: h3Percent, name: '3rd Harmonic', fill: '#F59E0B' },
    { freq: '250 Hz (H5)', mag: h5Percent, name: '5th Harmonic', fill: '#8B5CF6' },
    { freq: '350 Hz (H7)', mag: h7Percent, name: '7th Harmonic', fill: '#EC4899' },
    { freq: '550 Hz (H11)', mag: +(h7Percent * 0.45).toFixed(1), name: '11th Harmonic', fill: '#6B7280' },
    { freq: '650 Hz (H13)', mag: +(h7Percent * 0.25).toFixed(1), name: '13th Harmonic', fill: '#4B5563' },
  ]

  const isSevereTamper = Math.abs(discrepancyPercent) >= 20 || tamperSeverity === 'CRITICAL'
  const isModerateTamper = Math.abs(discrepancyPercent) >= 8 || tamperSeverity === 'WARNING'

  return (
    <div className="space-y-6">
      {/* Anti-Tamper Status Banner */}
      <div
        className={`rounded-2xl border p-5 shadow-lg shadow-black/40 transition-all ${
          isSevereTamper
            ? 'border-rose-500/50 bg-rose-500/10'
            : isModerateTamper
            ? 'border-amber-500/50 bg-amber-500/10'
            : 'border-[#262A33] bg-[#181B20]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`size-11 rounded-xl flex items-center justify-center border ${
                isSevereTamper
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : isModerateTamper
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}
            >
              <ShieldAlert size={22} className={isSevereTamper ? 'animate-bounce' : ''} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-white">
                  {isSevereTamper
                    ? 'CRITICAL TAMPER / THEFT DETECTED'
                    : isModerateTamper
                    ? 'DISCREPANCY ALERT / DRIFT DETECTED'
                    : 'DUAL-VECTOR ANTI-THEFT ENGINE: ARMED'}
                </h2>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold border ${
                    isSevereTamper
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : isModerateTamper
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}
                >
                  STATUS: {tamperSeverity}
                </span>
              </div>
              <p className="text-xs text-gray-300 font-mono mt-1">
                {tamperMessage}
              </p>
            </div>
          </div>

          {/* Quick Drift Simulation Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateControls({ tamperDriftPercent: 0 })}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono font-semibold border transition-all ${
                controls.tamperDriftPercent === 0
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-[#0F1115] text-gray-400 border-[#262A33] hover:text-white'
              }`}
            >
              Zero Drift (0%)
            </button>
            <button
              type="button"
              onClick={() => updateControls({ tamperDriftPercent: 35 })}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono font-semibold border transition-all ${
                controls.tamperDriftPercent === 35
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-[#0F1115] text-gray-400 border-[#262A33] hover:text-rose-400'
              }`}
            >
              Trigger 35% Theft
            </button>
          </div>
        </div>
      </div>

      {/* Discrepancy Math Diagnostic Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="rounded-2xl border border-[#262A33] bg-[#181B20] p-5">
          <span className="text-xs text-gray-400 block uppercase">Electrical Line Power (CT AWATT)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#00F0FF]">{activeWatts.toFixed(1)}</span>
            <span className="text-sm font-bold text-gray-400">Watts</span>
          </div>
          <span className="text-[11px] text-gray-400 block mt-2">
            Directly from ADE7953 register 0x0212
          </span>
        </div>

        <div className="rounded-2xl border border-[#262A33] bg-[#181B20] p-5">
          <span className="text-xs text-gray-400 block uppercase">Optical Pulse Power (GPIO 7)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-3xl font-black ${
                isSevereTamper ? 'text-rose-400' : 'text-[#10B981]'
              }`}
            >
              {opticalWatts.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-gray-400">Watts</span>
          </div>
          <span className="text-[11px] text-gray-400 block mt-2">
            P = 3600 / (3200 × Δt) × 1000 W
          </span>
        </div>

        <div className="rounded-2xl border border-[#262A33] bg-[#181B20] p-5">
          <span className="text-xs text-gray-400 block uppercase">Discrepancy Vector Delta (Δ)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-3xl font-black ${
                isSevereTamper
                  ? 'text-rose-400'
                  : isModerateTamper
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {discrepancyPercent}%
            </span>
          </div>
          <span className="text-[11px] text-gray-400 block mt-2">
            Threshold: Normal &lt; 5% • Trip &gt; 20%
          </span>
        </div>
      </div>

      {/* Goertzel Harmonic Spectrum Visualizer */}
      <div className="rounded-2xl border border-[#262A33] bg-[#181B20] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#262A33] pb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Waves size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-white">
                Hardware Goertzel Harmonic Spectrum (Register 0x0216 @ 6.99 kHz)
              </h3>
              <span className="text-[11px] text-gray-400 font-mono">
                Pre-calculated double precision DSP Goertzel coefficients (N=699, exact 100ms window)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-gray-400">THD:</span>
            <span className="rounded bg-purple-500/20 px-2 py-0.5 text-purple-300 font-bold border border-purple-500/40">
              {thdPercent}%
            </span>
            <span className="text-[10px] text-gray-400">(IEEE 519 Standard &lt; 5%)</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={harmonicSpectrumData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262A33" vertical={false} />
              <XAxis dataKey="freq" stroke="#6B7280" fontSize={10} tickLine={false} fontFamily="monospace" />
              <YAxis stroke="#6B7280" fontSize={10} tickLine={false} fontFamily="monospace" unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F1115',
                  borderColor: '#262A33',
                  borderRadius: '0.75rem',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="mag" name="Magnitude (% Fundamental)" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

