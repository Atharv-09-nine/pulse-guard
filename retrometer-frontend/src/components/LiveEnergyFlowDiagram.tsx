import React from 'react'
import { useTelemetry } from '../context/TelemetryContext'
import { useTheme } from '../context/ThemeContext'
import {
  Zap,
  Sun,
  Activity,
  Cpu,
  ArrowRight,
  CheckCircle2,
  WifiOff,
  Wifi,
  PlusCircle,
} from 'lucide-react'

export default function LiveEnergyFlowDiagram() {
  const {
    telemetry,
    sources,
    totalDemandWatts,
    totalGenerationWatts,
    netGridWatts,
    solarCoveragePct,
    activeCTCount,
    wifiStatus,
  } = useTelemetry()
  const { colors } = useTheme()

  const isConnected = wifiStatus === 'CONNECTED'
  const isZeroBaseline = telemetry.voltage === 0 && telemetry.activeWatts === 0

  return (
    <div
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        color: colors.textPrimary,
      }}
      className="rounded-2xl border p-6 shadow-xl transition-all duration-200 font-mono"
    >
      {/* Header with Title and Status Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5" style={{ borderColor: colors.border }}>
        <div>
          <div className="flex items-center gap-2">
            <div
              style={{
                backgroundColor: `${colors.accentCyan}20`,
                borderColor: `${colors.accentCyan}40`,
                color: colors.accentCyan,
              }}
              className="size-8 rounded-lg border flex items-center justify-center"
            >
              <Zap size={16} />
            </div>
            <h2 style={{ color: colors.textPrimary }} className="text-lg font-black tracking-tight">
              Multi-CT Energy Source Routing
            </h2>
          </div>
          <p style={{ color: colors.textMuted }} className="text-xs mt-1">
            Real-time SCT-013 branch currents integrated with shared AC Voltage Bus (V_RMS = {telemetry.voltage.toFixed(1)}V)
          </p>
        </div>

        {/* Live Aggregates Header Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Telemetry Stream Status */}
          <span
            style={{
              backgroundColor: isConnected ? `${colors.accentEmerald}15` : `${colors.accentAmber}15`,
              color: isConnected ? colors.accentEmerald : colors.accentAmber,
              borderColor: isConnected ? `${colors.accentEmerald}30` : `${colors.accentAmber}30`,
            }}
            className="rounded-lg px-2.5 py-1 text-xs font-bold border flex items-center gap-1.5"
          >
            {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
            {isConnected ? 'Wi-Fi Live Telemetry' : 'Waiting for Wi-Fi Telemetry'}
          </span>

          {/* Active CT Count */}
          <span
            style={{
              backgroundColor: `${colors.accentEmerald}15`,
              color: colors.accentEmerald,
              borderColor: `${colors.accentEmerald}30`,
            }}
            className="rounded-lg px-2.5 py-1 text-xs font-bold border flex items-center gap-1.5"
          >
            <Cpu size={13} />
            {activeCTCount} / 16 CTs Active
          </span>

          {/* Solar Coverage Index */}
          {solarCoveragePct > 0 && (
            <span
              style={{
                backgroundColor: `${colors.accentAmber}15`,
                color: colors.accentAmber,
                borderColor: `${colors.accentAmber}30`,
              }}
              className="rounded-lg px-2.5 py-1 text-xs font-bold border flex items-center gap-1.5"
            >
              <Sun size={13} />
              {solarCoveragePct}% Solar Offset
            </span>
          )}

          {/* Shared Bus Sync */}
          <span
            style={{
              backgroundColor: isConnected ? `${colors.accentCyan}15` : `${colors.textMuted}15`,
              color: isConnected ? colors.accentCyan : colors.textMuted,
              borderColor: isConnected ? `${colors.accentCyan}30` : `${colors.border}`,
            }}
            className="rounded-lg px-2.5 py-1 text-xs font-bold border flex items-center gap-1.5"
          >
            <CheckCircle2 size={13} />
            {isConnected ? 'Shared 230V Bus Locked' : 'Bus Standby'}
          </span>
        </div>
      </div>

      {/* Hero Visual Flow Schematic: Sources -> Common AC Voltage Bus -> Consumer Loads */}
      <div className="py-6 overflow-x-auto">
        <div className="min-w-[680px] grid grid-cols-12 gap-3 items-center">
          {/* LEFT: Configured Multi-Source Nodes (Cols 1-4) */}
          <div className="col-span-4 space-y-2.5">
            {sources.map((source) => {
              const isGrid = source.preset === 'grid' || source.ctChannel === 1
              const isSolar = source.preset === 'solar'
              const accentColor = isSolar
                ? colors.accentEmerald
                : isGrid
                ? colors.accentCyan
                : colors.accentAmber

              return (
                <div
                  key={source.id}
                  style={{
                    backgroundColor: colors.canvas,
                    borderColor: source.active && isConnected ? accentColor : colors.border,
                  }}
                  className="p-3 rounded-xl border flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      style={{
                        backgroundColor: `${accentColor}20`,
                        color: accentColor,
                      }}
                      className="size-8 rounded-lg flex items-center justify-center font-bold text-xs"
                    >
                      CT-{source.ctChannel}
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1">
                        <span>{source.name}</span>
                      </div>
                      <div style={{ color: colors.textMuted }} className="text-[10px]">
                        {source.active && isConnected
                          ? `${source.current.toFixed(2)} A @ ${telemetry.voltage.toFixed(0)}V`
                          : isConnected
                          ? 'Standby'
                          : 'Awaiting Signal'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      style={{ color: source.active && isConnected ? accentColor : colors.textMuted }}
                      className="text-sm font-black"
                    >
                      {source.active && isConnected ? `${source.activeWatts.toFixed(0)} W` : '0 W'}
                    </span>
                    <div style={{ color: colors.textMuted }} className="text-[10px]">
                      {source.active && isConnected
                        ? source.isProducer
                          ? 'Generating'
                          : 'Importing'
                        : 'Offline'}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Prompt Card when only Utility Grid is active */}
            {sources.length === 1 && (
              <div
                style={{
                  backgroundColor: `${colors.subtle}60`,
                  borderColor: colors.border,
                  color: colors.textMuted,
                }}
                className="p-3 rounded-xl border border-dashed flex items-center gap-2.5 text-xs font-mono"
              >
                <PlusCircle size={16} className="text-emerald-500/70" />
                <div>
                  <span className="font-bold text-xs" style={{ color: colors.textSecondary }}>
                    Single-Source Mode (Mains CT-1)
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Use "+ Add Source" to add Rooftop Solar, Battery or DG channels.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* MIDDLE-LEFT: Inflow Connectors (Col 5) */}
          <div className="col-span-1 flex flex-col items-center justify-around h-full py-4 text-center">
            {sources.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 my-2"
                style={{
                  color: s.active && isConnected ? colors.accentCyan : colors.textMuted,
                }}
              >
                <ArrowRight size={16} className={s.active && isConnected ? 'animate-pulse' : ''} />
              </div>
            ))}
          </div>

          {/* CENTER: Shared AC Voltage Busbar (Col 6-7) */}
          <div
            className="col-span-2 flex flex-col items-center justify-center p-4 rounded-2xl border relative overflow-hidden"
            style={{
              backgroundColor: colors.canvas,
              borderColor: isConnected ? colors.accentCyan : colors.border,
              boxShadow: isConnected ? `0 0 20px ${colors.accentCyan}20` : 'none',
            }}
          >
            {isConnected && (
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 animate-pulse" />
            )}
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <Zap size={12} /> Common AC Bus
            </div>
            <div className="mt-2 text-2xl font-black" style={{ color: colors.textPrimary }}>
              {telemetry.voltage.toFixed(1)} V
            </div>
            <div className="text-[10px] text-center mt-1" style={{ color: colors.textMuted }}>
              {isConnected ? 'V_RMS Reference' : 'Waiting Telemetry'}
            </div>
            <div
              className={`mt-3 px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                isConnected
                  ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
                  : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
              }`}
            >
              {isConnected ? 'ADE7953 Synchronous' : 'Zero Baseline'}
            </div>
            {isConnected && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 animate-pulse" />
            )}
          </div>

          {/* MIDDLE-RIGHT: Outflow Connectors (Col 8) */}
          <div className="col-span-1 flex flex-col items-center justify-around h-full py-4 text-center">
            <div className="flex items-center gap-1" style={{ color: isConnected ? colors.accentCyan : colors.textMuted }}>
              <ArrowRight size={16} className={isConnected ? 'animate-pulse' : ''} />
            </div>
            <div className="flex items-center gap-1" style={{ color: isConnected ? colors.accentEmerald : colors.textMuted }}>
              <ArrowRight size={16} className={isConnected ? 'animate-pulse' : ''} />
            </div>
            <div className="flex items-center gap-1" style={{ color: isConnected ? colors.accentAmber : colors.textMuted }}>
              <ArrowRight size={16} className={isConnected ? 'animate-pulse' : ''} />
            </div>
          </div>

          {/* RIGHT: Disaggregated Facility Loads (Cols 9-12) */}
          <div className="col-span-4 space-y-2.5">
            {/* HVAC */}
            <div
              style={{
                backgroundColor: colors.canvas,
                borderColor: colors.border,
              }}
              className="p-3 rounded-xl border flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold">HVAC / Air Conditioning</div>
                <div style={{ color: colors.textMuted }} className="text-[10px]">
                  {isConnected ? `${telemetry.loadBreakdown.hvacPercent}% of total load` : '0% standby'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black" style={{ color: colors.accentCyan }}>
                  {isConnected ? `${telemetry.loadBreakdown.hvacWatts} W` : '0 W'}
                </span>
              </div>
            </div>

            {/* Kitchen & Refrigerator */}
            <div
              style={{
                backgroundColor: colors.canvas,
                borderColor: colors.border,
              }}
              className="p-3 rounded-xl border flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold">Kitchen & Heavy Appliances</div>
                <div style={{ color: colors.textMuted }} className="text-[10px]">
                  {isConnected ? `${telemetry.loadBreakdown.kitchenPercent}% of total load` : '0% standby'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black" style={{ color: colors.accentEmerald }}>
                  {isConnected ? `${telemetry.loadBreakdown.kitchenWatts} W` : '0 W'}
                </span>
              </div>
            </div>

            {/* Geyser & Base Load */}
            <div
              style={{
                backgroundColor: colors.canvas,
                borderColor: colors.border,
              }}
              className="p-3 rounded-xl border flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold">Geyser & Base Standby</div>
                <div style={{ color: colors.textMuted }} className="text-[10px]">
                  {isConnected
                    ? `${telemetry.loadBreakdown.geyserPercent + telemetry.loadBreakdown.basePercent}% of total load`
                    : '0% standby'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black" style={{ color: colors.accentAmber }}>
                  {isConnected ? `${telemetry.loadBreakdown.geyserWatts + telemetry.loadBreakdown.baseWatts} W` : '0 W'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom KPI Metrics Bar */}
      <div
        style={{
          borderColor: colors.border,
          backgroundColor: colors.canvas,
        }}
        className="mt-2 pt-4 pb-2 px-4 rounded-xl border grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono"
      >
        <div>
          <span style={{ color: colors.textMuted }} className="text-[10px] uppercase font-bold block">
            Total Facility Demand
          </span>
          <span style={{ color: colors.textPrimary }} className="text-base font-black">
            {totalDemandWatts >= 1000 ? `${(totalDemandWatts / 1000).toFixed(2)} kW` : `${totalDemandWatts.toFixed(0)} W`}
          </span>
        </div>

        <div>
          <span style={{ color: colors.textMuted }} className="text-[10px] uppercase font-bold block">
            On-Site Generation
          </span>
          <span style={{ color: colors.accentEmerald }} className="text-base font-black">
            {totalGenerationWatts >= 1000 ? `${(totalGenerationWatts / 1000).toFixed(2)} kW` : `${totalGenerationWatts.toFixed(0)} W`}
          </span>
        </div>

        <div>
          <span style={{ color: colors.textMuted }} className="text-[10px] uppercase font-bold block">
            Net Grid Import
          </span>
          <span style={{ color: colors.accentCyan }} className="text-base font-black">
            {netGridWatts >= 1000 ? `${(netGridWatts / 1000).toFixed(2)} kW` : `${netGridWatts.toFixed(0)} W`}
          </span>
        </div>

        <div>
          <span style={{ color: colors.textMuted }} className="text-[10px] uppercase font-bold block">
            Self-Sufficiency Index
          </span>
          <span style={{ color: colors.accentAmber }} className="text-base font-black">
            {solarCoveragePct.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}
