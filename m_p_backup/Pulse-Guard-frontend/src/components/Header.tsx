import { Bell, Menu, RotateCcw, Usb, Zap } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { navItems } from './navItems'
import { useTelemetry } from '../context/TelemetryContext'

type HeaderProps = {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useLocation()
  const {
    telemetry,
    isWebSerialSupported,
    isSerialConnected,
    hasReceivedData,
    lastPacketTime,
    connectSerial,
    disconnectSerial,
    sendSerialResetCommand,
  } = useTelemetry()

  const current =
    navItems.find((item) =>
      item.end ? pathname === item.to : pathname.startsWith(item.to),
    ) ?? navItems[0]

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="flex min-h-[88px] items-center justify-between gap-3 px-4 sm:gap-5 sm:px-6">
        {/* Left: Mobile menu & Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <Menu size={19} strokeWidth={1.75} />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-[#0f172a] sm:text-xl">
              {current.title}
            </h1>
            <p className="mt-0.5 hidden truncate text-xs text-slate-500 sm:block">
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Right Controls: Hardware Connection, Hold Status, Reset Command */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Status Badge */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold">
            {isSerialConnected ? (
              <div className="flex items-center gap-2 text-emerald-800">
                <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>ESP32 Connected: {hasReceivedData ? 'Receiving Real Data' : 'Waiting for Bytes...'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-600">
                <span className="size-2 rounded-full bg-amber-500" />
                <span>{hasReceivedData ? 'Holding Previous ESP32 Values' : 'No Communication (Ready to Connect)'}</span>
              </div>
            )}
          </div>

          {/* Reset 'R' Command Button */}
          <button
            type="button"
            onClick={() => sendSerialResetCommand()}
            title="Send 'R' Serial Reset Command to ESP32 (Flushes Optical Circular Buffer)"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
          >
            <RotateCcw size={14} className="text-amber-600" />
            <span className="hidden md:inline">Reset Buffer</span>
            <kbd className="hidden lg:inline rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
              'R'
            </kbd>
          </button>

          {/* WebSerial Connect Button */}
          {isWebSerialSupported && (
            <button
              type="button"
              onClick={isSerialConnected ? disconnectSerial : connectSerial}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
                isSerialConnected
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
              }`}
            >
              <Usb size={14} />
              <span>
                {isSerialConnected ? 'Disconnect ESP32' : 'Connect ESP32 USB'}
              </span>
            </button>
          )}

          {/* Live Status Pill */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono">
            <span className="relative flex size-2.5">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                  isSerialConnected && hasReceivedData
                    ? 'bg-emerald-400'
                    : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex size-2.5 rounded-full ${
                  isSerialConnected && hasReceivedData
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="text-slate-700 hidden sm:inline">
              {isSerialConnected ? 'ESP32 LIVE' : 'HOLD STATE'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
