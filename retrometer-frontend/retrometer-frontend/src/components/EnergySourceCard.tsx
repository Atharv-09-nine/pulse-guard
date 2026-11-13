import React from 'react'
import type { EnergySource } from '../types/telemetry'
import { useTelemetry } from '../context/TelemetryContext'
import { useTheme } from '../context/ThemeContext'
import SourceArtwork from './SourceArtwork'
import { Zap, Activity, Clock, IndianRupee, Trash2, Power, CheckCircle, AlertCircle } from 'lucide-react'

interface EnergySourceCardProps {
  source: EnergySource
}

export default function EnergySourceCard({ source }: EnergySourceCardProps) {
  const { toggleSourceActive, removeSource } = useTelemetry()
  const { colors } = useTheme()

  const isGrid = source.preset === 'grid'
  const isSolar = source.preset === 'solar'
  const isDG = source.preset === 'dg'

  // Accent color for source
  const accentColor = isSolar
    ? colors.accentEmerald
    : isGrid
    ? colors.accentCyan
    : isDG
    ? colors.accentAmber
    : colors.accentPurple

  const isProtected = source.ctChannel === 1 || source.id === 'src-grid'

  return (
    <div
      style={{
        backgroundColor: colors.card,
        borderColor: source.active ? `${accentColor}60` : colors.border,
        color: colors.textPrimary,
      }}
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-lg transition-all duration-300 flex flex-col justify-between ${
        source.active ? 'shadow-md' : 'opacity-70'
      }`}
    >
      {/* Top Banner & Hardware CT Channel Pill */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              style={{
                backgroundColor: `${accentColor}20`,
                borderColor: `${accentColor}40`,
                color: accentColor,
              }}
              className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border font-mono flex items-center gap-1"
            >
              CT-{source.ctChannel}
            </span>
            <span
              style={{
                backgroundColor: source.active ? `${colors.accentEmerald}15` : `${colors.textMuted}15`,
                color: source.active ? colors.accentEmerald : colors.textMuted,
                borderColor: source.active ? `${colors.accentEmerald}40` : `${colors.border}`,
              }}
              className="rounded-md px-2 py-0.5 text-[10px] font-bold border font-mono"
            >
              {source.active ? (source.isProducer ? 'GENERATING' : 'ONLINE') : 'STANDBY'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Active / Standby Toggle Switch */}
            <button
              type="button"
              onClick={() => toggleSourceActive(source.id)}
              style={{
                backgroundColor: source.active ? accentColor : `${colors.border}`,
                color: source.active ? '#FFFFFF' : colors.textMuted,
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
              title={source.active ? 'Toggle to Standby' : 'Activate Source'}
            >
              <Power size={12} className={source.active ? 'animate-pulse' : ''} />
              <span>{source.active ? 'Active' : 'Standby'}</span>
            </button>

            {/* User-Added Source Delete Button (CT-1 Utility Grid is Protected) */}
            {!isProtected && (
              <button
                type="button"
                onClick={() => removeSource(source.id)}
                style={{ color: colors.accentRose }}
                className="p-1 rounded-md hover:bg-rose-500/10 transition-colors"
                title="Remove Energy Source"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Source Title & Subtitle */}
        <div className="mt-3">
          <h3 style={{ color: colors.textPrimary }} className="text-base font-bold tracking-tight">
            {source.name}
          </h3>
          <p style={{ color: colors.textMuted }} className="text-xs font-mono">
            {source.isProducer ? 'On-site Generation' : 'Distribution Consumption'} // SCT-013 on CT-{source.ctChannel}
          </p>
        </div>

        {/* Visual Artwork Centerpiece */}
        <div className="my-4 flex items-center justify-center p-3 rounded-xl bg-black/10 dark:bg-black/30 border border-white/5">
          <SourceArtwork preset={source.preset} active={source.active} size={110} />
        </div>

        {/* Real-Time Telemetry Metrics Grid (Shared Voltage Bus) */}
        <div className="grid grid-cols-2 gap-2.5 text-xs font-mono mt-3">
          {/* Active Power */}
          <div
            style={{
              backgroundColor: colors.canvas,
              borderColor: colors.border,
            }}
            className="p-2.5 rounded-xl border flex flex-col justify-between"
          >
            <span style={{ color: colors.textMuted }} className="text-[10px] uppercase font-bold flex items-center gap-1">
              <Zap size={11} style={{ color: accentColor }} /> Active Power
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span style={{ color: colors.textPrimary }} className="text-lg font-black">
                {source.active
                  ? source.activeWatts >= 1000
                    ? (source.activeWatts / 1000).toFixed(2)
                    : source.activeWatts.toFixed(0)
                  : '0'}
              </span>
              <span style={{ color: accentColor }} className="text-[10px] font-bold">
                {source.activeWatts >= 1000 ? 'kW' : 'W'}
              </span>
            </div>
          </div>

          {/* Current (SCT-013) */}
          <div
            style={{
              backgroundColor: colors.canvas,
              borderColor: colors.border,
            }}
            className="p-2.5 rounded-xl border flex flex-col justify-between"
          >
            <span style={{ color: colors.textMuted }} className="text-[10px] uppercase font-bold flex items-center gap-1">
              <Activity size={11} style={{ color: colors.accentEmerald }} /> CT Current
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span style={{ color: colors.textPrimary }} className="text-lg font-black">
                {source.active ? source.current.toFixed(2) : '0.00'}
              </span>
              <span style={{ color: colors.accentEmerald }} className="text-[10px] font-bold">
                A
              </span>
            </div>
          </div>

          {/* Shared Bus Voltage */}
          <div
            style={{
              backgroundColor: colors.canvas,
              borderColor: colors.border,
            }}
            className="p-2.5 rounded-xl border flex flex-col justify-between"
          >
            <span style={{ color: colors.textMuted }} className="text-[10px] uppercase font-bold flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-cyan-400"></span> Shared V_RMS
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span style={{ color: colors.textPrimary }} className="text-base font-bold">
                {source.voltage.toFixed(1)}
              </span>
              <span style={{ color: colors.accentCyan }} className="text-[10px] font-bold">
                V
              </span>
            </div>
          </div>

          {/* Today Energy */}
          <div
            style={{
              backgroundColor: colors.canvas,
              borderColor: colors.border,
            }}
            className="p-2.5 rounded-xl border flex flex-col justify-between"
          >
            <span style={{ color: colors.textMuted }} className="text-[10px] uppercase font-bold flex items-center gap-1">
              <Clock size={11} style={{ color: colors.accentAmber }} /> Today Energy
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span style={{ color: colors.textPrimary }} className="text-base font-bold">
                {source.todayKWh.toFixed(2)}
              </span>
              <span style={{ color: colors.accentAmber }} className="text-[10px] font-bold">
                kWh
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Tariff & Calibration Gain Info */}
      <div
        style={{
          borderColor: colors.border,
          color: colors.textMuted,
        }}
        className="mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-mono"
      >
        <span className="flex items-center gap-1">
          <IndianRupee size={11} style={{ color: colors.accentEmerald }} />
          <span>Rate: ₹{source.tariffRate.toFixed(2)}/kWh</span>
        </span>
        <span style={{ color: colors.textSecondary }} className="text-[10px]">
          Ki_ph: {source.calMultiplier.toFixed(3)}
        </span>
      </div>
    </div>
  )
}

