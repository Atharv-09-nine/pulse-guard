import React from 'react'
import { useTelemetry } from '../context/TelemetryContext'
import { useTheme } from '../context/ThemeContext'
import { ESP32_PIN_MAP, HARDWARE_SPECS } from '../config/hardwareMap'
import { Cpu, Terminal, Wifi, WifiOff, Zap, Database, Clock, RefreshCw } from 'lucide-react'

export default function HardwareSetup() {
  const {
    telemetry,
    wifiConfig,
    wifiStatus,
    wifiLogs,
    isConnectingWifi,
    triggerWifiPoll,
    lastPacketTime,
  } = useTelemetry()
  const { colors } = useTheme()

  const isConnected = wifiStatus === 'CONNECTED'

  return (
    <div className="space-y-6">
      {/* Top Hardware Banner */}
      <div
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.textPrimary,
        }}
        className="rounded-2xl border p-5 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: `${colors.accentCyan}20`,
                borderColor: `${colors.accentCyan}40`,
                color: colors.accentCyan,
              }}
              className="size-11 rounded-xl border flex items-center justify-center"
            >
              <Cpu size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono" style={{ color: colors.textPrimary }}>
                  ESP32-S3 & ADE7953 Architecture & Pinout
                </h2>
                <span
                  style={{
                    backgroundColor: `${colors.accentCyan}15`,
                    color: colors.accentCyan,
                    borderColor: `${colors.accentCyan}30`,
                  }}
                  className="rounded px-2 py-0.5 text-[10px] font-mono font-bold border"
                >
                  ESP32-S3-Zero / Mini
                </span>
              </div>
              <p style={{ color: colors.textMuted }} className="text-xs font-mono mt-1">
                Extracted directly from firmware source: <code className="text-emerald-500">mp_backup.ino</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <button
              type="button"
              onClick={() => triggerWifiPoll()}
              disabled={isConnectingWifi}
              style={{
                backgroundColor: isConnected ? `${colors.accentEmerald}20` : `${colors.accentAmber}20`,
                borderColor: isConnected ? colors.accentEmerald : colors.accentAmber,
                color: isConnected ? colors.accentEmerald : colors.accentAmber,
              }}
              className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span>{isConnectingWifi ? 'Querying...' : isConnected ? 'Wi-Fi: Connected' : 'Poll Wi-Fi Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hardware Calibration & Constants Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
          className="rounded-xl border p-4"
        >
          <span style={{ color: colors.textMuted }} className="block text-[10px] uppercase">Meter Constant</span>
          <span className="text-xl font-bold block mt-1" style={{ color: colors.textPrimary }}>
            {HARDWARE_SPECS.meterConstant} <span className="text-xs" style={{ color: colors.textMuted }}>imp/kWh</span>
          </span>
          <span style={{ color: colors.textMuted }} className="text-[10px] block mt-1">BPW34 Pin 7 (5ms debounce)</span>
        </div>

        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
          className="rounded-xl border p-4"
        >
          <span style={{ color: colors.textMuted }} className="block text-[10px] uppercase">CT Transformer Ratio</span>
          <span className="text-xl font-bold block mt-1" style={{ color: colors.accentCyan }}>
            {HARDWARE_SPECS.ctRatio} : 1
          </span>
          <span style={{ color: colors.textMuted }} className="text-[10px] block mt-1">Burden: {HARDWARE_SPECS.burdenOhms} Ω precision</span>
        </div>

        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
          className="rounded-xl border p-4"
        >
          <span style={{ color: colors.textMuted }} className="block text-[10px] uppercase">ADE7953 Voltage Ratio</span>
          <span className="text-xl font-bold block mt-1" style={{ color: colors.accentAmber }}>
            {HARDWARE_SPECS.voltageDividerRatio.toFixed(1)} : 1
          </span>
          <span style={{ color: colors.textMuted }} className="text-[10px] block mt-1">(660.33k + 330) / 330</span>
        </div>

        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
          className="rounded-xl border p-4"
        >
          <span style={{ color: colors.textMuted }} className="block text-[10px] uppercase">Calibration Gains</span>
          <span className="text-lg font-bold block mt-1" style={{ color: colors.accentEmerald }}>
            I: {HARDWARE_SPECS.calCurrentGain} | V: {HARDWARE_SPECS.calVoltageGain}
          </span>
          <span style={{ color: colors.textMuted }} className="text-[10px] block mt-1">EMA Alpha: 0.15</span>
        </div>
      </div>

      {/* Pin Mapping Matrix Table */}
      <div
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.textPrimary,
        }}
        className="rounded-2xl border p-5 space-y-4 font-mono text-xs"
      >
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: colors.border }}>
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: colors.textPrimary }}>
            <Cpu size={16} style={{ color: colors.accentCyan }} />
            ESP32-S3 Physical Pin Assignment Matrix
          </h3>
          <span style={{ color: colors.textMuted }} className="text-xs">11 Assigned Hardware GPIOs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b text-[10px] uppercase" style={{ borderColor: colors.border, color: colors.textMuted }}>
                <th className="pb-3 font-semibold">GPIO Pin</th>
                <th className="pb-3 font-semibold">Constant Name</th>
                <th className="pb-3 font-semibold">IC / Peripheral</th>
                <th className="pb-3 font-semibold">Bus Protocol</th>
                <th className="pb-3 font-semibold">Functional Description</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: `${colors.border}50` }}>
              {ESP32_PIN_MAP.map((item) => (
                <tr key={item.pin} className="hover:bg-slate-500/5 transition-colors">
                  <td className="py-2.5">
                    <span
                      style={{
                        backgroundColor: colors.subtle,
                        borderColor: colors.border,
                        color: colors.accentCyan,
                      }}
                      className="rounded px-2 py-0.5 font-bold border"
                    >
                      GPIO {item.pin}
                    </span>
                  </td>
                  <td className="py-2.5 font-bold" style={{ color: colors.textPrimary }}>{item.name}</td>
                  <td className="py-2.5" style={{ color: colors.textSecondary }}>{item.chip}</td>
                  <td className="py-2.5" style={{ color: colors.textMuted }}>{item.protocol}</td>
                  <td className="py-2.5 text-[11px] max-w-xs" style={{ color: colors.textMuted }}>{item.description}</td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`rounded px-2 py-0.5 text-[9px] font-bold border ${
                        item.status === 'INTERRUPT'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : item.status === 'ACTIVE'
                          ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wi-Fi Telemetry Stream Logs */}
      <div
        style={{
          backgroundColor: colors.canvas,
          borderColor: colors.border,
        }}
        className="rounded-2xl border p-5 space-y-3 font-mono text-xs"
      >
        <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-2">
            <Terminal size={15} style={{ color: colors.accentEmerald }} />
            <span className="font-bold" style={{ color: colors.textPrimary }}>
              ESP32 Wi-Fi Telemetry Log
            </span>
          </div>
          <span style={{ color: colors.textMuted }} className="text-[10px]">
            {isConnected ? `Connected • Last: ${lastPacketTime ? new Date(lastPacketTime).toLocaleTimeString() : 'Now'}` : 'Waiting for Telemetry'}
          </span>
        </div>

        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
          className="h-44 overflow-y-auto space-y-1 p-3 rounded-xl border text-[11px]"
        >
          {wifiLogs.map((log: string, index: number) => (
            <div key={index} className="leading-relaxed font-mono" style={{ color: colors.textSecondary }}>
              <span className="mr-2 font-bold" style={{ color: colors.accentEmerald }}>›</span>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
