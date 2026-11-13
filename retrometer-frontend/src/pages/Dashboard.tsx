import React, { useState } from 'react'
import { useTelemetry } from '../context/TelemetryContext'
import { useTheme } from '../context/ThemeContext'
import ConcentricDualRingGauge from '../components/ConcentricDualRingGauge'
import LiveTelemetryChart from '../components/LiveTelemetryChart'
import LiveEnergyFlowDiagram from '../components/LiveEnergyFlowDiagram'
import EnergySourceCard from '../components/EnergySourceCard'
import AddSourceModal from '../components/AddSourceModal'
import GridHealthCard from '../components/GridHealthCard'
import SanzoWadaNILMBreakdown from '../components/SanzoWadaNILMBreakdown'
import {
  Zap,
  Activity,
  IndianRupee,
  Database,
  ShieldCheck,
  Plus,
  Layers,
  WifiOff,
  Wifi,
  Sparkles,
  Cpu,
  Clock,
  Leaf,
  Flame,
} from 'lucide-react'

export default function Dashboard() {
  const {
    telemetry,
    history,
    isPulseBlinking,
    sources,
    activeCTCount,
    wifiStatus,
    wifiConfig,
  } = useTelemetry()
  const { colors } = useTheme()

  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false)

  const { activeWatts, totalKWh, opticalWatts, voltage } = telemetry
  const isConnected = wifiStatus === 'CONNECTED'

  // Estimated Bill: opt_kwh × ₹8.00 formatted as ₹XX.XX
  const optKWh = totalKWh || 0
  const estimatedBillInr = (optKWh * 8.00).toFixed(2)

  // Usage Indicator (Eco / Normal / Heavy)
  const isEco = activeWatts < 500 && isConnected
  const isHeavy = activeWatts > 2000 && isConnected
  const usageLabel = !isConnected
    ? 'Standby'
    : isEco
    ? 'Eco Usage'
    : isHeavy
    ? 'Heavy Draw'
    : 'Normal Draw'

  return (
    <div className="space-y-6">
      {/* Waiting for Wi-Fi Telemetry Banner (when disconnected / waiting) */}
      {!isConnected && (
        <div
          style={{
            backgroundColor: `${colors.accentAmber}10`,
            borderColor: `${colors.accentAmber}30`,
            color: colors.textPrimary,
          }}
          className="rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-500 flex items-center justify-center shrink-0">
              <WifiOff size={16} />
            </div>
            <div>
              <div className="font-bold flex items-center gap-2">
                <span>Waiting for ESP32 Wi-Fi Telemetry</span>
                <span className="rounded px-2 py-0.5 text-[9px] font-bold border border-amber-500/30 text-amber-500 bg-amber-500/10">
                  Zero Baseline
                </span>
              </div>
              <p style={{ color: colors.textMuted }} className="text-[11px] mt-0.5">
                Clean zero baseline active. Real telemetry will automatically stream from ESP32 at {wifiConfig.localIp || '10.50.134.121'}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span style={{ color: colors.textMuted }} className="text-[10px]">
              Endpoint: {wifiConfig.localEndpoint || `http://${wifiConfig.localIp}/data`}
            </span>
          </div>
        </div>
      )}

      {/* TOP ROW: HERO METRICS (Home Load, Energy Consumed with EEPROM, Estimated Bill in INR) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono">
        {/* HERO 1: Current Home Load */}
        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
          className="relative overflow-hidden rounded-2xl border p-5 shadow-lg flex flex-col justify-between transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <span
              style={{ color: colors.textSecondary }}
              className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <Zap size={15} style={{ color: colors.accentCyan }} /> Current Home Load
            </span>
            <span
              style={{
                backgroundColor: isEco
                  ? 'rgba(46, 125, 107, 0.15)'
                  : isHeavy
                  ? 'rgba(194, 65, 12, 0.15)'
                  : `${colors.accentCyan}15`,
                color: isEco ? '#2E7D6B' : isHeavy ? '#C2410C' : colors.accentCyan,
                borderColor: isEco
                  ? 'rgba(46, 125, 107, 0.35)'
                  : isHeavy
                  ? 'rgba(194, 65, 12, 0.35)'
                  : `${colors.accentCyan}35`,
              }}
              className="rounded-lg px-2.5 py-0.5 text-[10px] font-bold border flex items-center gap-1 uppercase"
            >
              {isEco && <Leaf size={11} />}
              {isHeavy && <Flame size={11} />}
              <span>{usageLabel}</span>
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight" style={{ color: colors.textPrimary }}>
              {activeWatts >= 1000 ? (activeWatts / 1000).toFixed(2) : activeWatts.toFixed(0)}
            </span>
            <span style={{ color: colors.accentCyan }} className="text-base font-bold">
              {activeWatts >= 1000 ? 'kW' : 'W'}
            </span>
          </div>

          <div
            style={{ borderColor: colors.border, color: colors.textMuted }}
            className="mt-4 pt-3 border-t flex items-center justify-between text-[11px]"
          >
            <span>Optical Meter Power:</span>
            <span className="font-bold" style={{ color: colors.textSecondary }}>
              {opticalWatts > 0 ? `${opticalWatts.toFixed(0)} W` : '0 W'}
            </span>
          </div>
        </div>

        {/* HERO 2: Total Energy Consumed (with persistent AT24C32 EEPROM Indicator) */}
        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
          className="relative overflow-hidden rounded-2xl border p-5 shadow-lg flex flex-col justify-between transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <span
              style={{ color: colors.textSecondary }}
              className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <Activity size={15} style={{ color: colors.accentEmerald }} /> Total Energy Consumed
            </span>
            <span
              style={{
                backgroundColor: 'rgba(46, 125, 107, 0.15)',
                color: '#2E7D6B',
                borderColor: 'rgba(46, 125, 107, 0.35)',
              }}
              className="rounded-lg px-2 py-0.5 text-[10px] font-bold border flex items-center gap-1"
              title="AT24C32 EEPROM Non-Volatile Hardware Backup Active (Address 0x50)"
            >
              <Database size={11} />
              <span>AT24C32 EEPROM</span>
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight" style={{ color: colors.textPrimary }}>
              {optKWh.toFixed(4)}
            </span>
            <span style={{ color: colors.accentEmerald }} className="text-base font-bold">
              kWh
            </span>
          </div>

          <div
            style={{ borderColor: colors.border, color: colors.textMuted }}
            className="mt-4 pt-3 border-t flex items-center justify-between text-[11px]"
          >
            <span>Hardware Non-Volatile Backup:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Persistent across outages
            </span>
          </div>
        </div>

        {/* HERO 3: Estimated Bill (opt_kwh × ₹8.00 formatted as ₹XX.XX) */}
        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
          className="relative overflow-hidden rounded-2xl border p-5 shadow-lg flex flex-col justify-between transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <span
              style={{ color: colors.textSecondary }}
              className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <IndianRupee size={15} style={{ color: colors.accentAmber }} /> Estimated Bill
            </span>
            <span
              style={{
                backgroundColor: `${colors.accentAmber}15`,
                color: colors.accentAmber,
                borderColor: `${colors.accentAmber}30`,
              }}
              className="rounded-lg px-2.5 py-0.5 text-[10px] font-bold border"
            >
              ₹8.00 / kWh
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-1">
            <span style={{ color: colors.accentAmber }} className="text-3xl font-black">
              ₹
            </span>
            <span className="text-4xl font-black tracking-tight" style={{ color: colors.textPrimary }}>
              {estimatedBillInr}
            </span>
          </div>

          <div
            style={{ borderColor: colors.border, color: colors.textMuted }}
            className="mt-4 pt-3 border-t flex items-center justify-between text-[11px]"
          >
            <span>Billing Formula:</span>
            <span className="font-bold" style={{ color: colors.textSecondary }}>
              {optKWh.toFixed(2)} kWh × ₹8.00
            </span>
          </div>
        </div>
      </div>

      {/* SECOND ROW: Grid Health Card (Consumer Translation of Voltage) & Real-time Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grid Health Card (Span 5) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <GridHealthCard telemetry={telemetry} isConnected={isConnected} />
        </div>

        {/* Real-Time Rolling Telemetry Chart (Span 7) */}
        <div className="lg:col-span-7 flex flex-col">
          <LiveTelemetryChart history={history} telemetry={telemetry} />
        </div>
      </div>

      {/* THIRD ROW: Concentric Dual-Ring Power Gauge & Sanzo Wada Appliance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Schneider Concentric Dual-Ring Gauge (Span 5) */}
        <div className="lg:col-span-5 flex flex-col">
          <ConcentricDualRingGauge
            telemetry={telemetry}
            isPulseBlinking={isPulseBlinking}
          />
        </div>

        {/* Appliance Breakdown (Harmonics / NILM Translation in Sanzo Wada Donut + Cards) (Span 7) */}
        <div className="lg:col-span-7 flex flex-col">
          <SanzoWadaNILMBreakdown telemetry={telemetry} />
        </div>
      </div>

      {/* FOURTH ROW: MULTI-CT ENERGY SOURCE MONITORING & FLOW */}
      <div className="space-y-6 pt-2">
        {/* Live Energy Flow Diagram (Hero Routing Schematic) */}
        <LiveEnergyFlowDiagram />

        {/* Energy Source Cards Grid with "+ Add Source" Button */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 font-mono">
            <div>
              <div className="flex items-center gap-2">
                <Layers size={18} style={{ color: colors.accentEmerald }} />
                <h3 style={{ color: colors.textPrimary }} className="text-base font-bold">
                  Active Energy Sources (SCT-013 CT Channels)
                </h3>
                <span
                  style={{
                    backgroundColor: `${colors.accentEmerald}15`,
                    color: colors.accentEmerald,
                    borderColor: `${colors.accentEmerald}40`,
                  }}
                  className="rounded px-2 py-0.5 text-[10px] font-bold border"
                >
                  {sources.length} Configured ({activeCTCount} Active)
                </span>
              </div>
              <p style={{ color: colors.textMuted }} className="text-xs mt-0.5">
                Utility Grid is configured by default on CT-1. Add additional solar, battery or generator CT channels below.
              </p>
            </div>

            {/* "+ Add Source" Button */}
            <button
              type="button"
              onClick={() => setIsAddSourceModalOpen(true)}
              style={{
                backgroundColor: colors.accentEmerald,
                color: '#FFFFFF',
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all self-start sm:self-auto"
            >
              <Plus size={15} />
              <span>+ Add Source</span>
            </button>
          </div>

          {/* Cards Grid: Starts with ONLY Utility Grid CT-1, plus any consumer-added sources */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {sources.map((source) => (
              <EnergySourceCard key={source.id} source={source} />
            ))}
          </div>
        </div>
      </div>

      {/* Add Source Modal Dialog */}
      <AddSourceModal
        isOpen={isAddSourceModalOpen}
        onClose={() => setIsAddSourceModalOpen(false)}
      />
    </div>
  )
}
