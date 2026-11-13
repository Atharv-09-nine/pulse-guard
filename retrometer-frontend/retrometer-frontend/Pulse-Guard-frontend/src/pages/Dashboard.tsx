import React from 'react'
import { useTelemetry } from '../context/TelemetryContext'
import { useTheme } from '../context/ThemeContext'
import ConcentricDualRingGauge from '../components/ConcentricDualRingGauge'
import LiveTelemetryChart from '../components/LiveTelemetryChart'
import { Zap, Activity, Compass, Waves } from 'lucide-react'

export default function Dashboard() {
  const {
    telemetry,
    history,
    isPulseBlinking,
  } = useTelemetry()
  const { colors } = useTheme()

  const { voltage, current, powerFactor, frequency, apparentVA } = telemetry

  // Voltage status check
  const isOverVoltage = voltage >= 260.0
  const isUnderVoltage = voltage <= 200.0 && voltage > 20.0
  const voltageStatus = isOverVoltage ? 'High Voltage' : isUnderVoltage ? 'Low Voltage' : 'Normal (230V)'

  return (
    <div className="space-y-6">
      {/* 4 Consumer-Friendly Live Cards: Voltage, Current, Power Factor, Frequency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 font-mono">
        {/* 1. Voltage */}
        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
          className="relative overflow-hidden rounded-2xl border p-5 shadow-lg transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <span
              style={{ color: colors.textSecondary }}
              className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Zap size={14} style={{ color: colors.accentCyan }} /> Mains Voltage
            </span>
            <span
              style={{
                backgroundColor: isOverVoltage || isUnderVoltage ? `${colors.accentRose}20` : `${colors.accentEmerald}15`,
                color: isOverVoltage || isUnderVoltage ? colors.accentRose : colors.accentEmerald,
                borderColor: isOverVoltage || isUnderVoltage ? `${colors.accentRose}40` : `${colors.accentEmerald}40`,
              }}
              className="rounded-md px-2 py-0.5 text-[10px] font-bold border"
            >
              {voltageStatus}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span style={{ color: colors.textPrimary }} className="text-3xl font-black">
              {voltage.toFixed(1)}
            </span>
            <span style={{ color: colors.accentCyan }} className="text-sm font-bold">
              V
            </span>
          </div>
          <div
            style={{ borderColor: colors.border, color: colors.textMuted }}
            className="mt-4 pt-3 border-t flex items-center justify-between text-[11px]"
          >
            <span>Grid Standard</span>
            <span style={{ color: colors.textSecondary }} className="font-medium">
              Nominal: 230 V
            </span>
          </div>
        </div>

        {/* 2. Current */}
        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
          className="relative overflow-hidden rounded-2xl border p-5 shadow-lg transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <span
              style={{ color: colors.textSecondary }}
              className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Activity size={14} style={{ color: colors.accentEmerald }} /> Line Current
            </span>
            <span
              style={{
                backgroundColor: `${colors.accentEmerald}15`,
                color: colors.accentEmerald,
                borderColor: `${colors.accentEmerald}40`,
              }}
              className="rounded-md px-2 py-0.5 text-[10px] font-bold border"
            >
              Optimal Load
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span style={{ color: colors.textPrimary }} className="text-3xl font-black">
              {current.toFixed(3)}
            </span>
            <span style={{ color: colors.accentEmerald }} className="text-sm font-bold">
              A
            </span>
          </div>
          <div
            style={{ borderColor: colors.border, color: colors.textMuted }}
            className="mt-4 pt-3 border-t flex items-center justify-between text-[11px]"
          >
            <span>Apparent Power</span>
            <span style={{ color: colors.textSecondary }} className="font-medium">
              {apparentVA.toFixed(0)} VA
            </span>
          </div>
        </div>

        {/* 3. Power Factor */}
        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
          className="relative overflow-hidden rounded-2xl border p-5 shadow-lg transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <span
              style={{ color: colors.textSecondary }}
              className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Compass size={14} style={{ color: colors.accentAmber }} /> Power Quality
            </span>
            <span
              style={{
                backgroundColor: powerFactor >= 0.90 ? `${colors.accentEmerald}15` : `${colors.accentAmber}15`,
                color: powerFactor >= 0.90 ? colors.accentEmerald : colors.accentAmber,
                borderColor: powerFactor >= 0.90 ? `${colors.accentEmerald}40` : `${colors.accentAmber}40`,
              }}
              className="rounded-md px-2 py-0.5 text-[10px] font-bold border"
            >
              {powerFactor >= 0.90 ? 'Grid Healthy' : 'Fair Efficiency'}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span style={{ color: colors.textPrimary }} className="text-3xl font-black">
              {powerFactor.toFixed(2)}
            </span>
            <span style={{ color: colors.textMuted }} className="text-xs">
              ({(powerFactor * 100).toFixed(0)}%)
            </span>
          </div>
          <div
            style={{ borderColor: colors.border, color: colors.textMuted }}
            className="mt-4 pt-3 border-t flex items-center justify-between text-[11px]"
          >
            <span>Efficiency Rating</span>
            <span style={{ color: colors.textSecondary }} className="font-medium">
              94% Efficient
            </span>
          </div>
        </div>

        {/* 4. Frequency */}
        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
          className="relative overflow-hidden rounded-2xl border p-5 shadow-lg transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <span
              style={{ color: colors.textSecondary }}
              className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Waves size={14} style={{ color: colors.accentPurple }} /> Grid Frequency
            </span>
            <span
              style={{
                backgroundColor: `${colors.accentPurple}15`,
                color: colors.accentPurple,
                borderColor: `${colors.accentPurple}40`,
              }}
              className="rounded-md px-2 py-0.5 text-[10px] font-bold border"
            >
              50 Hz Stable
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span style={{ color: colors.textPrimary }} className="text-3xl font-black">
              {frequency.toFixed(2)}
            </span>
            <span style={{ color: colors.accentPurple }} className="text-sm font-bold">
              Hz
            </span>
          </div>
          <div
            style={{ borderColor: colors.border, color: colors.textMuted }}
            className="mt-4 pt-3 border-t flex items-center justify-between text-[11px]"
          >
            <span>Grid Sync</span>
            <span style={{ color: colors.textSecondary }} className="font-medium">
              Locked ±0.03Hz
            </span>
          </div>
        </div>
      </div>

      {/* Main Centerpiece & Synchronous Waveform Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Centerpiece: Schneider-Style Concentric Dual-Ring Power Gauge (Span 5) */}
        <div className="lg:col-span-5 flex flex-col">
          <ConcentricDualRingGauge
            telemetry={telemetry}
            isPulseBlinking={isPulseBlinking}
          />
        </div>

        {/* Right: Real-Time Rolling Telemetry Chart & Appliance Breakdown (Span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <LiveTelemetryChart history={history} telemetry={telemetry} />
        </div>
      </div>
    </div>
  )
}
