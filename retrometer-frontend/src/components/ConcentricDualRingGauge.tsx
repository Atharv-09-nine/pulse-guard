import React, { useState } from 'react'
import { Zap, Eye, AlertTriangle, CheckCircle, IndianRupee, Flame, ShieldAlert, Sparkles, Layers } from 'lucide-react'
import type { TelemetryData } from '../types/telemetry'
import { useTheme } from '../context/ThemeContext'

interface ConcentricDualRingGaugeProps {
  telemetry: TelemetryData
  isPulseBlinking: boolean
}

export default function ConcentricDualRingGauge({
  telemetry,
  isPulseBlinking,
}: ConcentricDualRingGaugeProps) {
  const [powerUnit, setPowerUnit] = useState<'W' | 'kW'>('W')
  const { colors, theme } = useTheme()

  const {
    activeWatts,
    opticalWatts,
    totalKWh,
    todayCostInr,
    discrepancyPercent,
    tamperSeverity,
    tamperMessage,
    tamperDetected,
    pulseIntervalMs,
    pulseCount,
    loadBreakdown,
  } = telemetry

  // Max scale for gauges: 5000 W
  const MAX_WATTS = 5000
  const pElecClamped = Math.min(MAX_WATTS, Math.max(0, activeWatts))
  const pOptClamped = Math.min(MAX_WATTS, Math.max(0, opticalWatts))

  // Geometry
  const size = 380
  const center = size / 2

  // Outer Ring (Dual Arcs for P_elec and P_opt)
  const outerR = 158
  const outerCircumference = 2 * Math.PI * outerR
  const arcFraction = 260 / 360
  const outerArcLength = outerCircumference * arcFraction

  const pElecDash = (pElecClamped / MAX_WATTS) * outerArcLength
  const pOptDash = (pOptClamped / MAX_WATTS) * outerArcLength

  // Inner Ring (Load Breakdown Segments)
  const innerR = 122
  const innerCircumference = 2 * Math.PI * innerR
  const innerArcFraction = 260 / 360
  const innerArcLength = innerCircumference * innerArcFraction

  // Segments for Inner Ring
  const { hvacPercent, kitchenPercent, geyserPercent, basePercent } = loadBreakdown
  const hvacLen = (hvacPercent / 100) * innerArcLength
  const kitchenLen = (kitchenPercent / 100) * innerArcLength
  const geyserLen = (geyserPercent / 100) * innerArcLength
  const baseLen = (basePercent / 100) * innerArcLength

  // Display formats
  const displayPower = powerUnit === 'kW' ? (activeWatts / 1000).toFixed(2) : Math.round(activeWatts).toLocaleString()
  const displayUnit = powerUnit

  // Tamper color scheme
  const isSevereTamper = Math.abs(discrepancyPercent) >= 20 || tamperSeverity === 'CRITICAL'
  const isModerateTamper = Math.abs(discrepancyPercent) >= 8 || tamperSeverity === 'WARNING'

  return (
    <div
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        color: colors.textPrimary,
      }}
      className="relative flex flex-col items-center justify-center rounded-2xl border p-6 shadow-xl transition-colors duration-200"
    >
      {/* Top Header Row of the Gauge Container */}
      <div
        style={{ borderColor: colors.border }}
        className="w-full flex items-center justify-between border-b pb-4 mb-4"
      >
        <div className="flex items-center gap-2">
          <div
            style={{
              backgroundColor: `${colors.accentCyan}20`,
              borderColor: `${colors.accentCyan}40`,
              color: colors.accentCyan,
            }}
            className="size-8 rounded-lg border flex items-center justify-center"
          >
            <Layers size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono flex items-center gap-2">
              Concentric Dual-Vector Gauge
            </h3>
            <span style={{ color: colors.textMuted }} className="text-[11px] font-mono">
              Outer: Optical vs CT Vector • Inner: Load Breakdown
            </span>
          </div>
        </div>

        {/* Unit Toggle and Status Pill */}
        <div className="flex items-center gap-2">
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="flex rounded-lg border p-0.5 font-mono text-xs"
          >
            <button
              type="button"
              onClick={() => setPowerUnit('W')}
              style={{
                backgroundColor: powerUnit === 'W' ? colors.accentCyan : 'transparent',
                color: powerUnit === 'W' ? '#FFFFFF' : colors.textSecondary,
              }}
              className="rounded-md px-2 py-1 transition-all font-bold shadow-xs"
            >
              Watts
            </button>
            <button
              type="button"
              onClick={() => setPowerUnit('kW')}
              style={{
                backgroundColor: powerUnit === 'kW' ? colors.accentCyan : 'transparent',
                color: powerUnit === 'kW' ? '#FFFFFF' : colors.textSecondary,
              }}
              className="rounded-md px-2 py-1 transition-all font-bold shadow-xs"
            >
              kW
            </button>
          </div>

          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${
              isSevereTamper
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 animate-pulse'
                : isModerateTamper
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
            }`}
          >
            {isSevereTamper ? (
              <>
                <ShieldAlert size={13} />
                <span>TAMPER ALERT (Δ {discrepancyPercent}%)</span>
              </>
            ) : isModerateTamper ? (
              <>
                <AlertTriangle size={13} />
                <span>DELTA WARNING (Δ {discrepancyPercent}%)</span>
              </>
            ) : (
              <>
                <CheckCircle size={13} />
                <span>VECTORS SYNCED (Δ {discrepancyPercent}%)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SVG Concentric Dual Ring Area */}
      <div className="relative flex items-center justify-center my-2">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible select-none"
        >
          <defs>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="grad-ct" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.accentCyan} />
              <stop
                offset="100%"
                stopColor={colors.name === 'crimson-peach' ? '#A84342' : '#3B82F6'}
              />
            </linearGradient>

            <linearGradient id="grad-opt" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.accentEmerald} />
              <stop
                offset="100%"
                stopColor={colors.name === 'crimson-peach' ? '#15803D' : '#059669'}
              />
            </linearGradient>

            <linearGradient id="grad-tamper" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.accentRose} />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>
          </defs>

          {/* Outer Track Background Circle - Reactive to Theme! */}
          <circle
            cx={center}
            cy={center}
            r={outerR}
            fill="none"
            stroke={colors.gaugeOuterBg}
            strokeWidth="12"
            strokeDasharray={`${outerArcLength} ${outerCircumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
            transform={`rotate(140 ${center} ${center})`}
          />

          {/* Inner Track Background Circle - Reactive to Theme! */}
          <circle
            cx={center}
            cy={center}
            r={innerR}
            fill="none"
            stroke={colors.gaugeInnerBg}
            strokeWidth="10"
            strokeDasharray={`${innerArcLength} ${innerCircumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
            transform={`rotate(140 ${center} ${center})`}
          />

          {/* OUTER RING ARC 1: Electrical CT Power (P_elec) in Cyan */}
          <circle
            cx={center}
            cy={center}
            r={outerR}
            fill="none"
            stroke="url(#grad-ct)"
            strokeWidth="8"
            strokeDasharray={`${pElecDash} ${outerCircumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
            transform={`rotate(140 ${center} ${center})`}
            filter="url(#glow-cyan)"
            className="transition-all duration-300 ease-out"
          />

          {/* OUTER RING ARC 2: Optical Power (P_opt) in Emerald or Tamper Red */}
          <circle
            cx={center}
            cy={center}
            r={outerR - 10}
            fill="none"
            stroke={isSevereTamper ? 'url(#grad-tamper)' : 'url(#grad-opt)'}
            strokeWidth="5"
            strokeDasharray={`${pOptDash} ${outerCircumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
            transform={`rotate(140 ${center} ${center})`}
            filter="url(#glow-emerald)"
            className="transition-all duration-300 ease-out"
          />

          {/* INNER RING: 4 NILM Load Segments */}
          {/* 1. HVAC Segment */}
          <circle
            cx={center}
            cy={center}
            r={innerR}
            fill="none"
            stroke={colors.accentCyan}
            strokeWidth="8"
            strokeDasharray={`${Math.max(0, hvacLen - 2)} ${innerCircumference}`}
            strokeDashoffset="0"
            strokeLinecap="butt"
            transform={`rotate(140 ${center} ${center})`}
            className="transition-all duration-300 ease-out"
          />

          {/* 2. Kitchen Segment */}
          <circle
            cx={center}
            cy={center}
            r={innerR}
            fill="none"
            stroke={colors.accentAmber}
            strokeWidth="8"
            strokeDasharray={`${Math.max(0, kitchenLen - 2)} ${innerCircumference}`}
            strokeDashoffset={-hvacLen}
            strokeLinecap="butt"
            transform={`rotate(140 ${center} ${center})`}
            className="transition-all duration-300 ease-out"
          />

          {/* 3. Geyser Segment */}
          <circle
            cx={center}
            cy={center}
            r={innerR}
            fill="none"
            stroke={colors.accentRose}
            strokeWidth="8"
            strokeDasharray={`${Math.max(0, geyserLen - 2)} ${innerCircumference}`}
            strokeDashoffset={-(hvacLen + kitchenLen)}
            strokeLinecap="butt"
            transform={`rotate(140 ${center} ${center})`}
            className="transition-all duration-300 ease-out"
          />

          {/* 4. Base Load Segment */}
          <circle
            cx={center}
            cy={center}
            r={innerR}
            fill="none"
            stroke={colors.accentPurple}
            strokeWidth="8"
            strokeDasharray={`${Math.max(0, baseLen - 2)} ${innerCircumference}`}
            strokeDashoffset={-(hvacLen + kitchenLen + geyserLen)}
            strokeLinecap="butt"
            transform={`rotate(140 ${center} ${center})`}
            className="transition-all duration-300 ease-out"
          />

          {/* Center Circular Mask Plate - Reactive to Theme! */}
          <circle
            cx={center}
            cy={center}
            r={innerR - 16}
            fill={colors.gaugeCenterBg}
            stroke={colors.border}
            strokeWidth="1.5"
          />
        </svg>

        {/* Centerpiece Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center text-center px-4 max-w-[210px]">
            {/* Blinking Optical Pulse LED Indicator */}
            <div className="flex items-center gap-1.5 mb-2 pointer-events-auto">
              <div className="relative flex items-center justify-center">
                <span
                  className={`size-3.5 rounded-full border transition-all duration-100 ${
                    isPulseBlinking
                      ? 'bg-[#10B981] border-[#34D399] shadow-[0_0_16px_#10B981] scale-125'
                      : 'bg-emerald-950/70 border-emerald-800'
                  }`}
                />
                {isPulseBlinking && (
                  <span className="absolute size-6 rounded-full bg-[#10B981]/40 animate-ping" />
                )}
              </div>
              <span
                style={{ color: colors.accentEmerald }}
                className="text-[10px] font-mono font-bold tracking-wider"
              >
                PULSE LED (3200 imp)
              </span>
            </div>

            {/* Live Active Power Large Readout */}
            <div className="flex items-baseline justify-center gap-1 my-0.5">
              <span
                style={{ color: colors.textPrimary }}
                className="text-4xl sm:text-5xl font-black font-mono tracking-tight drop-shadow-md"
              >
                {displayPower}
              </span>
              <span
                style={{ color: colors.accentCyan }}
                className="text-sm sm:text-base font-bold font-mono"
              >
                {displayUnit}
              </span>
            </div>

            <span style={{ color: colors.textMuted }} className="text-[10px] uppercase tracking-widest font-mono mb-2">
              Active Power (ADE7953)
            </span>

            {/* Divider line */}
            <div
              style={{ backgroundColor: colors.border }}
              className="w-32 h-px mb-2"
            />

            {/* Today's Energy & Today's Cost */}
            <div className="grid grid-cols-2 gap-2 w-full text-center">
              <div
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
                className="rounded-lg border py-1 px-1.5"
              >
                <span style={{ color: colors.textMuted }} className="text-[9px] uppercase tracking-wider block font-mono">
                  Today's Energy
                </span>
                <span style={{ color: colors.accentEmerald }} className="text-xs font-bold font-mono flex items-center justify-center gap-0.5">
                  <Zap size={11} className="fill-current" />
                  {totalKWh.toFixed(3)} <span style={{ color: colors.textMuted }} className="text-[9px]">kWh</span>
                </span>
              </div>

              <div
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
                className="rounded-lg border py-1 px-1.5"
              >
                <span style={{ color: colors.textMuted }} className="text-[9px] uppercase tracking-wider block font-mono">
                  Today's Cost
                </span>
                <span style={{ color: colors.accentAmber }} className="text-xs font-bold font-mono flex items-center justify-center gap-0.5">
                  <IndianRupee size={11} />
                  {todayCostInr.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ring Comparison & NILM Breakdown Footer Cards */}
      <div
        style={{ borderColor: colors.border }}
        className="w-full mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t"
      >
        {/* Outer Ring Comparison Details */}
        <div
          style={{
            backgroundColor: colors.subtle,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-3.5 space-y-2.5"
        >
          <div className="flex items-center justify-between text-xs font-mono">
            <span style={{ color: colors.textPrimary }} className="font-semibold flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: colors.accentCyan }} />
              Outer Ring: Dual-Vector
            </span>
            <span
              style={{
                backgroundColor: isSevereTamper ? 'rgba(239,68,68,0.2)' : `${colors.accentEmerald}20`,
                color: isSevereTamper ? colors.accentRose : colors.accentEmerald,
                borderColor: isSevereTamper ? colors.accentRose : colors.accentEmerald,
              }}
              className="font-bold px-1.5 py-0.5 rounded text-[10px] border"
            >
              Δ {discrepancyPercent}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
              className="rounded-lg p-2 border"
            >
              <span style={{ color: colors.textMuted }} className="text-[10px] block">P_elec (CT Line)</span>
              <span style={{ color: colors.accentCyan }} className="text-sm font-bold">{activeWatts.toFixed(1)} W</span>
            </div>
            <div
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
              className="rounded-lg p-2 border"
            >
              <span style={{ color: colors.textMuted }} className="text-[10px] block">P_opt (Optical)</span>
              <span
                style={{ color: isSevereTamper ? colors.accentRose : colors.accentEmerald }}
                className="text-sm font-bold"
              >
                {opticalWatts.toFixed(1)} W
              </span>
            </div>
          </div>
        </div>

        {/* Inner Ring: NILM Load Breakdown Legend */}
        <div
          style={{
            backgroundColor: colors.subtle,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-3.5 space-y-2.5"
        >
          <div className="flex items-center justify-between text-xs font-mono">
            <span style={{ color: colors.textPrimary }} className="font-semibold flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: colors.accentPurple }} />
              Inner Ring: Circuits
            </span>
            <span style={{ color: colors.textMuted }} className="text-[10px]">Top Loads</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
              className="rounded-lg p-2 border flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: colors.accentCyan }} />
                <span className="text-[11px]">HVAC</span>
              </div>
              <span className="font-bold text-[11px]">
                {loadBreakdown.hvacWatts}W <span style={{ color: colors.textMuted }} className="text-[9px]">({hvacPercent}%)</span>
              </span>
            </div>

            <div
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
              className="rounded-lg p-2 border flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: colors.accentAmber }} />
                <span className="text-[11px]">Kitchen</span>
              </div>
              <span className="font-bold text-[11px]">
                {loadBreakdown.kitchenWatts}W <span style={{ color: colors.textMuted }} className="text-[9px]">({kitchenPercent}%)</span>
              </span>
            </div>

            <div
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
              className="rounded-lg p-2 border flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: colors.accentRose }} />
                <span className="text-[11px]">Geyser</span>
              </div>
              <span className="font-bold text-[11px]">
                {loadBreakdown.geyserWatts}W <span style={{ color: colors.textMuted }} className="text-[9px]">({geyserPercent}%)</span>
              </span>
            </div>

            <div
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
              className="rounded-lg p-2 border flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: colors.accentPurple }} />
                <span className="text-[11px]">Base</span>
              </div>
              <span className="font-bold text-[11px]">
                {loadBreakdown.baseWatts}W <span style={{ color: colors.textMuted }} className="text-[9px]">({basePercent}%)</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
