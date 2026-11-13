import React from 'react'
import { useTelemetry } from '../context/TelemetryContext'
import { ESP32_PIN_MAP, HARDWARE_SPECS } from '../config/hardwareMap'
import { Cpu, Terminal, Radio, Usb, Zap, Database, Clock, RefreshCw } from 'lucide-react'

export default function HardwareSetup() {
  const {
    telemetry,
    serialLogs,
    isSerialConnected,
    connectSerial,
    disconnectSerial,
    connectionMode,
  } = useTelemetry()

  return (
    <div className="space-y-6">
      {/* Top Hardware Banner */}
      <div className="rounded-2xl border border-[#262A33] bg-[#181B20] p-5 shadow-lg shadow-black/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
              <Cpu size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-white">
                  ESP32-S3 & ADE7953 Architecture & Pinout
                </h2>
                <span className="rounded bg-[#00F0FF]/15 px-2 py-0.5 text-[10px] font-mono font-bold text-[#00F0FF] border border-[#00F0FF]/30">
                  ESP32-S3-Zero / Mini
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono mt-1">
                Extracted directly from firmware source: <code className="text-gray-300">mp_backup.ino</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono">
            {isSerialConnected ? (
              <button
                type="button"
                onClick={disconnectSerial}
                className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20"
              >
                <Usb size={14} />
                Disconnect COM Port
              </button>
            ) : (
              <button
                type="button"
                onClick={connectSerial}
                className="flex items-center gap-2 rounded-xl border border-[#00F0FF]/40 bg-[#00F0FF]/10 px-3.5 py-2 text-xs font-semibold text-[#00F0FF] hover:bg-[#00F0FF]/20"
              >
                <Usb size={14} />
                Connect ESP32 USB (WebSerial)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hardware Calibration & Constants Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="rounded-xl border border-[#262A33] bg-[#181B20] p-4">
          <span className="text-gray-400 block text-[10px] uppercase">Meter Constant</span>
          <span className="text-xl font-bold text-white block mt-1">
            {HARDWARE_SPECS.meterConstant} <span className="text-xs text-gray-400">imp/kWh</span>
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">BPW34 Pin 7 (5ms debounce)</span>
        </div>

        <div className="rounded-xl border border-[#262A33] bg-[#181B20] p-4">
          <span className="text-gray-400 block text-[10px] uppercase">CT Transformer Ratio</span>
          <span className="text-xl font-bold text-[#00F0FF] block mt-1">
            {HARDWARE_SPECS.ctRatio} : 1
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Burden: {HARDWARE_SPECS.burdenOhms} Ω precision</span>
        </div>

        <div className="rounded-xl border border-[#262A33] bg-[#181B20] p-4">
          <span className="text-gray-400 block text-[10px] uppercase">ADE7953 Voltage Ratio</span>
          <span className="text-xl font-bold text-amber-400 block mt-1">
            {HARDWARE_SPECS.voltageDividerRatio.toFixed(1)} : 1
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">(660.33k + 330) / 330</span>
        </div>

        <div className="rounded-xl border border-[#262A33] bg-[#181B20] p-4">
          <span className="text-gray-400 block text-[10px] uppercase">Calibration Gains</span>
          <span className="text-lg font-bold text-emerald-400 block mt-1">
            I: {HARDWARE_SPECS.calCurrentGain} | V: {HARDWARE_SPECS.calVoltageGain}
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">EMA Alpha: 0.15</span>
        </div>
      </div>

      {/* Pin Mapping Matrix Table */}
      <div className="rounded-2xl border border-[#262A33] bg-[#181B20] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#262A33] pb-3">
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <Cpu size={16} className="text-[#00F0FF]" />
            ESP32-S3 Physical Pin Assignment Matrix
          </h3>
          <span className="text-xs text-gray-400 font-mono">11 Assigned Hardware GPIOs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#262A33] text-gray-400 text-[10px] uppercase">
                <th className="pb-3 font-semibold">GPIO Pin</th>
                <th className="pb-3 font-semibold">Constant Name</th>
                <th className="pb-3 font-semibold">IC / Peripheral</th>
                <th className="pb-3 font-semibold">Bus Protocol</th>
                <th className="pb-3 font-semibold">Functional Description</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262A33]/50">
              {ESP32_PIN_MAP.map((item) => (
                <tr key={item.pin} className="hover:bg-[#0F1115]/50 transition-colors">
                  <td className="py-2.5">
                    <span className="rounded bg-[#0F1115] px-2 py-0.5 font-bold text-[#00F0FF] border border-[#262A33]">
                      GPIO {item.pin}
                    </span>
                  </td>
                  <td className="py-2.5 font-bold text-white">{item.name}</td>
                  <td className="py-2.5 text-gray-300">{item.chip}</td>
                  <td className="py-2.5 text-gray-400">{item.protocol}</td>
                  <td className="py-2.5 text-gray-400 text-[11px] max-w-xs">{item.description}</td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`rounded px-2 py-0.5 text-[9px] font-bold border ${
                        item.status === 'INTERRUPT'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : item.status === 'ACTIVE'
                          ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/30'
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

      {/* Serial Diagnostic Logs Terminal */}
      <div className="rounded-2xl border border-[#262A33] bg-[#0F1115] p-5 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#262A33] pb-2">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-[#00F0FF]" />
            <span className="font-bold text-white">ESP32 Hardware Serial Stream (115200 Baud)</span>
          </div>
          <span className="text-[10px] text-gray-400">
            {isSerialConnected ? 'Connected via WebSerial' : 'Simulator Mode Log'}
          </span>
        </div>

        <div className="h-44 overflow-y-auto space-y-1 bg-[#090A0D] p-3 rounded-xl border border-[#262A33]/80 text-[11px]">
          {serialLogs.map((log, index) => (
            <div key={index} className="text-gray-300 leading-relaxed font-mono">
              <span className="text-[#00F0FF] mr-2">›</span>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

