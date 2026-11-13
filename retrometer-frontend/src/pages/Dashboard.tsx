import React, { useState } from 'react'
import { useTelemetry } from '../context/TelemetryContext'
import { useTheme } from '../context/ThemeContext'
import ConcentricDualRingGauge from '../components/ConcentricDualRingGauge'
import LiveTelemetryChart from '../components/LiveTelemetryChart'
import LiveEnergyFlowDiagram from '../components/LiveEnergyFlowDiagram'
import EnergySourceCard from '../components/EnergySourceCard'
import AddSourceModal from '../components/AddSourceModal'
import { Zap, Activity, Compass, Waves, Plus, Layers, WifiOff, Wifi } from 'lucide-react'

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

  const { voltage, current, powerFactor, frequency, apparentVA } = telemetry

  const isConnected = wifiStatus === 'CONNECTED'
  const isZeroBaseline = voltage === 0 && current === 0

  // Voltage status check
  const isOverVoltage = voltage >= 260.0
  const isUnderVoltage = voltage <= 200.0 && voltage > 20.0
  const voltageStatus = !isConnected
    ? 'Awaiting Wi-Fi'
    : isOverVoltage
    ? 'High Voltage'
    : isUnderVoltage
    ? 'Low Voltage'
    : 'Normal (230V)'

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
          className="rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs"
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
                No simulated data. Clean zero baseline active (0.0 V, 0 W, 0.00 kWh) until real telemetry packets arrive from ESP32.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span style={{ color: colors.textMuted }} className="text-[10px]">
              Receiver: {wifiConfig.mode === 'CLOUD_FIREBASE' ? 'Firebase Cloud' : wifiConfig.localEndpoint || `http://${wifiConfig.localIp}/data`}
            </span>
          </div>
        </div>
      )}

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
                backgroundColor: !isConnected
                  ? `${colors.accentAmber}15`
                  : isOverVoltage || isUnderVoltage
                  ? `${colors.accentRose}20`
                  : `${colors.accentEmerald}15`,
                color: !isConnected
                  ? colors.accentAmber
                  : isOverVoltage || isUnderVoltage
                  ? colors.accentRose
                  : colors.accentEmerald,
                borderColor: !isConnected
                  ? `${colors.accentAmber}40`
                  : isOverVoltage || isUnderVoltage
                  ? `${colors.accentRose}40`
                  : `${colors.accentEmerald}40`,
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
                backgroundColor: isConnected ? `${colors.accentEmerald}15` : `${colors.textMuted}15`,
                color: isConnected ? colors.accentEmerald : colors.textMuted,
                borderColor: isConnected ? `${colors.accentEmerald}40` : `${colors.border}`,
              }}
              className="rounded-md px-2 py-0.5 text-[10px] font-bold border"
            >
              {isConnected ? 'Optimal Load' : 'Zero Baseline'}
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
              <Compass size={14} style={{ color: colors.accentAmber }} /> Power Factor
            </span>
            <span
              style={{
                backgroundColor: !isConnected
                  ? `${colors.textMuted}15`
                  : powerFactor >= 0.90
                  ? `${colors.accentEmerald}15`
                  : `${colors.accentAmber}15`,
                color: !isConnected
                  ? colors.textMuted
                  : powerFactor >= 0.90
                  ? colors.accentEmerald
                  : colors.accentAmber,
                borderColor: !isConnected
                  ? `${colors.border}`
                  : powerFactor >= 0.90
                  ? `${colors.accentEmerald}40`
                  : `${colors.accentAmber}40`,
              }}
              className="rounded-md px-2 py-0.5 text-[10px] font-bold border"
            >
              {!isConnected ? 'Standby' : powerFactor >= 0.90 ? 'Grid Healthy' : 'Fair Efficiency'}
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
            <span>cos φ Phase</span>
            <span style={{ color: colors.textSecondary }} className="font-medium">
              {isConnected ? 'Sync Locked' : 'Awaiting Flow'}
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
                backgroundColor: isConnected ? `${colors.accentPurple}15` : `${colors.textMuted}15`,
                color: isConnected ? colors.accentPurple : colors.textMuted,
                borderColor: isConnected ? `${colors.accentPurple}40` : `${colors.border}`,
              }}
              className="rounded-md px-2 py-0.5 text-[10px] font-bold border"
            >
              {isConnected ? '50 Hz Stable' : 'Standby'}
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
              {isConnected ? 'Locked ±0.03Hz' : 'Standby'}
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

      {/* MULTI-CT ENERGY SOURCE MONITORING SECTION */}
      <div className="space-y-6 pt-2">
        {/* Live Energy Flow Diagram (Hero Summary) */}
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
