import React from 'react'
import { ShieldCheck, ShieldAlert, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import type { TelemetryData } from '../types/telemetry'

interface GridHealthCardProps {
  telemetry: TelemetryData
  isConnected: boolean
}

// Sanzo Wada Traditional Harmony Colors
const SANZO_CELADON = '#2E7D6B' // Celadon Green
const SANZO_PERSIMMON = '#C2410C' // Persimmon Red

export default function GridHealthCard({ telemetry, isConnected }: GridHealthCardProps) {
  const { colors } = useTheme()
  const { voltage, frequency, gridStatus } = telemetry

  const isAnomaly = gridStatus === 'OVERVOLTAGE' || gridStatus === 'UNDERVOLTAGE' || (voltage >= 255.0 || (voltage <= 200.0 && voltage > 20.0))
  const isOverVoltage = voltage >= 255.0 || gridStatus === 'OVERVOLTAGE'

  // If waiting for first Wi-Fi packet
  if (!isConnected && voltage === 0) {
    return (
      <div
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.textPrimary,
        }}
        className="rounded-2xl border p-5 shadow-lg flex flex-col justify-between font-mono transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: `${colors.accentAmber}15`,
                borderColor: `${colors.accentAmber}30`,
                color: colors.accentAmber,
              }}
              className="size-11 rounded-xl border flex items-center justify-center"
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-amber-500">
                Grid Health: Standby
              </span>
              <h3 className="text-base font-bold text-white">
                0.0 V - Awaiting Wi-Fi Sync
              </h3>
            </div>
          </div>
          <span className="rounded px-2.5 py-1 text-[10px] font-bold border border-amber-500/30 text-amber-500 bg-amber-500/10">
            Awaiting Telemetry
          </span>
        </div>
        <p style={{ color: colors.textMuted }} className="text-xs mt-3">
          Grid voltage sensor offline. The system will automatically verify grid stability as soon as Wi-Fi telemetry arrives.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor: isAnomaly ? `${SANZO_PERSIMMON}12` : colors.card,
        borderColor: isAnomaly ? `${SANZO_PERSIMMON}60` : `${SANZO_CELADON}40`,
        color: colors.textPrimary,
      }}
      className={`rounded-2xl border p-5 shadow-lg flex flex-col justify-between font-mono transition-all duration-300 ${
        isAnomaly ? 'ring-1 ring-persimmon' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Shield Icon: Green Celadon for Optimal, Red Persimmon for Anomaly */}
          <div
            style={{
              backgroundColor: isAnomaly ? `${SANZO_PERSIMMON}20` : `${SANZO_CELADON}20`,
              borderColor: isAnomaly ? `${SANZO_PERSIMMON}50` : `${SANZO_CELADON}50`,
              color: isAnomaly ? SANZO_PERSIMMON : SANZO_CELADON,
            }}
            className="size-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner"
          >
            {isAnomaly ? <ShieldAlert size={26} /> : <ShieldCheck size={26} />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                style={{ color: isAnomaly ? SANZO_PERSIMMON : SANZO_CELADON }}
                className="text-xs uppercase font-black tracking-wider"
              >
                {isAnomaly
                  ? 'Grid Health: Voltage Anomaly (Protecting Appliances)'
                  : 'Grid Health: Optimal'}
              </span>
            </div>
            <h3 className="text-lg font-black tracking-tight" style={{ color: colors.textPrimary }}>
              {voltage.toFixed(1)} V — {isAnomaly ? (isOverVoltage ? 'Surge Risk Detected' : 'Brownout Sag') : 'Stable Grid'}
            </h3>
          </div>
        </div>

        {/* Status Badge */}
        <span
          style={{
            backgroundColor: isAnomaly ? `${SANZO_PERSIMMON}20` : `${SANZO_CELADON}20`,
            color: isAnomaly ? SANZO_PERSIMMON : SANZO_CELADON,
            borderColor: isAnomaly ? `${SANZO_PERSIMMON}40` : `${SANZO_CELADON}40`,
          }}
          className="rounded-lg px-2.5 py-1 text-[10px] font-bold border uppercase tracking-wider shrink-0"
        >
          {isAnomaly ? (isOverVoltage ? 'HIGH VOLTAGE' : 'LOW VOLTAGE') : 'HEALTHY'}
        </span>
      </div>

      {/* Explanatory Consumer Protection Alert */}
      <div
        style={{
          borderColor: isAnomaly ? `${SANZO_PERSIMMON}30` : `${SANZO_CELADON}20`,
          backgroundColor: colors.canvas,
        }}
        className="mt-4 p-3 rounded-xl border text-xs"
      >
        {isAnomaly ? (
          <div className="flex items-start gap-2 text-rose-300">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: SANZO_PERSIMMON }} />
            <div>
              <span className="font-bold block" style={{ color: SANZO_PERSIMMON }}>
                {isOverVoltage ? 'Overvoltage Surge Warning' : 'Undervoltage Sag Warning'}
              </span>
              <p style={{ color: colors.textSecondary }} className="text-[11px] mt-0.5">
                {isOverVoltage
                  ? 'Mains line voltage is exceeding 255V. High-voltage surge protection active to protect inverter compressors, LED drivers, and sensitive electronics.'
                  : 'Line voltage has dropped below 200V. Motor-driven appliances may experience increased thermal stress.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <CheckCircle2 size={15} className="shrink-0 mt-0.5" style={{ color: SANZO_CELADON }} />
            <div>
              <span className="font-bold block" style={{ color: SANZO_CELADON }}>
                Clean Sine Wave & Equipment Safe
              </span>
              <p style={{ color: colors.textMuted }} className="text-[11px] mt-0.5">
                Grid voltage is well within standard BIS/IEC limits (230V ±6%). Nominal frequency locked at {frequency.toFixed(2)} Hz.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

