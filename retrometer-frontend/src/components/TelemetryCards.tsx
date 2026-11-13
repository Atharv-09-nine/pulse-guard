import React from 'react'
import { Activity, Gauge, Zap, Waves, ShieldCheck, AlertCircle, Compass, Radio } from 'lucide-react'
import type { TelemetryData } from '../types/telemetry'

interface TelemetryCardsProps {
  telemetry: TelemetryData
}

export default function TelemetryCards({ telemetry }: TelemetryCardsProps) {
  const {
    voltage,
    current,
    powerFactor,
    frequency,
    apparentVA,
    reactiveVAR,
    gridStatus,
  } = telemetry

  // Voltage status check
  const isOverVoltage = voltage >= 260.0
  const isUnderVoltage = voltage <= 200.0 && voltage > 20.0
  const voltageStatus = isOverVoltage ? 'OVERVOLTAGE' : isUnderVoltage ? 'UNDERVOLTAGE' : 'NOMINAL'

  // Power factor angle in degrees: acos(PF) * 180 / PI
  const phaseAngleDeg = (Math.acos(Math.max(0.1, Math.min(1.0, powerFactor))) * (180 / Math.PI)).toFixed(1)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* 1. V_RMS Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#262A33] bg-[#181B20] p-5 shadow-lg shadow-black/40 hover:border-gray-600 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Zap size={14} className="text-[#00F0FF]" /> Line Voltage (V_RMS)
          </span>
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold font-mono border ${
              isOverVoltage
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : isUnderVoltage
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {voltageStatus}
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black font-mono tracking-tight text-white">
            {voltage.toFixed(1)}
          </span>
          <span className="text-sm font-bold font-mono text-[#00F0FF]">V</span>
        </div>

        <div className="mt-4 pt-3 border-t border-[#262A33] flex items-center justify-between text-[11px] font-mono text-gray-400">
          <span>Register 0x021C</span>
          <span className="text-gray-300 font-medium">Nominal: 230.0 V</span>
        </div>

        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -bottom-6 -right-6 size-24 rounded-full bg-[#00F0FF]/5 blur-2xl" />
      </div>

      {/* 2. I_RMS Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#262A33] bg-[#181B20] p-5 shadow-lg shadow-black/40 hover:border-gray-600 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Activity size={14} className="text-[#10B981]" /> Line Current (I_RMS)
          </span>
          <span className="rounded-md bg-[#10B981]/10 px-2 py-0.5 text-[10px] font-bold font-mono text-[#10B981] border border-[#10B981]/30">
            SCT-013 CT
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black font-mono tracking-tight text-white">
            {current.toFixed(3)}
          </span>
          <span className="text-sm font-bold font-mono text-[#10B981]">A</span>
        </div>

        <div className="mt-4 pt-3 border-t border-[#262A33] flex items-center justify-between text-[11px] font-mono text-gray-400">
          <span>Apparent S</span>
          <span className="text-gray-300 font-medium">{apparentVA.toFixed(1)} VA</span>
        </div>

        <div className="pointer-events-none absolute -bottom-6 -right-6 size-24 rounded-full bg-[#10B981]/5 blur-2xl" />
      </div>

      {/* 3. Power Factor Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#262A33] bg-[#181B20] p-5 shadow-lg shadow-black/40 hover:border-gray-600 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Compass size={14} className="text-[#F59E0B]" /> Power Factor (cos φ)
          </span>
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold font-mono border ${
              powerFactor >= 0.95
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : powerFactor >= 0.85
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {powerFactor >= 0.98 ? 'UNITY' : 'LAGGING'}
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black font-mono tracking-tight text-white">
            {powerFactor.toFixed(2)}
          </span>
          <span className="text-xs font-mono text-gray-400">({(powerFactor * 100).toFixed(0)}%)</span>
        </div>

        <div className="mt-4 pt-3 border-t border-[#262A33] flex items-center justify-between text-[11px] font-mono text-gray-400">
          <span>Phase Shift φ</span>
          <span className="text-gray-300 font-medium">{phaseAngleDeg}°</span>
        </div>

        <div className="pointer-events-none absolute -bottom-6 -right-6 size-24 rounded-full bg-[#F59E0B]/5 blur-2xl" />
      </div>

      {/* 4. Frequency Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#262A33] bg-[#181B20] p-5 shadow-lg shadow-black/40 hover:border-gray-600 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Waves size={14} className="text-[#8B5CF6]" /> Grid Frequency
          </span>
          <span className="rounded-md bg-[#8B5CF6]/10 px-2 py-0.5 text-[10px] font-bold font-mono text-[#8B5CF6] border border-[#8B5CF6]/30">
            50 Hz GRID
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black font-mono tracking-tight text-white">
            {frequency.toFixed(2)}
          </span>
          <span className="text-sm font-bold font-mono text-[#8B5CF6]">Hz</span>
        </div>

        <div className="mt-4 pt-3 border-t border-[#262A33] flex items-center justify-between text-[11px] font-mono text-gray-400">
          <span>Deviation</span>
          <span className="text-gray-300 font-medium">
            {frequency >= 50 ? `+${(frequency - 50).toFixed(2)}` : (frequency - 50).toFixed(2)} Hz
          </span>
        </div>

        <div className="pointer-events-none absolute -bottom-6 -right-6 size-24 rounded-full bg-[#8B5CF6]/5 blur-2xl" />
      </div>
    </div>
  )
}

