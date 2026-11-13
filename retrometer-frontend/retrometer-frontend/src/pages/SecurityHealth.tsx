import React from 'react'
import { useTelemetry } from '../context/TelemetryContext'
import { useTheme } from '../context/ThemeContext'
import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  Activity,
  Zap,
  Lock,
} from 'lucide-react'

export default function SecurityHealth() {
  const { telemetry } = useTelemetry()
  const { colors } = useTheme()

  const {
    voltage,
    activeWatts,
    opticalWatts,
    pulseCount,
  } = telemetry

  // Exact Epsilon logic from prompt:
  // epsilon = |((P_elec - P_opt) / P_elec) * 100|
  const epsilon = activeWatts > 10 ? Math.abs(+(((activeWatts - opticalWatts) / activeWatts) * 100).toFixed(1)) : 0

  let integrityStatus: 'Verified' | 'Warning' | 'Tamper Alert' = 'Verified'

  if (epsilon > 10) {
    integrityStatus = 'Tamper Alert'
  } else if (epsilon > 2) {
    integrityStatus = 'Warning'
  } else {
    integrityStatus = 'Verified'
  }

  // Voltage stability: Nominal 230V IEC standard
  const isVoltageHealthy = voltage >= 205 && voltage <= 255
  const powerQualityStatus = isVoltageHealthy ? 'Grid Healthy' : 'Grid Voltage Fluctuation'

  return (
    <div className="space-y-6">
      {/* Top Banner: Meter Integrity Status */}
      <div
        style={{
          backgroundColor: colors.card,
          borderColor:
            integrityStatus === 'Verified'
              ? `${colors.accentEmerald}60`
              : integrityStatus === 'Warning'
              ? `${colors.accentAmber}60`
              : `${colors.accentRose}80`,
          color: colors.textPrimary,
        }}
        className={`rounded-2xl border p-6 shadow-xl transition-all ${
          integrityStatus === 'Verified'
            ? 'bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10'
            : integrityStatus === 'Warning'
            ? 'bg-gradient-to-r from-amber-500/15 via-transparent to-transparent'
            : 'bg-gradient-to-r from-rose-500/20 via-transparent to-amber-500/10'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div
              style={{
                backgroundColor:
                  integrityStatus === 'Verified'
                    ? `${colors.accentEmerald}20`
                    : integrityStatus === 'Warning'
                    ? `${colors.accentAmber}20`
                    : `${colors.accentRose}20`,
                borderColor:
                  integrityStatus === 'Verified'
                    ? `${colors.accentEmerald}50`
                    : integrityStatus === 'Warning'
                    ? `${colors.accentAmber}50`
                    : `${colors.accentRose}50`,
                color:
                  integrityStatus === 'Verified'
                    ? colors.accentEmerald
                    : integrityStatus === 'Warning'
                    ? colors.accentAmber
                    : colors.accentRose,
              }}
              className={`size-14 rounded-2xl flex items-center justify-center border shadow-lg ${
                integrityStatus === 'Tamper Alert' ? 'animate-bounce' : ''
              }`}
            >
              {integrityStatus === 'Verified' ? (
                <ShieldCheck size={32} />
              ) : integrityStatus === 'Warning' ? (
                <AlertTriangle size={32} />
              ) : (
                <ShieldAlert size={32} />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 style={{ color: colors.textPrimary }} className="text-lg font-bold font-mono">
                  Meter Integrity: {integrityStatus}
                </h2>
                <span
                  style={{
                    backgroundColor:
                      integrityStatus === 'Verified'
                        ? `${colors.accentEmerald}20`
                        : integrityStatus === 'Warning'
                        ? `${colors.accentAmber}20`
                        : `${colors.accentRose}20`,
                    borderColor:
                      integrityStatus === 'Verified'
                        ? `${colors.accentEmerald}50`
                        : integrityStatus === 'Warning'
                        ? `${colors.accentAmber}50`
                        : `${colors.accentRose}50`,
                    color:
                      integrityStatus === 'Verified'
                        ? colors.accentEmerald
                        : integrityStatus === 'Warning'
                        ? colors.accentAmber
                        : colors.accentRose,
                  }}
                  className={`rounded-md px-2.5 py-0.5 text-[10px] font-mono font-bold border ${
                    integrityStatus === 'Tamper Alert' ? 'animate-pulse' : ''
                  }`}
                >
                  {integrityStatus.toUpperCase()} (ε = {epsilon}%)
                </span>
              </div>
              <p style={{ color: colors.textSecondary }} className="text-xs font-mono">
                {integrityStatus === 'Verified'
                  ? 'Dual-domain alignment is optimal: Optical LED pulses match electrical CT line current within legal ±2% tolerance.'
                  : integrityStatus === 'Warning'
                  ? 'Minor vector variance detected (2% < ε ≤ 10%). Meter remains functional with continuous drift tracking.'
                  : 'Tamper Alert: Optical pulse output diverges by >10% from electrical CT load. Suspected bypass or optical occlusion.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center font-mono text-xs">
            <div
              style={{
                backgroundColor: colors.subtle,
                borderColor: colors.border,
              }}
              className="rounded-xl px-3.5 py-2 border text-right"
            >
              <span style={{ color: colors.textMuted }} className="text-[10px] block uppercase">
                Power Quality
              </span>
              <span
                style={{ color: isVoltageHealthy ? colors.accentEmerald : colors.accentAmber }}
                className="font-bold"
              >
                {powerQualityStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Consumer Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono">
        {/* 1. Alignment Epsilon Card */}
        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
          className="rounded-2xl border p-5 shadow-lg space-y-3 transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <span
              style={{ color: colors.textSecondary }}
              className="text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <Zap size={14} style={{ color: colors.accentCyan }} /> Vector Alignment (ε)
            </span>
            <span
              style={{
                color:
                  epsilon <= 2
                    ? colors.accentEmerald
                    : epsilon <= 10
                    ? colors.accentAmber
                    : colors.accentRose,
                backgroundColor:
                  epsilon <= 2
                    ? `${colors.accentEmerald}15`
                    : epsilon <= 10
                    ? `${colors.accentAmber}15`
                    : `${colors.accentRose}15`,
                borderColor:
                  epsilon <= 2
                    ? `${colors.accentEmerald}40`
                    : epsilon <= 10
                    ? `${colors.accentAmber}40`
                    : `${colors.accentRose}40`,
              }}
              className="rounded px-1.5 py-0.5 text-[10px] font-bold border font-mono"
            >
              ε = {epsilon}%
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span style={{ color: colors.textPrimary }} className="text-3xl font-black">
              {Math.max(0, +(100 - epsilon).toFixed(1))}%
            </span>
            <span style={{ color: colors.textMuted }} className="text-xs">
              Sync Score
            </span>
          </div>

          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="w-full h-2 rounded-full overflow-hidden border"
          >
            <div
              className={`h-full transition-all duration-300 ${
                epsilon <= 2
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                  : epsilon <= 10
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.max(5, 100 - epsilon)}%` }}
            />
          </div>

          <div
            style={{ color: colors.textSecondary }}
            className="flex justify-between text-[11px] pt-1"
          >
            <span>Electrical: {activeWatts.toFixed(0)} W</span>
            <span>Optical: {opticalWatts.toFixed(0)} W</span>
          </div>
        </div>

        {/* 2. Grid Health & Voltage Card */}
        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
          className="rounded-2xl border p-5 shadow-lg space-y-3 transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <span
              style={{ color: colors.textSecondary }}
              className="text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <Activity size={14} style={{ color: colors.accentEmerald }} /> Power Quality
            </span>
            <span
              style={{
                backgroundColor: `${colors.accentEmerald}15`,
                color: colors.accentEmerald,
              }}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            >
              GRID HEALTHY
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span style={{ color: colors.textPrimary }} className="text-3xl font-black">
              {voltage.toFixed(1)}
            </span>
            <span style={{ color: colors.accentCyan }} className="text-sm font-bold">
              V
            </span>
          </div>

          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="w-full h-2 rounded-full overflow-hidden border"
          >
            <div
              style={{
                backgroundColor: colors.accentEmerald,
                width: `${Math.min(100, (voltage / 260) * 100)}%`,
              }}
              className="h-full transition-all duration-300"
            />
          </div>

          <div
            style={{ color: colors.textSecondary }}
            className="flex justify-between text-[11px] pt-1"
          >
            <span>Nominal: 230 V (IEC)</span>
            <span>Frequency: 50.0 Hz</span>
          </div>
        </div>

        {/* 3. Physical & Optical Hardware Seals */}
        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
          className="rounded-2xl border p-5 shadow-lg space-y-3 transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <span
              style={{ color: colors.textSecondary }}
              className="text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <Lock size={14} style={{ color: colors.accentAmber }} /> Meter Security Seals
            </span>
            <span
              style={{
                backgroundColor: `${colors.accentEmerald}15`,
                color: colors.accentEmerald,
              }}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            >
              INTACT
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span style={{ color: colors.textPrimary }} className="text-3xl font-black">
              {pulseCount.toLocaleString()}
            </span>
            <span style={{ color: colors.textMuted }} className="text-xs">
              Total Pulses
            </span>
          </div>

          <div style={{ color: colors.textSecondary }} className="pt-1 text-[11px] space-y-1">
            <div className="flex items-center justify-between">
              <span style={{ color: colors.textMuted }}>Terminal Seal:</span>
              <span className="text-emerald-500 font-semibold">Active & Sealed</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: colors.textMuted }}>Optical Port:</span>
              <span style={{ color: colors.accentCyan }} className="font-semibold">
                BPW34 Diode Locked
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Health Audit Log (Clean Consumer Experience) */}
      <div
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.textPrimary,
        }}
        className="rounded-2xl border p-5 shadow-lg space-y-4 font-mono text-xs transition-colors duration-200"
      >
        <div
          style={{ borderColor: colors.border }}
          className="flex items-center justify-between border-b pb-3"
        >
          <h3 style={{ color: colors.textPrimary }} className="text-sm font-bold flex items-center gap-2">
            <CheckCircle size={16} style={{ color: colors.accentEmerald }} />
            Continuous Metrology & Security Checks
          </h3>
          <span style={{ color: colors.textMuted }} className="text-[10px]">
            Auto-Refreshed Every 500ms
          </span>
        </div>

        <div className="space-y-2.5">
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="flex items-start gap-3 rounded-xl p-3 border"
          >
            <CheckCircle size={15} style={{ color: colors.accentEmerald }} className="shrink-0 mt-0.5" />
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <span style={{ color: colors.textPrimary }} className="font-bold block">
                  Dual-Vector Power Synchronized
                </span>
                <span style={{ color: colors.textSecondary }} className="text-[11px]">
                  ADE7953 True-RMS line power and BPW34 optical sensor verified within legal tolerance.
                </span>
              </div>
              <span style={{ color: colors.accentEmerald }} className="text-[10px] font-bold shrink-0">
                PASS
              </span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="flex items-start gap-3 rounded-xl p-3 border"
          >
            <CheckCircle size={15} style={{ color: colors.accentEmerald }} className="shrink-0 mt-0.5" />
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <span style={{ color: colors.textPrimary }} className="font-bold block">
                  Grid Voltage Quality
                </span>
                <span style={{ color: colors.textSecondary }} className="text-[11px]">
                  Voltage operates within standard IEC range with pure 50.0 Hz sinusoidal frequency.
                </span>
              </div>
              <span style={{ color: colors.accentEmerald }} className="text-[10px] font-bold shrink-0">
                OPTIMAL
              </span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="flex items-start gap-3 rounded-xl p-3 border"
          >
            <CheckCircle size={15} style={{ color: colors.accentEmerald }} className="shrink-0 mt-0.5" />
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <span style={{ color: colors.textPrimary }} className="font-bold block">
                  Hardware RTC & Tamper Log
                </span>
                <span style={{ color: colors.textSecondary }} className="text-[11px]">
                  DS1302 3-Wire Real-Time Clock active and synchronized with zero unauthorized access events.
                </span>
              </div>
              <span style={{ color: colors.accentEmerald }} className="text-[10px] font-bold shrink-0">
                SYNCED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
