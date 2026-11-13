import { Activity, Gauge, Sparkles, X, Zap, Cpu } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navItems } from './navItems'
import { useTelemetry } from '../context/TelemetryContext'

type SidebarProps = {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { telemetry, settings } = useTelemetry()

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Brand */}
        <div className="flex h-[88px] items-center justify-between border-b border-slate-100 px-6">
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 group"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-500 text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Zap size={22} className="fill-white" />
            </span>

            <div>
              <span className="block text-[17px] font-bold tracking-tight text-[#0f172a] leading-tight">
                PulseGuard
              </span>
              <span className="block text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                Grid & Optical AI
              </span>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <X size={19} strokeWidth={1.75} />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-4 pt-6 flex-1 overflow-y-auto">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Telemetry Systems
          </p>

          <nav className="space-y-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? 'text-amber-600'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }
                      strokeWidth={isActive ? 2 : 1.75}
                    />
                    <span>{label}</span>
                    {isActive && (
                      <span className="absolute right-2.5 size-1.5 rounded-full bg-amber-500" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Firmware & Hardware Module Box */}
          <div className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <Cpu size={14} className="text-amber-600" />
              <span>ESP32 Firmware Pinout</span>
            </div>

            <div className="mt-3 space-y-1.5 text-[11px] text-slate-500 font-mono">
              <div className="flex items-center justify-between">
                <span>D2 (ADC2_CH2)</span>
                <span className="font-semibold text-slate-700">ZMPT101B</span>
              </div>
              <div className="flex items-center justify-between">
                <span>D15 (ADC2_CH3)</span>
                <span className="font-semibold text-slate-700">SCT-013 CT</span>
              </div>
              <div className="flex items-center justify-between">
                <span>D5 (IRQ Falling)</span>
                <span className="font-semibold text-slate-700">Optical Pin</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Lockout Debounce</span>
                <span className="font-semibold text-slate-700">35 ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Metrics Badge */}
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl bg-slate-900 p-3.5 text-white">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Meter Const</span>
              <span className="text-amber-400 font-semibold">{settings.meterConstant} imp/kWh</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xs text-slate-300">Certified Energy:</span>
              <span className="font-mono text-sm font-bold text-white">
                {telemetry.certifiedEnergyKWh.toFixed(4)} <span className="text-[10px] text-slate-400">kWh</span>
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between text-xs text-slate-400">
              <span>Pulses Logged:</span>
              <span className="font-mono font-medium text-amber-300">#{telemetry.pulseCount}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
