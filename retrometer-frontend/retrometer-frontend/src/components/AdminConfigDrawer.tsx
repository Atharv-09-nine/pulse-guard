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
  Wifi,
  WifiOff,
  Radio,
  Zap,
  ShieldAlert,
  Terminal,
  IndianRupee,
  Activity,
  Waves,
  RefreshCw,
  Settings,
  Layers,
  CheckCircle,
  Database,
  Globe,
  Play,
  Pause,
  AlertTriangle,
} from 'lucide-react'

export default function AdminConfigDrawer() {
  const {
    isAdminDrawerOpen,
    setIsAdminDrawerOpen,
    lockAdmin,
    telemetry,
    controls,
    updateControls,
    wifiConfig,
    updateWifiConfig,
    wifiStatus,
    lastPacketTime,
    lastPacketRaw,
    wifiLogs,
    isConnectingWifi,
    triggerWifiPoll,
    resetPulseCount,
    setMeterConstant,
    ctCalibrations,
    updateCTCalibration,
    sources,
  } = useTelemetry()
  const { colors } = useTheme()

  const [activeTab, setActiveTab] = useState<'wifi' | 'simulator' | 'multict' | 'tariffs' | 'harmonics'>('wifi')

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
                Wi-Fi receiver, Multi-CT calibration, ToU rates & test injector
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
          {/* 1. Wi-Fi & Cloud Sync Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('wifi')}
            style={{
              borderBottomColor: activeTab === 'wifi' ? colors.accentEmerald : 'transparent',
              color: activeTab === 'wifi' ? colors.accentEmerald : colors.textSecondary,
            }}
            className="py-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Wifi size={14} />
            <span>Wi-Fi & Cloud Sync</span>
          </button>

          {/* 2. Test Signal Injector Tab */}
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
            <span>Test Injector</span>
            {controls.active && (
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>

          {/* 3. Multi-CT Mux Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('multict')}
            style={{
              borderBottomColor: activeTab === 'multict' ? colors.accentEmerald : 'transparent',
              color: activeTab === 'multict' ? colors.accentEmerald : colors.textSecondary,
            }}
            className="py-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Layers size={14} />
            <span>Multi-CT Mux (16-Ch)</span>
          </button>

          {/* 4. Tariffs Tab */}
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

          {/* 5. Harmonics Tab */}
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
          {/* TAB 1: WI-FI TELEMETRY RECEIVER & CLOUD SYNC */}
          {activeTab === 'wifi' && (
            <div className="space-y-5">
              {/* Receiver Status Card */}
              <div
                style={{
                  backgroundColor: colors.subtle,
                  borderColor: colors.border,
                }}
                className="rounded-xl border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi size={16} style={{ color: colors.accentEmerald }} />
                    <span style={{ color: colors.textPrimary }} className="font-bold">
                      2.4 GHz Wi-Fi Telemetry Stream
                    </span>
                  </div>
                  <span
                    className={`rounded px-2.5 py-0.5 text-[10px] font-bold border ${
                      wifiStatus === 'CONNECTED'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
                        : 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                    }`}
                  >
                    {wifiStatus === 'CONNECTED' ? 'CONNECTED' : 'WAITING FOR PACKETS'}
                  </span>
                </div>
                <p style={{ color: colors.textMuted }} className="text-[11px]">
                  ESP32 transmits ADE7953 JSON telemetry over Wi-Fi. Supports local HTTP polling (<code className="text-emerald-500">/data</code>), Cloud Firebase Realtime DB, and WebSockets.
                </p>

                {/* Receiver Mode Selector */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => updateWifiConfig({ mode: 'LOCAL_HTTP' })}
                    style={{
                      backgroundColor: wifiConfig.mode === 'LOCAL_HTTP' ? `${colors.accentEmerald}20` : colors.card,
                      borderColor: wifiConfig.mode === 'LOCAL_HTTP' ? colors.accentEmerald : colors.border,
                      color: wifiConfig.mode === 'LOCAL_HTTP' ? colors.accentEmerald : colors.textSecondary,
                    }}
                    className="p-2.5 rounded-xl border flex flex-col items-center text-center transition-all font-mono"
                  >
                    <Globe size={16} className="mb-1" />
                    <span className="font-bold text-[11px]">Local HTTP</span>
                    <span className="text-[9px]" style={{ color: colors.textMuted }}>ESP32 /data</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateWifiConfig({ mode: 'CLOUD_FIREBASE' })}
                    style={{
                      backgroundColor: wifiConfig.mode === 'CLOUD_FIREBASE' ? `${colors.accentCyan}20` : colors.card,
                      borderColor: wifiConfig.mode === 'CLOUD_FIREBASE' ? colors.accentCyan : colors.border,
                      color: wifiConfig.mode === 'CLOUD_FIREBASE' ? colors.accentCyan : colors.textSecondary,
                    }}
                    className="p-2.5 rounded-xl border flex flex-col items-center text-center transition-all font-mono"
                  >
                    <Database size={16} className="mb-1" />
                    <span className="font-bold text-[11px]">Cloud Firebase</span>
                    <span className="text-[9px]" style={{ color: colors.textMuted }}>Render / Remote</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateWifiConfig({ mode: 'WEBSOCKET' })}
                    style={{
                      backgroundColor: wifiConfig.mode === 'WEBSOCKET' ? `${colors.accentPurple}20` : colors.card,
                      borderColor: wifiConfig.mode === 'WEBSOCKET' ? colors.accentPurple : colors.border,
                      color: wifiConfig.mode === 'WEBSOCKET' ? colors.accentPurple : colors.textSecondary,
                    }}
                    className="p-2.5 rounded-xl border flex flex-col items-center text-center transition-all font-mono"
                  >
                    <Radio size={16} className="mb-1" />
                    <span className="font-bold text-[11px]">WebSocket</span>
                    <span className="text-[9px]" style={{ color: colors.textMuted }}>ws://:81</span>
                  </button>
                </div>
              </div>

              {/* Endpoint & Network Configuration */}
              <div
                style={{
                  backgroundColor: colors.subtle,
                  borderColor: colors.border,
                }}
                className="rounded-xl border p-4 space-y-4"
              >
                <span style={{ color: colors.textPrimary }} className="font-bold block">
                  Wi-Fi Network Target
                </span>

                {wifiConfig.mode === 'LOCAL_HTTP' && (
                  <div className="space-y-3">
                    <div>
                      <label style={{ color: colors.textSecondary }} className="block mb-1 text-[11px]">
                        ESP32 Wi-Fi HTTP Endpoint URL
                      </label>
                      <input
                        type="text"
                        value={wifiConfig.localEndpoint}
                        onChange={(e) => updateWifiConfig({ localEndpoint: e.target.value })}
                        placeholder="http://192.168.1.150/data"
                        style={{
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        }}
                        className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                      />
                      <span style={{ color: colors.textMuted }} className="text-[10px] block mt-1">
                        Matches <code className="text-emerald-500">server.on("/data", ...)</code> in mp_backup.ino.
                      </span>
                    </div>

                    <div>
                      <label style={{ color: colors.textSecondary }} className="block mb-1 text-[11px]">
                        Local IP Address (Fallback)
                      </label>
                      <input
                        type="text"
                        value={wifiConfig.localIp}
                        onChange={(e) => updateWifiConfig({ localIp: e.target.value })}
                        placeholder="192.168.1.150"
                        style={{
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        }}
                        className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {wifiConfig.mode === 'CLOUD_FIREBASE' && (
                  <div className="space-y-3">
                    <div>
                      <label style={{ color: colors.textSecondary }} className="block mb-1 text-[11px]">
                        Firebase Realtime Database REST URL
                      </label>
                      <input
                        type="text"
                        value={wifiConfig.firebaseUrl}
                        onChange={(e) => updateWifiConfig({ firebaseUrl: e.target.value })}
                        placeholder="https://<project-id>-default-rtdb.firebaseio.com/telemetry.json"
                        style={{
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        }}
                        className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                      />
                      <span style={{ color: colors.textMuted }} className="text-[10px] block mt-1">
                        Allows telemetry streaming when frontend is hosted in the cloud without local subnet restrictions.
                      </span>
                    </div>
                  </div>
                )}

                {wifiConfig.mode === 'WEBSOCKET' && (
                  <div className="space-y-3">
                    <div>
                      <label style={{ color: colors.textSecondary }} className="block mb-1 text-[11px]">
                        WebSocket URL (Port 81)
                      </label>
                      <input
                        type="text"
                        value={wifiConfig.websocketUrl}
                        onChange={(e) => updateWifiConfig({ websocketUrl: e.target.value })}
                        placeholder="ws://192.168.1.150:81"
                        style={{
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        }}
                        className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Polling Interval & Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label style={{ color: colors.textSecondary }} className="block mb-1 text-[11px]">
                      Poll Interval (ms)
                    </label>
                    <input
                      type="number"
                      step="250"
                      min="500"
                      max="10000"
                      value={wifiConfig.pollIntervalMs}
                      onChange={(e) => updateWifiConfig({ pollIntervalMs: parseInt(e.target.value) || 1000 })}
                      style={{
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      }}
                      className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => triggerWifiPoll()}
                      disabled={isConnectingWifi}
                      style={{
                        backgroundColor: colors.accentEmerald,
                        color: '#FFFFFF',
                      }}
                      className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={isConnectingWifi ? 'animate-spin' : ''} />
                      <span>{isConnectingWifi ? 'Querying...' : 'Poll Stream Now'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Meter Constant Selector & Calibration */}
              <div
                style={{
                  backgroundColor: colors.subtle,
                  borderColor: colors.border,
                }}
                className="rounded-xl border p-4 space-y-3"
              >
                <span style={{ color: colors.textPrimary }} className="font-bold block">
                  Meter Constant (Optical Pulse Engine)
                </span>
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

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={resetPulseCount}
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.textSecondary,
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border py-2 text-xs hover:text-amber-500 transition-colors"
                  >
                    <RefreshCw size={13} />
                    <span>Reset Pulse Counter & Energy Total</span>
                  </button>
                </div>
              </div>

              {/* Raw Packet Inspector */}
              <div
                style={{
                  backgroundColor: colors.subtle,
                  borderColor: colors.border,
                }}
                className="rounded-xl border p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.textPrimary }} className="font-bold">
                    Last Received Wi-Fi Packet
                  </span>
                  <span style={{ color: colors.textMuted }} className="text-[10px]">
                    {lastPacketTime ? new Date(lastPacketTime).toLocaleTimeString() : 'None Received'}
                  </span>
                </div>
                <pre
                  style={{
                    backgroundColor: colors.canvas,
                    borderColor: colors.border,
                    color: colors.accentCyan,
                  }}
                  className="p-3 rounded-lg border text-[10px] overflow-x-auto max-h-36 font-mono"
                >
                  {lastPacketRaw
                    ? JSON.stringify(lastPacketRaw, null, 2)
                    : '// Awaiting first telemetry packet from ESP32 Wi-Fi...'}
                </pre>
              </div>

              {/* Diagnostic Log Terminal */}
              <div
                style={{
                  backgroundColor: colors.subtle,
                  borderColor: colors.border,
                }}
                className="rounded-xl border p-4 space-y-2"
              >
                <span style={{ color: colors.textPrimary }} className="font-bold block flex items-center gap-2">
                  <Terminal size={14} style={{ color: colors.accentEmerald }} /> Receiver Diagnostic Log
                </span>
                <div
                  style={{
                    backgroundColor: colors.canvas,
                    borderColor: colors.border,
                    color: colors.textSecondary,
                  }}
                  className="h-32 overflow-y-auto p-3 rounded-lg border space-y-1 text-[10px]"
                >
                  {wifiLogs.map((log, i) => (
                    <div key={i}>
                      <span style={{ color: colors.accentEmerald }} className="mr-1.5 font-bold">›</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEST SIGNAL INJECTOR (OFF BY DEFAULT) */}
          {activeTab === 'simulator' && (
            <div className="space-y-5">
              {/* Master Toggle Banner */}
              <div
                style={{
                  backgroundColor: controls.active ? `${colors.accentEmerald}15` : `${colors.accentAmber}15`,
                  borderColor: controls.active ? colors.accentEmerald : colors.accentAmber,
                }}
                className="rounded-xl border p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Sliders size={16} style={{ color: controls.active ? colors.accentEmerald : colors.accentAmber }} />
                    <span className="font-bold text-sm" style={{ color: colors.textPrimary }}>
                      Test Signal Injector (Offline Mode)
                    </span>
                  </div>
                  <p style={{ color: colors.textMuted }} className="text-[11px] mt-1">
                    {controls.active
                      ? 'ACTIVE: Injecting synthetic metrology data for UI and gauge testing.'
                      : 'OFF (Default): Strictly zero fake data. Dashboard displays clean baseline.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => updateControls({ active: !controls.active })}
                  style={{
                    backgroundColor: controls.active ? colors.accentEmerald : colors.border,
                    color: controls.active ? '#FFFFFF' : colors.textPrimary,
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0"
                >
                  {controls.active ? <Pause size={14} /> : <Play size={14} />}
                  <span>{controls.active ? 'Disable Injector' : 'Enable Injector'}</span>
                </button>
              </div>

              {controls.active ? (
                <div
                  style={{
                    backgroundColor: colors.subtle,
                    borderColor: colors.border,
                  }}
                  className="rounded-xl border p-4 space-y-4"
                >
                  <span style={{ color: colors.textPrimary }} className="font-bold block">
                    Synthetic Metrology Sliders
                  </span>

                  {/* 1. Load Watts */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Active Load (P_elec)</span>
                      <strong style={{ color: colors.accentEmerald }}>{controls.loadWatts} W</strong>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="50"
                      value={controls.loadWatts}
                      onChange={(e) => updateControls({ loadWatts: Number(e.target.value) })}
                      style={{ backgroundColor: colors.border }}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 rounded"
                    />
                  </div>

                  {/* 2. Power Factor */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Power Factor (cos φ)</span>
                      <strong style={{ color: colors.accentCyan }}>{controls.powerFactor.toFixed(2)}</strong>
                    </div>
                    <input
                      type="range"
                      min="0.70"
                      max="1.00"
                      step="0.01"
                      value={controls.powerFactor}
                      onChange={(e) => updateControls({ powerFactor: Number(e.target.value) })}
                      style={{ backgroundColor: colors.border }}
                      className="w-full accent-cyan-500 cursor-pointer h-1.5 rounded"
                    />
                  </div>

                  {/* 3. Tamper Drift % */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Tamper Drift (P_opt Divergence)</span>
                      <strong style={{ color: colors.accentRose }}>{controls.tamperDriftPercent}%</strong>
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
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => updateControls({ loadWatts: 250, powerFactor: 0.98, tamperDriftPercent: 0 })}
                      style={{ backgroundColor: colors.card, borderColor: colors.border }}
                      className="p-2.5 rounded-xl border text-left"
                    >
                      <span className="font-bold block">Eco Base (250W)</span>
                      <span className="text-[10px]" style={{ color: colors.textMuted }}>PF: 0.98 • Normal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateControls({ loadWatts: 1850, powerFactor: 0.94, tamperDriftPercent: 0 })}
                      style={{ backgroundColor: colors.card, borderColor: colors.border }}
                      className="p-2.5 rounded-xl border text-left"
                    >
                      <span className="font-bold block">Normal (1,850W)</span>
                      <span className="text-[10px]" style={{ color: colors.textMuted }}>PF: 0.94 • Normal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateControls({ loadWatts: 3600, powerFactor: 0.88, tamperDriftPercent: 0 })}
                      style={{ backgroundColor: colors.card, borderColor: colors.border }}
                      className="p-2.5 rounded-xl border text-left"
                    >
                      <span className="font-bold block">Heavy HVAC (3.6kW)</span>
                      <span className="text-[10px]" style={{ color: colors.textMuted }}>PF: 0.88 • Heavy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateControls({ loadWatts: 2400, powerFactor: 0.92, tamperDriftPercent: 35 })}
                      className="p-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-left"
                    >
                      <span className="font-bold text-rose-500 block">Theft Alert (+35%)</span>
                      <span className="text-[10px] text-rose-400">Trigger divergence</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: colors.subtle,
                    borderColor: colors.border,
                  }}
                  className="rounded-xl border p-6 text-center space-y-2"
                >
                  <AlertTriangle size={24} className="mx-auto text-amber-500" />
                  <h3 className="font-bold text-sm" style={{ color: colors.textPrimary }}>
                    Zero Fake Data Mode Enforced
                  </h3>
                  <p style={{ color: colors.textMuted }} className="text-xs max-w-md mx-auto">
                    The background test signal generator is stopped. All metrics on the consumer dashboard reflect clean zeroed baselines until real packets arrive over Wi-Fi.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MULTI-CT MUX (CD74HC4067) CALIBRATION */}
          {activeTab === 'multict' && (
            <div className="space-y-5">
              {/* Multiplexer Architecture Overview */}
              <div
                style={{
                  backgroundColor: colors.subtle,
                  borderColor: colors.border,
                }}
                className="rounded-xl border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.textPrimary }} className="font-bold flex items-center gap-2">
                    <Layers size={15} style={{ color: colors.accentEmerald }} /> CD74HC4067 16-Channel Analog Mux
                  </span>
                  <span
                    style={{
                      backgroundColor: `${colors.accentEmerald}15`,
                      color: colors.accentEmerald,
                      borderColor: `${colors.accentEmerald}30`,
                    }}
                    className="rounded px-2 py-0.5 text-[10px] font-bold border"
                  >
                    Shared 230V Bus Metrology
                  </span>
                </div>
                <p style={{ color: colors.textMuted }} className="text-[11px] leading-relaxed">
                  Every SCT-013 current channel is multiplexed into the ADE7953 current input (IAP) while sharing the exact same synchronous AC line voltage (V_RMS = {telemetry.voltage.toFixed(1)}V) sampled on Phase A.
                </p>

                {/* Pinout Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[10px] font-mono">
                  <div style={{ backgroundColor: colors.card, borderColor: colors.border }} className="p-2 rounded border">
                    <span style={{ color: colors.textMuted }} className="block">S0 - S1 (Bit 0, 1)</span>
                    <span style={{ color: colors.accentCyan }} className="font-bold">GPIO 14, 15</span>
                  </div>
                  <div style={{ backgroundColor: colors.card, borderColor: colors.border }} className="p-2 rounded border">
                    <span style={{ color: colors.textMuted }} className="block">S2 - S3 (Bit 2, 3)</span>
                    <span style={{ color: colors.accentCyan }} className="font-bold">GPIO 16, 17</span>
                  </div>
                  <div style={{ backgroundColor: colors.card, borderColor: colors.border }} className="p-2 rounded border">
                    <span style={{ color: colors.textMuted }} className="block">Signal Out (SIG)</span>
                    <span style={{ color: colors.accentEmerald }} className="font-bold">ADE7953 IAP</span>
                  </div>
                  <div style={{ backgroundColor: colors.card, borderColor: colors.border }} className="p-2 rounded border">
                    <span style={{ color: colors.textMuted }} className="block">Burden & CT</span>
                    <span style={{ color: colors.accentAmber }} className="font-bold">3.3Ω // 2000:1</span>
                  </div>
                </div>
              </div>

              {/* 16-Channel Calibration Matrix */}
              <div
                style={{
                  backgroundColor: colors.subtle,
                  borderColor: colors.border,
                }}
                className="rounded-xl border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.textPrimary }} className="font-bold flex items-center gap-2">
                    <Sliders size={14} style={{ color: colors.accentCyan }} /> Channel Calibration Matrix (CT-1 to CT-16)
                  </span>
                  <span style={{ color: colors.textMuted }} className="text-[10px]">
                    Ki_ph Phase Gain & Offset
                  </span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {ctCalibrations.map((cal) => {
                    const matchedSource = sources.find((s) => s.ctChannel === cal.channel)
                    const isActive = matchedSource ? matchedSource.active : cal.active

                    return (
                      <div
                        key={cal.channel}
                        style={{
                          backgroundColor: colors.card,
                          borderColor: isActive ? colors.accentEmerald : colors.border,
                        }}
                        className="p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            style={{
                              backgroundColor: isActive ? `${colors.accentEmerald}20` : `${colors.border}`,
                              color: isActive ? colors.accentEmerald : colors.textMuted,
                            }}
                            className="size-8 rounded-lg flex items-center justify-center font-bold font-mono text-[11px]"
                          >
                            CT-{cal.channel}
                          </span>
                          <div>
                            <div className="font-bold text-xs" style={{ color: colors.textPrimary }}>
                              {matchedSource ? matchedSource.name : `Auxiliary CT-${cal.channel}`}
                            </div>
                            <div className="text-[10px] font-mono flex items-center gap-2" style={{ color: colors.textMuted }}>
                              <span>R_burden: {cal.burdenOhms}Ω</span>
                              <span>•</span>
                              <span style={{ color: isActive ? colors.accentEmerald : colors.textMuted }}>
                                {isActive ? (matchedSource?.isProducer ? 'Generating' : 'Online') : 'Standby'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Gain & Phase controls */}
                        <div className="flex items-center gap-3 font-mono">
                          <div>
                            <label className="block text-[9px] uppercase font-bold" style={{ color: colors.textMuted }}>
                              Gain Ki
                            </label>
                            <input
                              type="number"
                              step="0.001"
                              min="0.5"
                              max="2.0"
                              value={cal.kiGain}
                              onChange={(e) =>
                                updateCTCalibration(cal.channel, { kiGain: parseFloat(e.target.value) || 1.0 })
                              }
                              style={{
                                backgroundColor: colors.canvas,
                                borderColor: colors.border,
                                color: colors.textPrimary,
                              }}
                              className="w-20 px-2 py-1 rounded border text-xs focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold" style={{ color: colors.textMuted }}>
                              Phase θ (°)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="-15"
                              max="15"
                              value={cal.phaseOffsetDeg}
                              onChange={(e) =>
                                updateCTCalibration(cal.channel, { phaseOffsetDeg: parseFloat(e.target.value) || 0.0 })
                              }
                              style={{
                                backgroundColor: colors.canvas,
                                borderColor: colors.border,
                                color: colors.textPrimary,
                              }}
                              className="w-16 px-2 py-1 rounded border text-xs focus:outline-none"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => updateCTCalibration(cal.channel, { kiGain: 1.000, phaseOffsetDeg: 0.0 })}
                            style={{ color: colors.textMuted }}
                            className="p-1 hover:text-emerald-400 text-[10px] underline pt-3"
                            title="Reset to 1.000"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TARIFF EDITOR */}
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

          {/* TAB 5: HARMONICS */}
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
