import React, { useState, useMemo } from 'react'
import { useTelemetry } from '../context/TelemetryContext'
import { useTheme } from '../context/ThemeContext'
import {
  DollarSign,
  IndianRupee,
  Calendar,
  Clock,
  Zap,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Sliders,
  BarChart3,
  LineChart as LineChartIcon,
  Sparkles,
  ShieldCheck,
  Flame,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  ReferenceLine,
  ReferenceArea,
  Cell,
  Legend,
} from 'recharts'
import {
  getMonthlyData,
  getWeeklyData,
  getHourlyData,
  getQuarterData,
  calculateLoadDurationCurve,
  type IntervalPoint,
  type DemandQuarterPoint,
  type LoadDurationPoint,
} from '../utils/tariffData'

type IntervalTab = 'month' | 'week' | 'day_hours' | 'day_quarters'

export default function UsageTariffs() {
  const { telemetry, controls, updateControls } = useTelemetry()
  const { colors } = useTheme()

  // 1. Multi-Interval Navigation State
  const [intervalTab, setIntervalTab] = useState<IntervalTab>('day_hours')
  const [dateOffset, setDateOffset] = useState<number>(0)
  const [metricView, setMetricView] = useState<'kwh' | 'cost'>('kwh')

  // 2. Load Duration Curve Threshold Slider
  const [thresholdKw, setThresholdKw] = useState<number>(1.8)

  // 3. ToU Tariff Calculator Inputs
  const [peakRate, setPeakRate] = useState<number>(8.50)
  const [offPeakRate, setOffPeakRate] = useState<number>(4.20)
  const [weekendRate, setWeekendRate] = useState<number>(5.20)
  const [fixedCharges, setFixedCharges] = useState<number>(175.00) // ₹ / month
  const [dayType, setDayType] = useState<'weekday' | 'weekend'>('weekday')

  // Navigation handlers
  const handlePrev = () => setDateOffset((prev) => prev - 1)
  const handleNext = () => setDateOffset((prev) => prev + 1)
  const handleReset = () => setDateOffset(0)

  // Current Date display label depending on interval
  const dateLabel = useMemo(() => {
    const today = new Date(2026, 10, 13) // Nov 13, 2026
    if (intervalTab === 'month') {
      const yr = 2026 + dateOffset
      return `Year ${yr} (12 Months Overview)`
    }
    if (intervalTab === 'week') {
      const wkNum = 46 + dateOffset
      return `Week ${wkNum} · November 2026 (Mon — Sun)`
    }
    if (intervalTab === 'day_hours') {
      const d = new Date(today)
      d.setDate(d.getDate() + dateOffset)
      const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
      return `${d.toLocaleDateString('en-US', options)} (24-Hour Profile)`
    }
    // day_quarters
    const d = new Date(today)
    d.setDate(d.getDate() + dateOffset)
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
    return `${d.toLocaleDateString('en-US', options)} (96 × 15-Min Intervals)`
  }, [intervalTab, dateOffset])

  // Get active dataset based on tab
  const barData = useMemo(() => {
    if (intervalTab === 'month') return getMonthlyData(dateOffset)
    if (intervalTab === 'week') return getWeeklyData(dateOffset)
    if (intervalTab === 'day_hours') return getHourlyData(dateOffset)
    return [] // day_quarters handled separately
  }, [intervalTab, dateOffset])

  // 15-minute quarters data (96 intervals)
  const quarterData = useMemo(() => {
    return getQuarterData(dateOffset)
  }, [dateOffset])

  // Load duration curve points
  const ldcData = useMemo(() => {
    return calculateLoadDurationCurve(quarterData)
  }, [quarterData])

  // LDC Threshold Exceedance Math
  const exceedanceStats = useMemo(() => {
    const totalCount = quarterData.length
    const exceededCount = quarterData.filter((p) => p.avgKw >= thresholdKw).length
    const pct = totalCount > 0 ? +((exceededCount / totalCount) * 100).toFixed(1) : 0
    const hours = +((pct / 100) * 24).toFixed(1)

    // Energy above threshold
    const excessKwh = quarterData
      .filter((p) => p.avgKw >= thresholdKw)
      .reduce((acc, cur) => acc + (cur.avgKw - thresholdKw) * 0.25, 0)

    const peakKw = Math.max(...quarterData.map((p) => p.maxKw))
    const minKw = Math.min(...quarterData.map((p) => p.minKw))

    return {
      percentage: pct,
      hours,
      exceededCount,
      excessKwh: +excessKwh.toFixed(2),
      peakKw,
      minKw,
    }
  }, [quarterData, thresholdKw])

  // Bar Chart Aggregates
  const barAggregates = useMemo(() => {
    if (intervalTab === 'day_quarters') {
      const totalKwh = quarterData.reduce((acc, c) => acc + c.kwh, 0)
      const maxKw = Math.max(...quarterData.map((c) => c.maxKw))
      const avgKw = +(quarterData.reduce((acc, c) => acc + c.avgKw, 0) / quarterData.length).toFixed(2)
      const totalCost = +(totalKwh * controls.tariffRatePerKWh).toFixed(2)
      return { totalKwh: +totalKwh.toFixed(2), maxKw, avgKw, totalCost }
    }
    const totalKwh = barData.reduce((acc, c) => acc + c.kwh, 0)
    const maxKw = Math.max(...barData.map((c) => c.peakKw))
    const avgKw = +(totalKwh / (barData.length || 1)).toFixed(2)
    const totalCost = barData.reduce((acc, c) => acc + c.cost, 0)
    return { totalKwh: +totalKwh.toFixed(2), maxKw, avgKw, totalCost: +totalCost.toFixed(2) }
  }, [intervalTab, barData, quarterData, controls.tariffRatePerKWh])

  // ToU Billing Calculations
  const touBreakdown = useMemo(() => {
    let peakKwh = 0
    let offPeakKwh = 0
    let normalKwh = 0

    quarterData.forEach((q) => {
      const hour = Math.floor(q.quarterIndex / 4)
      if (hour >= 18 && hour < 22) {
        peakKwh += q.kwh
      } else if (hour >= 22 || hour < 6) {
        offPeakKwh += q.kwh
      } else {
        normalKwh += q.kwh
      }
    })

    const totalDailyKwh = +(peakKwh + offPeakKwh + normalKwh).toFixed(2)

    // Weekday vs Weekend calculations
    const peakCost = +(peakKwh * peakRate).toFixed(2)
    const offPeakCost = +(offPeakKwh * offPeakRate).toFixed(2)
    const normalCost = +(normalKwh * 6.50).toFixed(2)
    const weekendCost = +(totalDailyKwh * weekendRate).toFixed(2)

    const dailyFixed = +(fixedCharges / 30).toFixed(2)
    const weekdayDailyTotal = +(peakCost + offPeakCost + normalCost + dailyFixed).toFixed(2)
    const weekendDailyTotal = +(weekendCost + dailyFixed).toFixed(2)

    // Current selected day total
    const activeDailyTotal = dayType === 'weekend' ? weekendDailyTotal : weekdayDailyTotal

    // Weekly blended bill: 5 weekdays + 2 weekend days + (fixedCharges * 7 / 30)
    const weeklyFixed = +((fixedCharges * 7) / 30).toFixed(2)
    const weeklyEnergyCost = +((weekdayDailyTotal - dailyFixed) * 5 + weekendCost * 2).toFixed(2)
    const weeklyTotal = +(weeklyEnergyCost + weeklyFixed).toFixed(2)
    const monthlyTotal = +(activeDailyTotal * 30).toFixed(2)

    return {
      peakKwh: +peakKwh.toFixed(2),
      peakCost,
      offPeakKwh: +offPeakKwh.toFixed(2),
      offPeakCost,
      normalKwh: +normalKwh.toFixed(2),
      normalCost,
      weekendKwh: totalDailyKwh,
      weekendCost,
      dailyFixed,
      dailyTotal: activeDailyTotal,
      weeklyTotal,
      monthlyTotal,
      totalKwh: totalDailyKwh,
    }
  }, [quarterData, peakRate, offPeakRate, weekendRate, fixedCharges, dayType])

  return (
    <div className="space-y-6">
      {/* Top Header & Overview Bar */}
      <div
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.textPrimary,
        }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-5 shadow-lg transition-colors duration-200"
      >
        <div className="flex items-center gap-3.5">
          <div
            style={{
              backgroundColor: `${colors.accentAmber}15`,
              borderColor: `${colors.accentAmber}30`,
              color: colors.accentAmber,
            }}
            className="size-11 rounded-xl border flex items-center justify-center"
          >
            <DollarSign size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 style={{ color: colors.textPrimary }} className="text-base font-bold font-mono">
                View 2: Energy Usage & Time-of-Use (ToU) Tariffs
              </h2>
              <span
                style={{
                  backgroundColor: `${colors.accentAmber}15`,
                  color: colors.accentAmber,
                  borderColor: `${colors.accentAmber}30`,
                }}
                className="rounded px-2 py-0.5 text-[10px] font-mono font-bold border"
              >
                ACTIVE
              </span>
            </div>
            <p style={{ color: colors.textMuted }} className="text-xs font-mono mt-0.5">
              Multi-Interval Disaggregation • 15-Min Demand Profile • Load Duration Curve • ToU Calculator
            </p>
          </div>
        </div>

        {/* Live Today Snapshot Pill */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="rounded-xl px-3.5 py-2 border"
          >
            <span style={{ color: colors.textMuted }} className="text-[10px] block uppercase">Live Meter Total</span>
            <span style={{ color: colors.accentEmerald }} className="font-bold">{telemetry.totalKWh.toFixed(3)} kWh</span>
          </div>
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="rounded-xl px-3.5 py-2 border"
          >
            <span style={{ color: colors.textMuted }} className="text-[10px] block uppercase">Today's Accrued</span>
            <span style={{ color: colors.accentAmber }} className="font-bold flex items-center gap-0.5">
              <IndianRupee size={12} />
              {telemetry.todayCostInr.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* WEEKLY COMPARISON INSIGHT BANNER */}
      <div
        style={{
          backgroundColor: colors.card,
          borderColor: `${colors.accentEmerald}50`,
          color: colors.textPrimary,
        }}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 p-4 sm:p-5 shadow-lg transition-colors duration-200"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              style={{
                backgroundColor: `${colors.accentEmerald}20`,
                borderColor: `${colors.accentEmerald}40`,
                color: colors.accentEmerald,
              }}
              className="size-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5"
            >
              <Sparkles size={20} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span style={{ color: colors.accentEmerald }} className="text-xs font-bold font-mono uppercase tracking-wider">
                  Weekly Efficiency & Optimization Insight
                </span>
                <span
                  style={{
                    backgroundColor: `${colors.accentEmerald}15`,
                    color: colors.accentEmerald,
                    borderColor: `${colors.accentEmerald}30`,
                  }}
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold font-mono border"
                >
                  <TrendingDown size={12} /> -11.8% vs Last Week
                </span>
              </div>
              <p style={{ color: colors.textSecondary }} className="text-xs sm:text-sm font-mono leading-relaxed">
                Weekly grid energy dropped to <strong style={{ color: colors.textPrimary }}>51.2 kWh</strong> (down from <strong style={{ color: colors.textPrimary }}>58.0 kWh</strong>).
                Shifting <strong style={{ color: colors.textPrimary }}>4.2 kWh</strong> of heavy washing & water heating from Peak (18:00–22:00) to Off-Peak saved <strong style={{ color: colors.accentAmber }}>₹182.40</strong> this week!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-center font-mono text-xs">
            <div
              style={{
                backgroundColor: colors.subtle,
                borderColor: colors.border,
              }}
              className="rounded-xl px-3 py-2 border text-center"
            >
              <span style={{ color: colors.textMuted }} className="text-[10px] block uppercase">Peak-To-Avg Ratio</span>
              <span style={{ color: colors.accentCyan }} className="text-sm font-bold">1.48 (Low Stress)</span>
            </div>
            <div
              style={{
                backgroundColor: colors.subtle,
                borderColor: colors.border,
              }}
              className="rounded-xl px-3 py-2 border text-center"
            >
              <span style={{ color: colors.textMuted }} className="text-[10px] block uppercase">Est. Monthly Savings</span>
              <span style={{ color: colors.accentEmerald }} className="text-sm font-bold">₹ 729.60</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: MULTI-INTERVAL BAR CHART */}
      <div
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.textPrimary,
        }}
        className="rounded-2xl border p-5 shadow-lg space-y-4 transition-colors duration-200"
      >
        {/* Navigation & Tab Selection Header */}
        <div
          style={{ borderColor: colors.border }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4"
        >
          {/* Tabs for Month, Week, Day (Hours), Day (15-Min Quarters) */}
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="flex flex-wrap items-center gap-1 rounded-xl p-1 border font-mono text-xs"
          >
            {(['month', 'week', 'day_hours', 'day_quarters'] as const).map((tab) => {
              const label =
                tab === 'month' ? 'Month' : tab === 'week' ? 'Week' : tab === 'day_hours' ? 'Day (Hours)' : 'Day (15-Min Quarters)'
              const isActive = intervalTab === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setIntervalTab(tab); setDateOffset(0) }}
                  style={{
                    backgroundColor: isActive ? colors.accentCyan : 'transparent',
                    color: isActive ? '#FFFFFF' : colors.textSecondary,
                  }}
                  className="rounded-lg px-3 py-1.5 font-semibold transition-all shadow-xs"
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Date Navigation Buttons & Period Label */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <div
              style={{
                backgroundColor: colors.subtle,
                borderColor: colors.border,
              }}
              className="flex items-center rounded-xl border p-1"
            >
              <button
                type="button"
                onClick={handlePrev}
                title="Previous interval"
                style={{ color: colors.textSecondary }}
                className="rounded-lg p-1.5 hover:opacity-80 transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              <span style={{ color: colors.textPrimary }} className="px-3 font-semibold whitespace-nowrap">
                {dateLabel}
              </span>

              <button
                type="button"
                onClick={handleNext}
                title="Next interval"
                style={{ color: colors.textSecondary }}
                className="rounded-lg p-1.5 hover:opacity-80 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {dateOffset !== 0 && (
              <button
                type="button"
                onClick={handleReset}
                style={{
                  backgroundColor: colors.subtle,
                  borderColor: colors.border,
                  color: colors.accentAmber,
                }}
                className="rounded-xl border px-2.5 py-1.5 text-[10px] hover:opacity-80 transition-all font-semibold"
              >
                Reset
              </button>
            )}

            {/* Metric Toggle: kWh vs ₹ Cost */}
            <div
              style={{
                backgroundColor: colors.subtle,
                borderColor: colors.border,
              }}
              className="flex items-center rounded-xl border p-1"
            >
              <button
                type="button"
                onClick={() => setMetricView('kwh')}
                style={{
                  backgroundColor: metricView === 'kwh' ? colors.accentEmerald : 'transparent',
                  color: metricView === 'kwh' ? '#FFFFFF' : colors.textSecondary,
                }}
                className="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all"
              >
                kWh
              </button>
              <button
                type="button"
                onClick={() => setMetricView('cost')}
                style={{
                  backgroundColor: metricView === 'cost' ? colors.accentAmber : 'transparent',
                  color: metricView === 'cost' ? '#FFFFFF' : colors.textSecondary,
                }}
                className="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all"
              >
                Cost (₹)
              </button>
            </div>
          </div>
        </div>

        {/* Aggregates Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="rounded-xl p-3 border"
          >
            <span style={{ color: colors.textMuted }} className="text-[10px] block uppercase">Total Period Energy</span>
            <span style={{ color: colors.textPrimary }} className="text-base font-bold mt-0.5 block">
              {barAggregates.totalKwh.toLocaleString()} <span style={{ color: colors.textMuted }} className="text-xs">kWh</span>
            </span>
          </div>
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="rounded-xl p-3 border"
          >
            <span style={{ color: colors.textMuted }} className="text-[10px] block uppercase">Total Estimated Cost</span>
            <span style={{ color: colors.accentAmber }} className="text-base font-bold mt-0.5 flex items-center gap-0.5">
              <IndianRupee size={14} />
              {barAggregates.totalCost.toLocaleString()}
            </span>
          </div>
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="rounded-xl p-3 border"
          >
            <span style={{ color: colors.textMuted }} className="text-[10px] block uppercase">Peak Registered Demand</span>
            <span style={{ color: colors.accentRose }} className="text-base font-bold mt-0.5 block">
              {barAggregates.maxKw.toFixed(2)} <span style={{ color: colors.textMuted }} className="text-xs">kW</span>
            </span>
          </div>
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="rounded-xl p-3 border"
          >
            <span style={{ color: colors.textMuted }} className="text-[10px] block uppercase">Average Interval Demand</span>
            <span style={{ color: colors.accentCyan }} className="text-base font-bold mt-0.5 block">
              {barAggregates.avgKw.toFixed(2)} <span style={{ color: colors.textMuted }} className="text-xs">kW</span>
            </span>
          </div>
        </div>

        {/* Multi-Interval Bar Chart Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {intervalTab === 'day_quarters' ? (
              <BarChart data={quarterData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke={colors.chartText}
                  fontSize={10}
                  tickLine={false}
                  fontFamily="monospace"
                  tick={{ fill: colors.chartText }}
                  interval={7}
                />
                <YAxis
                  stroke={colors.chartText}
                  fontSize={10}
                  tickLine={false}
                  fontFamily="monospace"
                  tick={{ fill: colors.chartText }}
                  unit={metricView === 'kwh' ? ' kWh' : ' ₹'}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.chartTooltipBg,
                    borderColor: colors.chartTooltipBorder,
                    borderRadius: '0.75rem',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: colors.textPrimary,
                  }}
                  itemStyle={{ color: colors.textPrimary }}
                  labelStyle={{ color: colors.textSecondary }}
                  formatter={(val: any) => [
                    metricView === 'kwh' ? `${val} kWh` : `₹ ${val}`,
                    metricView === 'kwh' ? '15-Min Energy' : '15-Min Cost',
                  ]}
                />
                <Bar dataKey={metricView === 'kwh' ? 'kwh' : 'cost'} radius={[2, 2, 0, 0]}>
                  {quarterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isPeak ? colors.accentAmber : colors.accentCyan}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke={colors.chartText}
                  fontSize={10}
                  tickLine={false}
                  fontFamily="monospace"
                  tick={{ fill: colors.chartText }}
                />
                <YAxis
                  stroke={colors.chartText}
                  fontSize={10}
                  tickLine={false}
                  fontFamily="monospace"
                  tick={{ fill: colors.chartText }}
                  unit={metricView === 'kwh' ? ' kWh' : ' ₹'}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.chartTooltipBg,
                    borderColor: colors.chartTooltipBorder,
                    borderRadius: '0.75rem',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: colors.textPrimary,
                  }}
                  itemStyle={{ color: colors.textPrimary }}
                  labelStyle={{ color: colors.textSecondary }}
                  formatter={(val: any) => [
                    metricView === 'kwh' ? `${val} kWh` : `₹ ${val}`,
                    metricView === 'kwh' ? 'Energy' : 'Cost',
                  ]}
                />
                <Bar dataKey={metricView === 'kwh' ? 'kwh' : 'cost'} radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isPeak ? colors.accentAmber : colors.accentCyan}
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend strip */}
        <div
          style={{ borderColor: colors.border, color: colors.textSecondary }}
          className="flex items-center justify-between pt-2 border-t text-[11px] font-mono"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span style={{ backgroundColor: colors.accentCyan }} className="size-2.5 rounded-full" />
              <span>Standard / Off-Peak Interval</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ backgroundColor: colors.accentAmber }} className="size-2.5 rounded-full" />
              <span>ToU Peak Tariff Window (18:00 — 22:00)</span>
            </div>
          </div>
          <span className="hidden sm:inline" style={{ color: colors.textMuted }}>
            ADE7953 True-RMS Integrated Energy
          </span>
        </div>
      </div>

      {/* SECTION 2: 15-MINUTE DEMAND PROFILE & LOAD DURATION CURVE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2A: 15-Minute Demand Profile Multi-Line Chart */}
        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
          className="rounded-2xl border p-5 shadow-lg space-y-4 transition-colors duration-200"
        >
          <div
            style={{ borderColor: colors.border }}
            className="flex items-center justify-between border-b pb-3"
          >
            <div className="flex items-center gap-2">
              <div
                style={{
                  backgroundColor: `${colors.accentRose}15`,
                  borderColor: `${colors.accentRose}30`,
                  color: colors.accentRose,
                }}
                className="size-8 rounded-lg border flex items-center justify-center"
              >
                <LineChartIcon size={16} />
              </div>
              <div>
                <h3 style={{ color: colors.textPrimary }} className="text-sm font-bold font-mono">
                  15-Minute Demand Profile (24 Hours)
                </h3>
                <span style={{ color: colors.textMuted }} className="text-[10px] font-mono">
                  Continuous kW tracking: Max Demand, Average & Min Base Load
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span
                style={{
                  backgroundColor: `${colors.accentRose}15`,
                  color: colors.accentRose,
                  borderColor: `${colors.accentRose}30`,
                }}
                className="rounded px-2 py-0.5 font-bold border"
              >
                Peak: {exceedanceStats.peakKw} kW
              </span>
            </div>
          </div>

          {/* Multi-line chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quarterData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke={colors.chartText}
                  fontSize={10}
                  tickLine={false}
                  fontFamily="monospace"
                  tick={{ fill: colors.chartText }}
                  interval={11} // Show every 3 hours
                />
                <YAxis
                  stroke={colors.chartText}
                  fontSize={10}
                  tickLine={false}
                  fontFamily="monospace"
                  tick={{ fill: colors.chartText }}
                  unit=" kW"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.chartTooltipBg,
                    borderColor: colors.chartTooltipBorder,
                    borderRadius: '0.75rem',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: colors.textPrimary,
                  }}
                  itemStyle={{ color: colors.textPrimary }}
                  labelStyle={{ color: colors.textSecondary }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px', color: colors.textSecondary }}
                />

                {/* Max Demand Line (Red) */}
                <Line
                  type="monotone"
                  dataKey="maxKw"
                  name="Max Demand (kW)"
                  stroke={colors.accentRose}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />

                {/* Average Demand Line (Gray) */}
                <Line
                  type="monotone"
                  dataKey="avgKw"
                  name="Average Demand (kW)"
                  stroke={colors.textSecondary}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />

                {/* Min Demand Line (Green) */}
                <Line
                  type="monotone"
                  dataKey="minKw"
                  name="Min Demand (kW)"
                  stroke={colors.accentEmerald}
                  strokeWidth={1.75}
                  strokeDasharray="3 3"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{ borderColor: colors.border }}
            className="flex items-center justify-between pt-2 border-t text-[11px] font-mono"
          >
            <span style={{ color: colors.textMuted }}>Night Base Load Floor:</span>
            <span style={{ color: colors.accentEmerald }} className="font-bold">
              {exceedanceStats.minKw} kW
            </span>
          </div>
        </div>

        {/* 2B: Load Duration Curve with Interactive Threshold Slider */}
        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
          className="rounded-2xl border p-5 shadow-lg space-y-4 transition-colors duration-200"
        >
          <div
            style={{ borderColor: colors.border }}
            className="flex items-center justify-between border-b pb-3"
          >
            <div className="flex items-center gap-2">
              <div
                style={{
                  backgroundColor: `${colors.accentCyan}15`,
                  borderColor: `${colors.accentCyan}30`,
                  color: colors.accentCyan,
                }}
                className="size-8 rounded-lg border flex items-center justify-center"
              >
                <BarChart3 size={16} />
              </div>
              <div>
                <h3 style={{ color: colors.textPrimary }} className="text-sm font-bold font-mono">
                  Load Duration Curve (LDC)
                </h3>
                <span style={{ color: colors.textMuted }} className="text-[10px] font-mono">
                  Sorted demand vs % Time Duration (0% to 100% of day)
                </span>
              </div>
            </div>

            {/* Threshold Exceedance Result Pill */}
            <div
              style={{
                backgroundColor: colors.subtle,
                borderColor: colors.border,
              }}
              className="rounded-xl px-2.5 py-1 border font-mono text-xs text-right"
            >
              <span style={{ color: colors.textMuted }} className="text-[9px] block uppercase">
                Time &gt; {thresholdKw} kW
              </span>
              <span style={{ color: colors.accentAmber }} className="font-bold">
                {exceedanceStats.percentage}% ({exceedanceStats.hours} hrs)
              </span>
            </div>
          </div>

          {/* Interactive Threshold Slider */}
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="rounded-xl p-3 border space-y-2"
          >
            <div className="flex items-center justify-between font-mono text-xs">
              <span style={{ color: colors.textSecondary }} className="font-semibold flex items-center gap-1.5">
                <Sliders size={13} style={{ color: colors.accentAmber }} />
                LDC Demand Threshold Slider
              </span>
              <span
                style={{
                  backgroundColor: `${colors.accentAmber}20`,
                  color: colors.accentAmber,
                  borderColor: `${colors.accentAmber}40`,
                }}
                className="rounded px-2 py-0.5 font-bold border"
              >
                {thresholdKw.toFixed(1)} kW
              </span>
            </div>
            <input
              type="range"
              min="0.4"
              max="4.0"
              step="0.1"
              value={thresholdKw}
              onChange={(e) => setThresholdKw(Number(e.target.value))}
              style={{ backgroundColor: colors.border }}
              className="w-full accent-amber-500 cursor-pointer h-1.5 rounded-lg"
            />
            <div style={{ color: colors.textMuted }} className="flex justify-between text-[9px] font-mono">
              <span>0.4 kW (Base Floor)</span>
              <span>2.2 kW (Intermediate)</span>
              <span>4.0 kW (Peak Peaking)</span>
            </div>
          </div>

          {/* LDC Area Chart with Reference Line */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ldcData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ldcGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={colors.accentCyan} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={colors.accentCyan} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} vertical={false} />
                <XAxis
                  dataKey="percent"
                  stroke={colors.chartText}
                  fontSize={10}
                  tickLine={false}
                  fontFamily="monospace"
                  tick={{ fill: colors.chartText }}
                  unit="%"
                />
                <YAxis
                  stroke={colors.chartText}
                  fontSize={10}
                  tickLine={false}
                  fontFamily="monospace"
                  tick={{ fill: colors.chartText }}
                  unit=" kW"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.chartTooltipBg,
                    borderColor: colors.chartTooltipBorder,
                    borderRadius: '0.75rem',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: colors.textPrimary,
                  }}
                  itemStyle={{ color: colors.textPrimary }}
                  labelStyle={{ color: colors.textSecondary }}
                  formatter={(val: any) => [`${val} kW`, 'Demand']}
                  labelFormatter={(lbl) => `${lbl}% Duration (${((Number(lbl) / 100) * 24).toFixed(1)} hrs)`}
                />
                <Area
                  type="monotone"
                  dataKey="kw"
                  stroke={colors.accentCyan}
                  strokeWidth={2}
                  fill="url(#ldcGrad)"
                  isAnimationActive={false}
                />
                <ReferenceLine
                  y={thresholdKw}
                  stroke={colors.accentAmber}
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  label={{
                    value: `Threshold ${thresholdKw} kW`,
                    fill: colors.accentAmber,
                    fontSize: 10,
                    fontFamily: 'monospace',
                    position: 'top',
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Exceedance Result Description */}
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="rounded-xl p-3 border text-xs font-mono flex items-start gap-2"
          >
            <Info size={15} style={{ color: colors.accentAmber }} className="shrink-0 mt-0.5" />
            <span style={{ color: colors.textSecondary }}>
              Demand exceeded <strong style={{ color: colors.textPrimary }}>{thresholdKw} kW</strong> for{' '}
              <strong style={{ color: colors.accentAmber }}>{exceedanceStats.percentage}%</strong> of the day ({exceedanceStats.hours} hrs).
              Energy consumed in peak exceedance zone: <strong style={{ color: colors.textPrimary }}>{exceedanceStats.excessKwh} kWh</strong>.
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: TIME-OF-USE (ToU) TARIFF & BILLING CALCULATOR */}
      <div
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.textPrimary,
        }}
        className="rounded-2xl border p-5 shadow-lg space-y-5 transition-colors duration-200"
      >
        <div
          style={{ borderColor: colors.border }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4"
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: `${colors.accentEmerald}15`,
                borderColor: `${colors.accentEmerald}30`,
                color: colors.accentEmerald,
              }}
              className="size-10 rounded-xl border flex items-center justify-center"
            >
              <Zap size={20} />
            </div>
            <div>
              <h3 style={{ color: colors.textPrimary }} className="text-base font-bold font-mono">
                Time-of-Use (ToU) Tariff & Billing Calculator
              </h3>
              <p style={{ color: colors.textMuted }} className="text-xs font-mono">
                Editable State Discom Tariff Surcharges, Off-Peak Rebates & Fixed Capacity Charges
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Day Type Toggle: Weekday vs Weekend */}
            <div
              style={{
                backgroundColor: colors.subtle,
                borderColor: colors.border,
              }}
              className="flex rounded-lg border p-1 font-mono text-xs"
            >
              <button
                type="button"
                onClick={() => setDayType('weekday')}
                style={{
                  backgroundColor: dayType === 'weekday' ? colors.accentCyan : 'transparent',
                  color: dayType === 'weekday' ? '#FFFFFF' : colors.textSecondary,
                }}
                className="rounded-md px-2.5 py-1 font-semibold transition-all shadow-xs"
              >
                Weekday Mode
              </button>
              <button
                type="button"
                onClick={() => setDayType('weekend')}
                style={{
                  backgroundColor: dayType === 'weekend' ? colors.accentAmber : 'transparent',
                  color: dayType === 'weekend' ? '#FFFFFF' : colors.textSecondary,
                }}
                className="rounded-md px-2.5 py-1 font-semibold transition-all shadow-xs"
              >
                Weekend Mode
              </button>
            </div>

            <div
              style={{
                backgroundColor: colors.subtle,
                borderColor: colors.border,
              }}
              className="rounded-xl px-3.5 py-1.5 border font-mono text-xs text-right"
            >
              <span style={{ color: colors.textMuted }} className="text-[10px] block uppercase">Weekly Blended Bill</span>
              <span style={{ color: colors.accentEmerald }} className="text-sm font-bold flex items-center justify-end gap-1">
                <IndianRupee size={13} />
                {touBreakdown.weeklyTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Editable Tariff Inputs: Peak, Off-Peak, Weekend, Fixed Charges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {/* 1. Peak Rate */}
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: `${colors.accentRose}40`,
            }}
            className="rounded-xl border p-3.5 space-y-2"
          >
            <div style={{ color: colors.accentRose }} className="flex items-center justify-between font-bold">
              <span>Peak Rate (18:00 — 22:00)</span>
              <span
                style={{
                  backgroundColor: `${colors.accentRose}20`,
                }}
                className="text-[10px] px-1.5 py-0.5 rounded"
              >
                +30% Peak
              </span>
            </div>
            <div
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
              className="flex items-center justify-between rounded-lg px-3 py-1.5 border"
            >
              <span style={{ color: colors.textMuted }}>Rate:</span>
              <div className="flex items-center gap-1">
                <IndianRupee size={12} style={{ color: colors.accentRose }} />
                <input
                  type="number"
                  step="0.10"
                  min="2.0"
                  max="20.0"
                  value={peakRate}
                  onChange={(e) => setPeakRate(Number(e.target.value))}
                  style={{ color: colors.textPrimary }}
                  className="w-16 bg-transparent font-bold text-right focus:outline-none"
                />
                <span style={{ color: colors.textMuted }}>/ kWh</span>
              </div>
            </div>
            <span style={{ color: colors.textMuted }} className="text-[10px] block">
              Peak: {touBreakdown.peakKwh} kWh = ₹{touBreakdown.peakCost}
            </span>
          </div>

          {/* 2. Off-Peak Rate */}
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: `${colors.accentEmerald}40`,
            }}
            className="rounded-xl border p-3.5 space-y-2"
          >
            <div style={{ color: colors.accentEmerald }} className="flex items-center justify-between font-bold">
              <span>Off-Peak Rate (22:00 — 06:00)</span>
              <span
                style={{
                  backgroundColor: `${colors.accentEmerald}20`,
                }}
                className="text-[10px] px-1.5 py-0.5 rounded"
              >
                -15% Rebate
              </span>
            </div>
            <div
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
              className="flex items-center justify-between rounded-lg px-3 py-1.5 border"
            >
              <span style={{ color: colors.textMuted }}>Rate:</span>
              <div className="flex items-center gap-1">
                <IndianRupee size={12} style={{ color: colors.accentEmerald }} />
                <input
                  type="number"
                  step="0.10"
                  min="1.0"
                  max="15.0"
                  value={offPeakRate}
                  onChange={(e) => setOffPeakRate(Number(e.target.value))}
                  style={{ color: colors.textPrimary }}
                  className="w-16 bg-transparent font-bold text-right focus:outline-none"
                />
                <span style={{ color: colors.textMuted }}>/ kWh</span>
              </div>
            </div>
            <span style={{ color: colors.textMuted }} className="text-[10px] block">
              Off-Peak: {touBreakdown.offPeakKwh} kWh = ₹{touBreakdown.offPeakCost}
            </span>
          </div>

          {/* 3. Weekend Rate */}
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: `${colors.accentAmber}40`,
            }}
            className="rounded-xl border p-3.5 space-y-2"
          >
            <div style={{ color: colors.accentAmber }} className="flex items-center justify-between font-bold">
              <span>Weekend Rate (Sat — Sun)</span>
              <span
                style={{
                  backgroundColor: `${colors.accentAmber}20`,
                }}
                className="text-[10px] px-1.5 py-0.5 rounded"
              >
                Flat Rate
              </span>
            </div>
            <div
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
              className="flex items-center justify-between rounded-lg px-3 py-1.5 border"
            >
              <span style={{ color: colors.textMuted }}>Rate:</span>
              <div className="flex items-center gap-1">
                <IndianRupee size={12} style={{ color: colors.accentAmber }} />
                <input
                  type="number"
                  step="0.10"
                  min="2.0"
                  max="15.0"
                  value={weekendRate}
                  onChange={(e) => setWeekendRate(Number(e.target.value))}
                  style={{ color: colors.textPrimary }}
                  className="w-16 bg-transparent font-bold text-right focus:outline-none"
                />
                <span style={{ color: colors.textMuted }}>/ kWh</span>
              </div>
            </div>
            <span style={{ color: colors.textMuted }} className="text-[10px] block">
              Weekend Day: {touBreakdown.weekendKwh} kWh = ₹{touBreakdown.weekendCost}
            </span>
          </div>

          {/* 4. Fixed Monthly Distribution Charges */}
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: `${colors.accentCyan}40`,
            }}
            className="rounded-xl border p-3.5 space-y-2"
          >
            <div style={{ color: colors.accentCyan }} className="flex items-center justify-between font-bold">
              <span>Fixed Distribution Demand</span>
              <span
                style={{
                  backgroundColor: `${colors.accentCyan}20`,
                }}
                className="text-[10px] px-1.5 py-0.5 rounded"
              >
                Monthly
              </span>
            </div>
            <div
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
              className="flex items-center justify-between rounded-lg px-3 py-1.5 border"
            >
              <span style={{ color: colors.textMuted }}>Monthly:</span>
              <div className="flex items-center gap-1">
                <IndianRupee size={12} style={{ color: colors.accentCyan }} />
                <input
                  type="number"
                  step="5.0"
                  min="50"
                  max="1000"
                  value={fixedCharges}
                  onChange={(e) => setFixedCharges(Number(e.target.value))}
                  style={{ color: colors.textPrimary }}
                  className="w-16 bg-transparent font-bold text-right focus:outline-none"
                />
                <span style={{ color: colors.textMuted }}>/ mo</span>
              </div>
            </div>
            <span style={{ color: colors.textMuted }} className="text-[10px] block">
              Prorated: ₹{touBreakdown.dailyFixed} / day
            </span>
          </div>
        </div>

        {/* Detailed Bill Summary Table */}
        <div
          style={{
            backgroundColor: colors.subtle,
            borderColor: colors.border,
          }}
          className="rounded-xl p-4 border overflow-x-auto"
        >
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr style={{ borderColor: colors.border, color: colors.textMuted }} className="border-b text-[10px] uppercase">
                <th className="pb-2 font-semibold">Tariff Bucket</th>
                <th className="pb-2 font-semibold">Time Window</th>
                <th className="pb-2 font-semibold">Consumption</th>
                <th className="pb-2 font-semibold">Unit Rate</th>
                <th className="pb-2 font-semibold text-right">Computed Cost</th>
              </tr>
            </thead>
            <tbody style={{ borderColor: colors.border }} className="divide-y divide-current/20">
              {dayType === 'weekday' ? (
                <>
                  <tr>
                    <td style={{ color: colors.accentRose }} className="py-2.5 font-bold flex items-center gap-1.5">
                      <span style={{ backgroundColor: colors.accentRose }} className="size-2 rounded-full" /> Peak Window (ToD)
                    </td>
                    <td style={{ color: colors.textSecondary }} className="py-2.5">18:00 — 22:00 (Evening)</td>
                    <td style={{ color: colors.textPrimary }} className="py-2.5 font-bold">{touBreakdown.peakKwh} kWh</td>
                    <td style={{ color: colors.textSecondary }} className="py-2.5">₹ {peakRate.toFixed(2)} / kWh</td>
                    <td style={{ color: colors.textPrimary }} className="py-2.5 font-bold text-right">₹ {touBreakdown.peakCost.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style={{ color: colors.accentEmerald }} className="py-2.5 font-bold flex items-center gap-1.5">
                      <span style={{ backgroundColor: colors.accentEmerald }} className="size-2 rounded-full" /> Off-Peak Window
                    </td>
                    <td style={{ color: colors.textSecondary }} className="py-2.5">22:00 — 06:00 (Night)</td>
                    <td style={{ color: colors.textPrimary }} className="py-2.5 font-bold">{touBreakdown.offPeakKwh} kWh</td>
                    <td style={{ color: colors.textSecondary }} className="py-2.5">₹ {offPeakRate.toFixed(2)} / kWh</td>
                    <td style={{ color: colors.textPrimary }} className="py-2.5 font-bold text-right">₹ {touBreakdown.offPeakCost.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style={{ color: colors.accentCyan }} className="py-2.5 font-bold flex items-center gap-1.5">
                      <span style={{ backgroundColor: colors.accentCyan }} className="size-2 rounded-full" /> Standard Day Window
                    </td>
                    <td style={{ color: colors.textSecondary }} className="py-2.5">06:00 — 18:00 (Daytime)</td>
                    <td style={{ color: colors.textPrimary }} className="py-2.5 font-bold">{touBreakdown.normalKwh} kWh</td>
                    <td style={{ color: colors.textSecondary }} className="py-2.5">₹ 6.50 / kWh</td>
                    <td style={{ color: colors.textPrimary }} className="py-2.5 font-bold text-right">₹ {touBreakdown.normalCost.toFixed(2)}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td style={{ color: colors.accentAmber }} className="py-2.5 font-bold flex items-center gap-1.5">
                    <span style={{ backgroundColor: colors.accentAmber }} className="size-2 rounded-full" /> Weekend Flat Concessional
                  </td>
                  <td style={{ color: colors.textSecondary }} className="py-2.5">Saturday & Sunday All Day</td>
                  <td style={{ color: colors.textPrimary }} className="py-2.5 font-bold">{touBreakdown.weekendKwh} kWh</td>
                  <td style={{ color: colors.textSecondary }} className="py-2.5">₹ {weekendRate.toFixed(2)} / kWh</td>
                  <td style={{ color: colors.textPrimary }} className="py-2.5 font-bold text-right">₹ {touBreakdown.weekendCost.toFixed(2)}</td>
                </tr>
              )}
              <tr>
                <td style={{ color: colors.accentAmber }} className="py-2.5 font-bold flex items-center gap-1.5">
                  <span style={{ backgroundColor: colors.accentAmber }} className="size-2 rounded-full" /> Fixed Distribution
                </td>
                <td style={{ color: colors.textSecondary }} className="py-2.5">Sanctioned Demand 5 kW</td>
                <td style={{ color: colors.textMuted }} className="py-2.5">Fixed Monthly</td>
                <td style={{ color: colors.textSecondary }} className="py-2.5">₹ {fixedCharges.toFixed(2)} / mo</td>
                <td style={{ color: colors.textPrimary }} className="py-2.5 font-bold text-right">₹ {touBreakdown.dailyFixed.toFixed(2)} / day</td>
              </tr>
              <tr
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
                className="border-t text-sm font-bold"
              >
                <td style={{ color: colors.textPrimary }} className="py-3" colSpan={2}>
                  Today's Total Integrated Electricity Bill:
                </td>
                <td style={{ color: colors.accentEmerald }} className="py-3 font-bold">{touBreakdown.totalKwh} kWh</td>
                <td style={{ color: colors.textMuted }} className="py-3 text-xs">Prorated 24h</td>
                <td style={{ color: colors.accentAmber }} className="py-3 text-right text-base font-bold">
                  ₹ {touBreakdown.dailyTotal.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
