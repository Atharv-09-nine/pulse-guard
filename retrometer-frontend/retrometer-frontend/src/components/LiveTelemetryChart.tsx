import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { Activity, ShieldAlert, Sparkles, Terminal } from 'lucide-react'
import type { TelemetryData } from '../types/telemetry'
import { useTheme } from '../context/ThemeContext'

interface LiveTelemetryChartProps {
  history: TelemetryData[]
  telemetry: TelemetryData
}

export default function LiveTelemetryChart({ history, telemetry }: LiveTelemetryChartProps) {
  const { colors } = useTheme()

  const chartData = history.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
    ctWatts: item.activeWatts,
    opticalWatts: item.opticalWatts,
    voltage: item.voltage,
    current: item.current,
  }))

  const isTamper = telemetry.tamperDetected

  return (
    <div
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        color: colors.textPrimary,
      }}
      className="rounded-2xl border p-5 shadow-lg space-y-4 transition-colors duration-200"
    >
      {/* Chart Header */}
      <div
        style={{ borderColor: colors.border }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3"
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
            <Activity size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono">
              Synchronous Dual-Vector Waveform Stream
            </h3>
            <span style={{ color: colors.textMuted }} className="text-[11px] font-mono">
              ADE7953 CT AWATT vs BPW34 Optical (3200 imp/kWh) Real-Time History
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: colors.accentCyan }} />
            <span style={{ color: colors.textSecondary }}>P_elec (CT)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: isTamper ? colors.accentRose : colors.accentEmerald }}
            />
            <span style={{ color: colors.textSecondary }}>P_opt (Optical)</span>
          </div>
        </div>
      </div>

      {/* Recharts Area - Fully Reactive to Theme! */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="areaCt" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors.accentCyan} stopOpacity={0.35} />
                <stop offset="100%" stopColor={colors.accentCyan} stopOpacity={0.0} />
              </linearGradient>

              <linearGradient id="areaOpt" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  stopColor={isTamper ? colors.accentRose : colors.accentEmerald}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={isTamper ? colors.accentRose : colors.accentEmerald}
                  stopOpacity={0.0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} vertical={false} />
            <XAxis
              dataKey="time"
              stroke={colors.chartText}
              fontSize={10}
              tickLine={false}
              interval="preserveStartEnd"
              fontFamily="monospace"
            />
            <YAxis
              stroke={colors.chartText}
              fontSize={10}
              tickLine={false}
              fontFamily="monospace"
              unit="W"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.chartTooltipBg,
                borderColor: colors.chartTooltipBorder,
                borderRadius: '0.75rem',
                fontFamily: 'monospace',
                fontSize: '11px',
                color: colors.textPrimary,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              }}
              itemStyle={{ color: colors.textPrimary }}
            />
            <Area
              type="monotone"
              dataKey="ctWatts"
              name="CT Active (W)"
              stroke={colors.accentCyan}
              strokeWidth={2}
              fill="url(#areaCt)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="opticalWatts"
              name="Optical (W)"
              stroke={isTamper ? colors.accentRose : colors.accentEmerald}
              strokeWidth={2}
              strokeDasharray={isTamper ? '4 2' : undefined}
              fill="url(#areaOpt)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Telemetry Stream Diagnostics Bar */}
      <div
        style={{ borderColor: colors.border }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-[11px] font-mono"
      >
        <div
          style={{
            backgroundColor: colors.subtle,
            borderColor: colors.border,
          }}
          className="rounded-lg p-2 border"
        >
          <span style={{ color: colors.textMuted }} className="block text-[10px]">Pulse Interval</span>
          <span style={{ color: colors.accentEmerald }} className="font-bold">{telemetry.pulseIntervalMs} ms</span>
        </div>
        <div
          style={{
            backgroundColor: colors.subtle,
            borderColor: colors.border,
          }}
          className="rounded-lg p-2 border"
        >
          <span style={{ color: colors.textMuted }} className="block text-[10px]">Total Pulses (LED)</span>
          <span className="font-bold">{telemetry.pulseCount}</span>
        </div>
        <div
          style={{
            backgroundColor: colors.subtle,
            borderColor: colors.border,
          }}
          className="rounded-lg p-2 border"
        >
          <span style={{ color: colors.textMuted }} className="block text-[10px]">THD (Harmonics)</span>
          <span style={{ color: colors.accentPurple }} className="font-bold">{telemetry.thdPercent}%</span>
        </div>
        <div
          style={{
            backgroundColor: colors.subtle,
            borderColor: colors.border,
          }}
          className="rounded-lg p-2 border"
        >
          <span style={{ color: colors.textMuted }} className="block text-[10px]">Vector Delta (Δ)</span>
          <span
            style={{ color: isTamper ? colors.accentRose : colors.accentEmerald }}
            className="font-bold"
          >
            {telemetry.discrepancyPercent}%
          </span>
        </div>
      </div>
    </div>
  )
}
