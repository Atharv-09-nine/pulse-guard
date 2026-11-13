import React, { useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Flame, Tv, Fan, Moon, Sparkles, Layers } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import type { TelemetryData } from '../types/telemetry'

interface SanzoWadaNILMBreakdownProps {
  telemetry: TelemetryData
}

// Sanzo Wada Traditional Color Harmonies
const SANZO_COLORS = {
  celadon: '#2E7D6B',   // Celadon Green: Heating / Resistive
  indigo: '#3B7A9E',    // Faded Indigo: Electronics / Inverters
  mustard: '#D4A373',   // Muted Mustard Gold: Refrigeration & Cooling
  persimmon: '#C2410C', // Persimmon Red: Vampire / Standby
}

export default function SanzoWadaNILMBreakdown({ telemetry }: SanzoWadaNILMBreakdownProps) {
  const { colors } = useTheme()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const { activeWatts, thdPercent, h3Percent, loadBreakdown } = telemetry
  const {
    heatingWatts = 0,
    heatingPercent = 0,
    electronicsWatts = 0,
    electronicsPercent = 0,
    coolingWatts = 0,
    coolingPercent = 0,
    vampireWatts = 0,
    vampirePercent = 0,
  } = loadBreakdown

  // Data items formatted for Recharts Donut
  const segments = [
    {
      name: 'Heating / Resistive',
      desc: 'Geysers, kettles, irons, toasters (THD < 2%)',
      watts: heatingWatts,
      percent: heatingPercent,
      color: SANZO_COLORS.celadon,
      icon: Flame,
    },
    {
      name: 'Electronics / Inverters',
      desc: 'Computers, TVs, inverter ACs, chargers (THD ≥ 2%, H3)',
      watts: electronicsWatts,
      percent: electronicsPercent,
      color: SANZO_COLORS.indigo,
      icon: Tv,
    },
    {
      name: 'Refrigeration & Cooling',
      desc: 'Compressors, ceiling fans, continuous motors',
      watts: coolingWatts,
      percent: coolingPercent,
      color: SANZO_COLORS.mustard,
      icon: Fan,
    },
    {
      name: 'Vampire / Standby',
      desc: 'Routers, clocks, idle adapters (draw < 50W)',
      watts: vampireWatts,
      percent: vampirePercent,
      color: SANZO_COLORS.persimmon,
      icon: Moon,
    },
  ]

  // Recharts requires non-zero values to render slices; provide safe fallback
  const chartData = segments.map((s) => ({
    ...s,
    value: activeWatts > 0 ? (s.watts > 0 ? s.watts : 1) : 1,
  }))

  return (
    <div
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        color: colors.textPrimary,
      }}
      className="rounded-2xl border p-5 shadow-lg font-mono transition-colors duration-200"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: colors.border }}>
        <div>
          <div className="flex items-center gap-2">
            <div
              style={{
                backgroundColor: `${SANZO_COLORS.celadon}20`,
                borderColor: `${SANZO_COLORS.celadon}40`,
                color: SANZO_COLORS.celadon,
              }}
              className="size-8 rounded-lg border flex items-center justify-center"
            >
              <Sparkles size={16} />
            </div>
            <h3 className="text-base font-bold tracking-tight" style={{ color: colors.textPrimary }}>
              Appliance Breakdown (Harmonics / NILM Translation)
            </h3>
          </div>
          <p style={{ color: colors.textMuted }} className="text-xs mt-1">
            Non-Intrusive Load Monitoring classified by current waveshape & Goertzel harmonics (THD: {thdPercent}%, H3: {h3Percent}%)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            style={{
              backgroundColor: `${SANZO_COLORS.indigo}15`,
              color: SANZO_COLORS.indigo,
              borderColor: `${SANZO_COLORS.indigo}30`,
            }}
            className="rounded px-2.5 py-1 text-[10px] font-bold border"
          >
            Sanzo Wada Quadrant
          </span>
        </div>
      </div>

      {/* Main Grid: Left Donut Chart (Sanzo Wada Segments), Right 4 Interactive Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-5">
        {/* Donut Chart (Span 5) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="size-60 sm:size-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={96}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={600}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={activeIndex === index ? '#FFFFFF' : 'none'}
                      strokeWidth={activeIndex === index ? 2 : 0}
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div
                          style={{
                            backgroundColor: colors.card,
                            borderColor: data.color,
                            color: colors.textPrimary,
                          }}
                          className="rounded-xl border p-2.5 shadow-xl text-xs font-mono"
                        >
                          <span className="font-bold block" style={{ color: data.color }}>
                            {data.name}
                          </span>
                          <span className="text-[11px] block mt-0.5">
                            {data.watts} W ({data.percent}%)
                          </span>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Hole Centerpiece */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span style={{ color: colors.textMuted }} className="text-[10px] uppercase font-bold tracking-wider">
                Total Load
              </span>
              <span className="text-2xl font-black tracking-tight" style={{ color: colors.textPrimary }}>
                {activeWatts >= 1000 ? `${(activeWatts / 1000).toFixed(2)} kW` : `${activeWatts.toFixed(0)} W`}
              </span>
              <span style={{ color: SANZO_COLORS.celadon }} className="text-[10px] font-bold mt-0.5">
                Harmonic NILM
              </span>
            </div>
          </div>
        </div>

        {/* 4 Interactive Breakdown Cards (Span 7) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {segments.map((item, index) => {
            const Icon = item.icon
            const isHovered = activeIndex === index

            return (
              <div
                key={item.name}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                style={{
                  backgroundColor: isHovered ? `${item.color}15` : colors.canvas,
                  borderColor: isHovered ? item.color : colors.border,
                }}
                className="p-3.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        backgroundColor: `${item.color}20`,
                        color: item.color,
                      }}
                      className="size-7 rounded-lg flex items-center justify-center shrink-0"
                    >
                      <Icon size={14} />
                    </div>
                    <span className="font-bold text-xs" style={{ color: colors.textPrimary }}>
                      {item.name}
                    </span>
                  </div>
                  <span
                    style={{
                      backgroundColor: `${item.color}20`,
                      color: item.color,
                      borderColor: `${item.color}40`,
                    }}
                    className="rounded px-2 py-0.5 text-[10px] font-bold border"
                  >
                    {item.percent}%
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-lg font-black" style={{ color: item.color }}>
                    {item.watts} W
                  </span>
                  <span style={{ color: colors.textMuted }} className="text-[10px]">
                    {item.percent > 0 ? 'Active draw' : 'Idle'}
                  </span>
                </div>

                <p style={{ color: colors.textMuted }} className="text-[10px] mt-1.5 leading-snug">
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

