import React, { useState } from 'react'
import { useTelemetry } from '../context/TelemetryContext'
import { useTheme } from '../context/ThemeContext'
import { HARDWARE_SPECS, ESP32_PIN_MAP } from '../config/hardwareMap'
import {
  X,
  Lock,
  Unlock,
  Sliders,
  Cpu,
  Usb,
  Radio,
  Zap,
  ShieldAlert,
  Terminal,
  IndianRupee,
  Activity,
  Waves,
  RefreshCw,
  Settings,
} from 'lucide-react'

export default function AdminConfigDrawer() {
  const {
    isAdminDrawerOpen,
    setIsAdminDrawerOpen,
    lockAdmin,
    telemetry,
    controls,
    updateControls,
    connectionMode,
    setConnectionMode,
    isSerialConnected,
    connectSerial,
    disconnectSerial,
    serialLogs,
    resetPulseCount,
    setMeterConstant,
  } = useTelemetry()
  const { colors } = useTheme()

  const [activeTab, setActiveTab] = useState<'simulator' | 'hardware' | 'tariffs' | 'harmonics'>('simulator')

  if (!isAdminDrawerOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.textPrimary,
        }}
        className="relative w-full max-w-2xl h-full border-l shadow-2xl flex flex-col font-mono transition-colors duration-200"
      >
        {/* Drawer Header */}
        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
          className="flex items-center justify-between border-b px-6 py-4"
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: `${colors.accentAmber}15`,
                borderColor: `${colors.accentAmber}30`,
                color: colors.accentAmber,
              }}
              className="size-10 rounded-xl border flex items-center justify-center"
            >
              <Settings size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 style={{ color: colors.textPrimary }} className="text-base font-bold">
                  Admin Metrology Console
                </h2>
                <span
                  style={{
                    backgroundColor: `${colors.accentAmber}20`,
                    color: colors.accentAmber,
                    borderColor: `${colors.accentAmber}40`,
                  }}
                  className="rounded px-2 py-0.5 text-[10px] font-bold border"
                >
                  UNLOCKED
                </span>
              </div>
              <p style={{ color: colors.textMuted }} className="text-xs">
                Hardware parameters, WebSerial connection, ToU rates & tamper injector
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Relock Button */}
            <button
              type="button"
              onClick={lockAdmin}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/20 transition-all"
            >
              <Lock size={13} />
              <span>Lock Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAdminDrawerOpen(false)}
              style={{ color: colors.textSecondary }}
              className="rounded-xl p-2 hover:opacity-80 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs inside Drawer */}
        <div
          style={{
            backgroundColor: colors.subtle,
            borderColor: colors.border,
          }}
          className="flex border-b px-6 text-xs font-semibold overflow-x-auto"
        >
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            style={{
              borderBottomColor: activeTab === 'simulator' ? colors.accentCyan : 'transparent',
              color: activeTab === 'simulator' ? colors.accentCyan : colors.textSecondary,
            }}
            className="py-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Sliders size={14} />
            <span>Simulator Injector</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hardware')}
            style={{
              borderBottomColor: activeTab === 'hardware' ? colors.accentCyan : 'transparent',
              color: activeTab === 'hardware' ? colors.accentCyan : colors.textSecondary,
            }}
            className="py-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Cpu size={14} />
            <span>Hardware & Serial</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tariffs')}
            style={{
              borderBottomColor: activeTab === 'tariffs' ? colors.accentCyan : 'transparent',
              color: activeTab === 'tariffs' ? colors.accentCyan : colors.textSecondary,
            }}
            className="py-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <IndianRupee size={14} />
            <span>Tariff Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('harmonics')}
            style={{
              borderBottomColor: activeTab === 'harmonics' ? colors.accentCyan : 'transparent',
              color: activeTab === 'harmonics' ? colors.accentCyan : colors.textSecondary,
            }}
            className="py-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Waves size={14} />
            <span>Harmonics / FFT</span>
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* TAB 1: SIMULATOR INJECTOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-5">
              <div
                style={{
                  backgroundColor: colors.subtle,
                  borderColor: colors.border,
                }}
                className="rounded-xl border p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.textPrimary }} className="font-bold flex items-center gap-2">
                    <Sliders size={15} style={{ color: colors.accentCyan }} /> Live Telemetry Injection Sliders
                  </span>
                  <span style={{ color: colors.textMuted }} className="text-[10px]">
                    Affects Dual-Ring Gauge in Real Time
                  </span>
                </div>

                {/* 1. Load Watts */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span style={{ color: colors.textSecondary }}>Active Load Watts:</span>
                    <span style={{ color: colors.accentCyan }} className="font-bold">{controls.loadWatts} W</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="50"
                    value={controls.loadWatts}
                    onChange={(e) => updateControls({ loadWatts: Number(e.target.value) })}
                    style={{ backgroundColor: colors.border }}
                    className="w-full accent-cyan-500 cursor-pointer h-1.5 rounded"
                  />
                  <div style={{ color: colors.textMuted }} className="flex justify-between text-[10px]">
                    <span>100W</span>
                    <span>2.5kW</span>
                    <span>5.0kW</span>
                  </div>
                </div>

                {/* 2. Power Factor */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span style={{ color: colors.textSecondary }}>Power Factor (cos φ):</span>
                    <span style={{ color: colors.accentEmerald }} className="font-bold">{controls.powerFactor.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.65"
                    max="1.00"
                    step="0.01"
                    value={controls.powerFactor}
                    onChange={(e) => updateControls({ powerFactor: Number(e.target.value) })}
                    style={{ backgroundColor: colors.border }}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 rounded"
                  />
                  <div style={{ color: colors.textMuted }} className="flex justify-between text-[10px]">
                    <span>0.65 (Inductive)</span>
                    <span>0.85</span>
                    <span>1.00 (Unity)</span>
                  </div>
                </div>

                {/* 3. Tamper Drift % */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span style={{ color: colors.textSecondary }}>Tamper Drift % (Bypass):</span>
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded ${
                        controls.tamperDriftPercent === 0
                          ? 'text-gray-400 bg-gray-500/10'
                          : 'text-rose-500 bg-rose-500/20'
                      }`}
                    >
                      {controls.tamperDriftPercent > 0
                        ? `-${controls.tamperDriftPercent}% Bypass`
                        : `${controls.tamperDriftPercent}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="60"
                    step="5"
                    value={controls.tamperDriftPercent}
                    onChange={(e) => updateControls({ tamperDriftPercent: Number(e.target.value) })}
                    style={{ backgroundColor: colors.border }}
                    className="w-full accent-rose-500 cursor-pointer h-1.5 rounded"
                  />
                  <div style={{ color: colors.textMuted }} className="flex justify-between text-[10px]">
                    <span>-50% (High Pulse)</span>
                    <span>0% (Synced)</span>
                    <span>+60% (Theft / Occlusion)</span>
                  </div>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-2">
                <span style={{ color: colors.textMuted }} className="text-[11px] block uppercase font-bold">
                  Quick Injections
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateControls({ loadWatts: 250, powerFactor: 0.98, tamperDriftPercent: 0 })}
                    style={{
                      backgroundColor: colors.subtle,
                      borderColor: colors.border,
                    }}
                    className="rounded-xl border p-2.5 text-left hover:border-cyan-500/50 transition-colors"
                  >
                    <span style={{ color: colors.textPrimary }} className="font-bold block">Eco Base (250W)</span>
                    <span style={{ color: colors.textMuted }} className="text-[10px]">PF: 0.98 • 0% Drift</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateControls({ loadWatts: 1850, powerFactor: 0.94, tamperDriftPercent: 0 })}
                    style={{
                      backgroundColor: colors.subtle,
                      borderColor: colors.border,
                    }}
                    className="rounded-xl border p-2.5 text-left hover:border-cyan-500/50 transition-colors"
                  >
                    <span style={{ color: colors.textPrimary }} className="font-bold block">Normal (1,850W)</span>
                    <span style={{ color: colors.textMuted }} className="text-[10px]">PF: 0.94 • 0% Drift</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateControls({ loadWatts: 3600, powerFactor: 0.88, tamperDriftPercent: 0 })}
                    style={{
                      backgroundColor: colors.subtle,
                      borderColor: colors.border,
                    }}
                    className="rounded-xl border p-2.5 text-left hover:border-cyan-500/50 transition-colors"
                  >
                    <span style={{ color: colors.textPrimary }} className="font-bold block">Heavy HVAC (3.6kW)</span>
                    <span style={{ color: colors.textMuted }} className="text-[10px]">PF: 0.88 • 0% Drift</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateControls({ loadWatts: 2400, powerFactor: 0.92, tamperDriftPercent: 35 })}
                    className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-2.5 text-left hover:bg-rose-500/20 transition-colors"
                  >
                    <span className="font-bold text-rose-500 block">Theft Bypass (35% Drift)</span>
                    <span className="text-[10px] text-rose-400">Triggers Tamper Alert</span>
                  </button>
                </div>
              </div>

              {/* Reset Counters */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetPulseCount}
                  style={{
                    backgroundColor: colors.subtle,
                    borderColor: colors.border,
                    color: colors.textSecondary,
                  }}
                  className="flex items-center gap-2 rounded-xl border px-4 py-2.5 hover:text-amber-500 hover:border-amber-500/40 transition-colors"
                >
                  <RefreshCw size={14} />
                  <span>Reset Cumulative Energy & Pulse Ticker</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: HARDWARE & SERIAL */}
          {activeTab === 'hardware' && (
            <div className="space-y-5">
              {/* Meter Constant Selector */}
              <div
                style={{
                  backgroundColor: colors.subtle,
                  borderColor: colors.border,
                }}
                className="rounded-xl border p-4 space-y-3"
              >
                <span style={{ color: colors.textPrimary }} className="font-bold block">Meter Constant Configuration</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMeterConstant(3200)}
                    style={{
                      backgroundColor: telemetry.meterConstant === 3200 ? `${colors.accentEmerald}15` : colors.card,
                      borderColor: telemetry.meterConstant === 3200 ? colors.accentEmerald : colors.border,
                      color: telemetry.meterConstant === 3200 ? colors.accentEmerald : colors.textSecondary,
                    }}
                    className="rounded-xl border p-3 text-left transition-all"
                  >
                    <span className="font-bold block text-sm">3200 imp/kWh</span>
                    <span style={{ color: colors.textMuted }} className="text-[10px]">From mp_backup.ino line 164</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMeterConstant(1600)}
                    style={{
                      backgroundColor: telemetry.meterConstant === 1600 ? `${colors.accentEmerald}15` : colors.card,
                      borderColor: telemetry.meterConstant === 1600 ? colors.accentEmerald : colors.border,
                      color: telemetry.meterConstant === 1600 ? colors.accentEmerald : colors.textSecondary,
                    }}
                    className="rounded-xl border p-3 text-left transition-all"
                  >
                    <span className="font-bold block text-sm">1600 imp/kWh</span>
                    <span style={{ color: colors.textMuted }} className="text-[10px]">Utility Standard Variant</span>
                  </button>
                </div>
              </div>

              {/* WebSerial Connect */}
              <div
                style={{
                  backgroundColor: colors.subtle,
                  borderColor: colors.border,
                }}
                className="rounded-xl border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.textPrimary }} className="font-bold flex items-center gap-2">
                    <Usb size={15} style={{ color: colors.accentCyan }} /> ESP32-S3 WebSerial Bus (115200 Baud)
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      isSerialConnected ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {isSerialConnected ? 'CONNECTED' : 'STANDBY'}
                  </span>
                </div>

                <p style={{ color: colors.textSecondary }} className="text-[11px]">
                  Direct USB serial communication with ESP32-S3 running <code className="text-emerald-500">mp_backup.ino</code>.
                </p>

                {isSerialConnected ? (
                  <button
                    type="button"
                    onClick={disconnectSerial}
                    className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-rose-500 font-bold hover:bg-rose-500/20"
                  >
                    Disconnect USB Serial
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={connectSerial}
                    style={{
                      backgroundColor: `${colors.accentCyan}15`,
                      borderColor: colors.accentCyan,
                      color: colors.accentCyan,
                    }}
                    className="rounded-xl border px-4 py-2 font-bold hover:opacity-80 flex items-center gap-2"
                  >
                    <Usb size={14} />
                    <span>Connect ESP32 USB (115200)</span>
                  </button>
                )}
              </div>

              {/* Calibration Constants from mp_backup.ino */}
              <div
                style={{
                  backgroundColor: colors.subtle,
                  borderColor: colors.border,
                }}
                className="rounded-xl border p-4 space-y-3"
              >
                <span style={{ color: colors.textPrimary }} className="font-bold block">Firmware Gain Calibrations</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    }}
                    className="rounded-lg p-2 border"
                  >
                    <span style={{ color: colors.textMuted }} className="block text-[10px]">calCurrentGain</span>
                    <span style={{ color: colors.textPrimary }} className="font-bold">{HARDWARE_SPECS.calCurrentGain}</span>
                  </div>
                  <div
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    }}
                    className="rounded-lg p-2 border"
                  >
                    <span style={{ color: colors.textMuted }} className="block text-[10px]">calVoltageGain</span>
                    <span style={{ color: colors.textPrimary }} className="font-bold">{HARDWARE_SPECS.calVoltageGain}</span>
                  </div>
                  <div
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    }}
                    className="rounded-lg p-2 border"
                  >
                    <span style={{ color: colors.textMuted }} className="block text-[10px]">CT Ratio</span>
                    <span style={{ color: colors.textPrimary }} className="font-bold">{HARDWARE_SPECS.ctRatio} : 1</span>
                  </div>
                  <div
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    }}
                    className="rounded-lg p-2 border"
                  >
                    <span style={{ color: colors.textMuted }} className="block text-[10px]">Burden Ohms</span>
                    <span style={{ color: colors.textPrimary }} className="font-bold">{HARDWARE_SPECS.burdenOhms} Ω</span>
                  </div>
                </div>
              </div>

              {/* Serial Log Stream */}
              <div
                style={{
                  backgroundColor: colors.subtle,
                  borderColor: colors.border,
                }}
                className="rounded-xl border p-4 space-y-2"
              >
                <span style={{ color: colors.textPrimary }} className="font-bold block flex items-center gap-2">
                  <Terminal size={14} style={{ color: colors.accentEmerald }} /> Serial Diagnostic Terminal
                </span>
                <div
                  style={{
                    backgroundColor: colors.canvas,
                    borderColor: colors.border,
                    color: colors.textSecondary,
                  }}
                  className="h-40 overflow-y-auto p-3 rounded-lg border space-y-1 text-[10px]"
                >
                  {serialLogs.map((log, i) => (
                    <div key={i}>
                      <span style={{ color: colors.accentEmerald }} className="mr-1.5 font-bold">›</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TARIFF EDITOR */}
          {activeTab === 'tariffs' && (
            <div className="space-y-4">
              <div
                style={{
                  backgroundColor: colors.subtle,
                  borderColor: colors.border,
                }}
                className="rounded-xl border p-4 space-y-4"
              >
                <span style={{ color: colors.textPrimary }} className="font-bold block">Time-of-Use (ToU) Rate Editor</span>

                <div className="space-y-3">
                  <div>
                    <label style={{ color: colors.textSecondary }} className="block mb-1">Standard Residential Rate (₹/kWh)</label>
                    <div
                      style={{
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      }}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 border"
                    >
                      <IndianRupee size={14} style={{ color: colors.accentAmber }} />
                      <input
                        type="number"
                        step="0.25"
                        value={controls.tariffRatePerKWh}
                        onChange={(e) => updateControls({ tariffRatePerKWh: Number(e.target.value) })}
                        style={{ color: colors.textPrimary }}
                        className="bg-transparent font-bold w-full focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HARMONICS */}
          {activeTab === 'harmonics' && (
            <div className="space-y-4">
              <div
                style={{
                  backgroundColor: colors.subtle,
                  borderColor: colors.border,
                }}
                className="rounded-xl border p-4 space-y-3"
              >
                <span style={{ color: colors.textPrimary }} className="font-bold block">
                  Goertzel Odd Harmonics (Register 0x0216 @ 6.99 kHz)
                </span>
                <p style={{ color: colors.textMuted }} className="text-[11px]">
                  Hardware DSP calculation matching <code className="text-emerald-500">processHarmonics()</code> in mp_backup.ino.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    }}
                    className="rounded-lg p-3 border"
                  >
                    <span style={{ color: colors.textMuted }} className="block text-[10px]">Total Harmonic Distortion</span>
                    <span style={{ color: colors.accentPurple }} className="text-lg font-bold">{telemetry.thdPercent}%</span>
                  </div>
                  <div
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    }}
                    className="rounded-lg p-3 border"
                  >
                    <span style={{ color: colors.textMuted }} className="block text-[10px]">3rd Harmonic (150Hz)</span>
                    <span style={{ color: colors.accentCyan }} className="text-lg font-bold">{telemetry.h3Percent}%</span>
                  </div>
                  <div
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    }}
                    className="rounded-lg p-3 border"
                  >
                    <span style={{ color: colors.textMuted }} className="block text-[10px]">5th Harmonic (250Hz)</span>
                    <span style={{ color: colors.accentAmber }} className="text-lg font-bold">{telemetry.h5Percent}%</span>
                  </div>
                  <div
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    }}
                    className="rounded-lg p-3 border"
                  >
                    <span style={{ color: colors.textMuted }} className="block text-[10px]">7th Harmonic (350Hz)</span>
                    <span style={{ color: colors.accentPurple }} className="text-lg font-bold">{telemetry.h7Percent}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

