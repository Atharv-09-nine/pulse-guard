// Realistic Power Grid Telemetry & Tariff Generators for RetroMeter

export interface IntervalPoint {
  label: string
  kwh: number
  cost: number
  peakKw: number
  isPeak?: boolean
}

export interface DemandQuarterPoint {
  time: string
  quarterIndex: number
  maxKw: number
  avgKw: number
  minKw: number
  kwh: number
  isPeak: boolean
}

export interface LoadDurationPoint {
  percent: number // 0 to 100%
  hours: number // 0 to 24 hours
  kw: number
}

// Generate 12 Months
export function getMonthlyData(offsetYear = 0): IntervalPoint[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const baseKwh = [148, 136, 172, 224, 280, 265, 230, 215, 195, 180, 162, 155]
  const yearMultiplier = 1 + offsetYear * 0.05

  return months.map((m, idx) => {
    const kwh = Math.round(baseKwh[idx] * yearMultiplier)
    const cost = Math.round(kwh * 6.5)
    const peakKw = +(2.8 + (baseKwh[idx] / 100) * 0.6).toFixed(2)
    return {
      label: m,
      kwh,
      cost,
      peakKw,
    }
  })
}

// Generate 7 Days of Week
export function getWeeklyData(offsetWeek = 0): IntervalPoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const baseKwh = [6.8, 7.4, 7.1, 7.9, 8.4, 9.8, 9.2]
  const weekMultiplier = 1 + offsetWeek * 0.03

  return days.map((d, idx) => {
    const kwh = +(baseKwh[idx] * weekMultiplier).toFixed(2)
    const cost = +(kwh * 6.5).toFixed(2)
    const peakKw = +(2.9 + idx * 0.15).toFixed(2)
    return {
      label: d,
      kwh,
      cost,
      peakKw,
    }
  })
}

// Generate 24 Hours
export function getHourlyData(offsetDay = 0): IntervalPoint[] {
  const hours: IntervalPoint[] = []
  const baseLoads = [
    0.35, 0.32, 0.30, 0.31, 0.34, 0.55, 0.85, 1.25, 1.10, 0.95, 0.88, 1.15,
    1.30, 1.20, 1.05, 0.98, 1.10, 1.45, 2.10, 2.45, 2.20, 1.85, 0.95, 0.50,
  ]

  for (let h = 0; h < 24; h++) {
    const timeLabel = `${String(h).padStart(2, '0')}:00`
    const isPeak = h >= 18 && h <= 21 // 18:00 - 22:00 peak hours
    const kw = +(baseLoads[h] * (1 + offsetDay * 0.02)).toFixed(2)
    const kwh = +(kw * 1.0).toFixed(2)
    const rate = isPeak ? 8.5 : h >= 22 || h < 6 ? 4.5 : 6.5
    const cost = +(kwh * rate).toFixed(2)

    hours.push({
      label: timeLabel,
      kwh,
      cost,
      peakKw: +(kw * 1.25).toFixed(2),
      isPeak,
    })
  }
  return hours
}

// Generate 96 Quarters of 15-Minutes
export function getQuarterData(offsetDay = 0): DemandQuarterPoint[] {
  const points: DemandQuarterPoint[] = []

  // Typical domestic/commercial daily demand profile with 2 distinct peaks (morning 8am & evening 8pm)
  for (let q = 0; q < 96; q++) {
    const hour = Math.floor(q / 4)
    const min = (q % 4) * 15
    const time = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
    const isPeak = hour >= 18 && hour <= 21

    // Baseline curve with realistic variation
    let base = 0.55 + Math.sin(((hour - 3) / 24) * Math.PI * 2) * 0.3
    if (hour >= 7 && hour <= 10) base += 0.8 // morning peak
    if (hour >= 18 && hour <= 22) base += 1.4 // evening cooking & AC peak
    if (hour >= 1 && hour <= 5) base = 0.38 // deep night base load

    base = base * (1 + (offsetDay % 5) * 0.03)

    const avgKw = Math.max(0.2, +(base + Math.sin(q * 0.7) * 0.15).toFixed(2))
    const maxKw = +(avgKw * (1.25 + (q % 3) * 0.08)).toFixed(2)
    const minKw = Math.max(0.15, +(avgKw * 0.75).toFixed(2))
    const kwh = +(avgKw * 0.25).toFixed(3) // 15 mins = 0.25 hour

    points.push({
      time,
      quarterIndex: q,
      maxKw,
      avgKw,
      minKw,
      kwh,
      isPeak,
    })
  }

  return points
}

// Compute Load Duration Curve (LDC) from 96 quarter points
export function calculateLoadDurationCurve(quarterPoints: DemandQuarterPoint[]): LoadDurationPoint[] {
  // Extract all avgKw values and sort in descending order
  const sortedKw = quarterPoints.map((p) => p.avgKw).sort((a, b) => b - a)
  const total = sortedKw.length

  return sortedKw.map((kw, idx) => {
    const percent = +((idx / (total - 1)) * 100).toFixed(1)
    const hours = +((idx / total) * 24).toFixed(1)
    return {
      percent,
      hours,
      kw,
    }
  })
}

