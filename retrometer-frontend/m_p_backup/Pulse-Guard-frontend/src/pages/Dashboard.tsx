import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from 'recharts'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Gauge,
  Layers,
  Radio,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Terminal,
  Zap,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import { useTelemetry } from '../context/TelemetryContext'

export default function Dashboard() {
  const {
    telemetry,
    history,
    settings,
    resetOpticalBuffer,
    serialLogs,
    isSerialConnected,
    hasReceivedData,
    lastPacketTime,
  } = useTelemetry()

  // Format telemetry history for Recharts
  const chartData = history.map((h, i) => ({
    time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    ctPower: h.realPower,
    opticalPower: h.stableReportedWatts,
    rawWatts: h.rawInstantWatts > 0 ? h.rawInstantWatts : null,
    voltage: h.vRMS,
    current: h.iRMS,
  }))

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-7">
      {/* Page Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
              AC Telemetry & Fast-Tracking Engine
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-medium ${
              isSerialConnected && hasReceivedData
                ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              {isSerialConnected && hasReceivedData
                ? '🟢 LIVE ESP32 HARDWARE STREAM'
                : '⏸️ HOLDING PREVIOUS VALUES (NO COMMUNICATION)'}
            </span>
          </div>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">
            Grid & Optical Pulse Operations
          </h2>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            {isSerialConnected && hasReceivedData
              ? 'Real-time measurements streamed exclusively from your physical ESP32 (ZMPT101B D2, SCT-013 D15, Optical D5).'
              : 'Values are strictly taken from the ESP32. When there is no active communication, the system holds the previous readings.'}
          </p>
        </div>

        {/* Quick Scenario & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {!isSerialConnected && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800">
              <span className="size-2 rounded-full bg-amber-500" />
              <span>HOLDING PREVIOUS STATE (OFFLINE)</span>
            </div>
          )}
          {telemetry.tamperAlert && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 animate-pulse">
              <ShieldAlert size={16} />
              <span>THEFT / TAMPER ALERT: P_CT &gt;&gt; P_METER</span>
            </div>
          )}
          {telemetry.stepChangeTriggered && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              <Zap size={16} />
              <span>STEP CHANGE TRIGGERED (&gt;25% FLUSH)</span>
            </div>
          )}
        </div>
      </section>

      {/* Top 6 Stat Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Grid Voltage"
          value={`${telemetry.vRMS.toFixed(1)} V`}
          subValue="50.0 Hz"
          badge="GPIO 2 (ZMPT101B)"
          delta={telemetry.vRMS > 210 ? 'Nominal 230V ± 5%' : 'Sag Warning'}
          trend={telemetry.vRMS > 210 ? 'up' : 'down'}
          icon={Zap}
          tone={telemetry.vRMS < 200 ? 'warn' : 'electric'}
        />

        <StatCard
          label="CT Current"
          value={`${telemetry.iRMS.toFixed(2)} A`}
          subValue="RMS Load"
          badge="GPIO 15 (SCT-013)"
          delta={`PF: ${telemetry.powerFactor.toFixed(2)}`}
          trend="up"
          icon={Activity}
          tone="neutral"
        />

        <StatCard
          label="CT Real Power"
          value={`${telemetry.realPower.toFixed(0)} W`}
          subValue={`S: ${telemetry.apparentPower.toFixed(0)} VA`}
          badge="Integrated 1/N ∑ v·i"
          delta={`${(telemetry.realPower / 1000).toFixed(2)} kW active`}
          trend="up"
          icon={Gauge}
          tone="good"
        />

        <StatCard
          label="Optical Load"
          value={`${telemetry.stableReportedWatts.toFixed(0)} W`}
          subValue={`Raw: ${telemetry.rawInstantWatts.toFixed(0)}W`}
          badge="GPIO 5 (3200 imp/kWh)"
          delta={telemetry.idleWatchdogTriggered ? 'Idle Watchdog (0W)' : 'Fast Track 50-Win'}
          trend="up"
          icon={Radio}
          tone={telemetry.idleWatchdogTriggered ? 'warn' : 'good'}
        />

        <StatCard
          label="Theft / Discrepancy"
          value={`${telemetry.discrepancyPercent.toFixed(1)} %`}
          subValue={telemetry.tamperAlert ? 'TAMPER' : 'MATCHED'}
          badge="Audit Engine"
          delta={telemetry.tamperAlert ? 'Critical Divergence' : 'Normal Tolerances'}
          trend={telemetry.tamperAlert ? 'down' : 'up'}
          icon={ShieldAlert}
          tone={telemetry.tamperSeverity === 'CRITICAL' ? 'critical' : telemetry.tamperSeverity === 'WARNING' ? 'warn' : 'good'}
        />

        <StatCard
          label="Certified Energy"
          value={`${telemetry.certifiedEnergyKWh.toFixed(4)}`}
          subValue="kWh"
          badge={`#${telemetry.pulseCount} Pulses`}
          delta={`CT: ${telemetry.ctEnergyKWh.toFixed(4)} kWh`}
          trend="up"
          icon={Cpu}
          tone="neutral"
        />
      </section>

      {/* Main Charts & Visualization Section */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Dual Power Trend Chart (2 columns on lg) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs lg:col-span-2 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-[#0f172a]">
                Live Power Tracking & Step Response
              </h3>
              <p className="text-xs text-slate-500">
                Comparing CT Instant Real Power vs Optical Meter Step-Tracking Engine (50-Sample Buffer)
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600">CT Real Power (W)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Optical Smoothed (W)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-sky-400" />
                <span className="text-slate-400">Raw Instant (W)</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ctGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="opticalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ctPower"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#ctGrad)"
                  name="CT Power (W)"
                />
                <Area
                  type="monotone"
                  dataKey="opticalPower"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#opticalGrad)"
                  name="Optical Smoothed (W)"
                />
                <Line
                  type="monotone"
                  dataKey="rawWatts"
                  stroke="#38bdf8"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  name="Raw Instant (W)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Under-chart status note */}
          <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 font-mono">
            <span>Window Size: {settings.avgWindowSize} samples</span>
            <span>Step Threshold: {settings.stepThresholdPercent}% deviation</span>
            <span>Timeout Watchdog: 5000 ms</span>
          </div>
        </div>

        {/* Step-Change Circular Buffer Visualizer (1 column on lg) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
                <Layers size={18} className="text-amber-600" />
                <span>Circular Buffer Engine</span>
              </h3>
              <button
                type="button"
                onClick={resetOpticalBuffer}
                className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 font-semibold"
              >
                <RotateCcw size={12} />
                <span>Flush 'R'</span>
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              50-slot interval buffer (<code className="font-mono text-slate-700">AVG_WINDOW_SIZE</code>).
              Flushes on &gt;25% step change.
            </p>

            {/* Buffer metrics */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[11px] text-slate-500">Filled Slots</span>
                <p className="mt-1 font-mono text-base font-bold text-[#0f172a]">
                  {telemetry.bufferFillCount} / {settings.avgWindowSize}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[11px] text-slate-500">Avg Pulse Period</span>
                <p className="mt-1 font-mono text-base font-bold text-amber-600">
                  {telemetry.bufferAverageIntervalSec.toFixed(3)} s
                </p>
              </div>
            </div>

            {/* Visual 50-slot bar grid */}
            <div className="mt-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Buffer Memory Slots (50 Elements)
              </span>
              <div className="mt-2 grid grid-cols-10 gap-1.5">
                {Array.from({ length: 50 }).map((_, idx) => {
                  const isFilled = idx < telemetry.bufferFillCount
                  return (
                    <div
                      key={idx}
                      title={`Buffer Slot #${idx}: ${isFilled ? 'Active' : 'Empty'}`}
                      className={`h-4 rounded-sm transition-all duration-300 ${
                        telemetry.stepChangeTriggered
                          ? 'bg-amber-400 animate-pulse'
                          : isFilled
                          ? 'bg-emerald-500'
                          : 'bg-slate-100'
                      }`}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-amber-200/60 bg-amber-50/50 p-3.5 text-xs text-amber-900">
            <span className="font-semibold block">Step Change Algorithm:</span>
            <p className="mt-1 text-[11px] text-amber-800 leading-relaxed font-mono">
              |P_raw - P_avg| / P_avg &gt; 0.25 =&gt; <code className="text-amber-950 font-bold">flushBufferWith(instantSec)</code>
            </p>
            <p className="mt-1 text-[10px] text-amber-700">
              Eliminates the standard 50-second moving average delay when appliances cycle ON or OFF.
            </p>
          </div>
        </div>
      </section>

      {/* Waveform Scope Preview & Serial Terminal */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Waveform Scope Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
                <Activity size={18} className="text-blue-600" />
                <span>800-Sample Waveform Scope</span>
              </h3>
              <p className="text-xs text-slate-500">
                Synchronous ADC capture (GPIO 2 Voltage vs GPIO 15 Current)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-blue-600 font-semibold">● Voltage (V)</span>
              <span className="text-rose-500 font-semibold">● Current (A × 50)</span>
            </div>
          </div>

          <div className="h-56 w-full bg-slate-950 rounded-xl p-2.5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetry.voltageWaveform} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
                <XAxis dataKey="timeMs" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} domain={[-350, 350]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    borderColor: '#334155',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="voltage"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                  name="Voltage (V)"
                />
                <Line
                  type="monotone"
                  dataKey={(d) => d.current * 50}
                  stroke="#fb7185"
                  strokeWidth={2}
                  dot={false}
                  name="Scaled Current (A × 50)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">V_mid (DC Offset)</span>
              <span className="font-bold text-slate-800">{telemetry.midVoltageDC.toFixed(3)} V</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">I_mid (DC Offset)</span>
              <span className="font-bold text-slate-800">{telemetry.midCurrentDC.toFixed(3)} V</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Power Factor</span>
              <span className="font-bold text-emerald-600">{telemetry.powerFactor.toFixed(3)}</span>
            </div>
          </div>
        </div>

        {/* Live ESP32 Serial Telemetry Console */}
        <div className="rounded-2xl border border-slate-200/90 bg-slate-950 p-5 shadow-xs sm:p-6 text-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal size={17} className="text-amber-400" />
                <span className="text-sm font-semibold text-white">ESP32 Serial Stream</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                  115200 BAUD
                </span>
              </div>
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Serial Terminal window */}
            <div className="mt-3 h-52 overflow-y-auto space-y-1 font-mono text-[11px] text-emerald-400/90 bg-black/40 rounded-xl p-3 border border-slate-800/80">
              {serialLogs.slice(-12).map((log, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    log.includes('GRID:')
                      ? 'text-cyan-300'
                      : log.includes('--> [OPTICAL')
                      ? 'text-amber-300'
                      : log.includes('[RESET]')
                      ? 'text-emerald-400 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-3">
            <span>Active Command: <code className="text-amber-400">'R' (Reset)</code></span>
            <span className="text-slate-500">Auto-refresh 1000ms</span>
          </div>
        </div>
      </section>
    </div>
  )
}
