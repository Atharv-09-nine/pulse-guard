import { Zap, DollarSign, ShieldCheck, X, Radio, Lock } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navItems } from './navItems'
import { useTelemetry } from '../context/TelemetryContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

type SidebarProps = {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { telemetry, isPulseBlinking } = useTelemetry()
  const { user } = useAuth()
  const { colors } = useTheme()

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.textPrimary,
        }}
        className={`fixed inset-y-0 left-0 z-40 flex w-68 flex-col border-r transition-transform duration-200 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Brand Header */}
        <div
          style={{ borderColor: colors.border }}
          className="flex h-20 items-center justify-between border-b px-6"
        >
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3.5 group"
          >
            <div
              style={{
                backgroundColor: colors.subtle,
                borderColor: colors.border,
              }}
              className="relative flex size-10 items-center justify-center rounded-xl border shadow-md transition-all duration-300"
            >
              <Zap size={20} style={{ color: colors.accentCyan }} className="group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span
                  style={{ backgroundColor: colors.accentEmerald }}
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                />
                <span
                  style={{ backgroundColor: colors.accentEmerald }}
                  className="relative inline-flex rounded-full h-2.5 w-2.5"
                />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[17px] font-black tracking-wider font-mono">
                  Retro<span style={{ color: colors.accentCyan }}>Meter</span>
                </span>
                <span
                  style={{
                    backgroundColor: colors.subtle,
                    color: colors.textSecondary,
                    borderColor: colors.border,
                  }}
                  className="rounded px-1.5 py-0.5 text-[9px] font-bold font-mono border"
                >
                  v2.0
                </span>
              </div>
              <span style={{ color: colors.textMuted }} className="block text-[10px] font-medium tracking-widest uppercase">
                Smart Metrology
              </span>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            style={{ color: colors.textSecondary }}
            className="rounded-lg p-2 hover:opacity-80 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs (3 Consumer Tabs) */}
        <div className="px-3.5 pt-6 flex-1 overflow-y-auto space-y-6">
          <div>
            <p style={{ color: colors.textMuted }} className="mb-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.2em]">
              Consumer Portal
            </p>

            <nav className="space-y-1.5">
              {navItems.map(({ to, label, tabIndex, icon: Icon, badge, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? colors.subtle : 'transparent',
                    borderColor: isActive ? colors.accentCyan : 'transparent',
                    color: isActive ? colors.textPrimary : colors.textSecondary,
                  })}
                  className={({ isActive }) =>
                    `group relative flex items-center justify-between rounded-xl px-3.5 py-3 text-[13px] font-medium transition-all duration-200 border ${
                      isActive ? 'font-semibold shadow-xs' : 'hover:opacity-90'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            backgroundColor: isActive ? `${colors.accentCyan}20` : colors.subtle,
                            color: isActive ? colors.accentCyan : colors.textSecondary,
                            borderColor: isActive ? `${colors.accentCyan}40` : colors.border,
                          }}
                          className="flex size-8 items-center justify-center rounded-lg border transition-colors"
                        >
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{label}</span>
                          </div>
                          <span style={{ color: colors.textMuted }} className="text-[10px] font-mono block">
                            Tab 0{tabIndex}
                          </span>
                        </div>
                      </div>

                      {badge && (
                        <span
                          style={{
                            backgroundColor: `${colors.accentEmerald}15`,
                            color: colors.accentEmerald,
                            borderColor: `${colors.accentEmerald}30`,
                          }}
                          className="rounded px-1.5 py-0.5 text-[9px] font-bold font-mono tracking-wider border"
                        >
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Consumer Meter Health Quick Pill */}
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="rounded-xl border p-3.5 space-y-3 font-mono text-xs"
          >
            <div className="flex items-center justify-between">
              <span style={{ color: colors.textPrimary }} className="text-[11px] font-semibold flex items-center gap-1.5">
                <Radio size={13} style={{ color: colors.accentEmerald }} /> Meter Status
              </span>
              <span
                style={{
                  backgroundColor: `${colors.accentEmerald}15`,
                  color: colors.accentEmerald,
                  borderColor: `${colors.accentEmerald}30`,
                }}
                className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border"
              >
                <span className="size-1.5 rounded-full bg-current animate-pulse" />
                ONLINE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
                className="rounded-lg p-2 border"
              >
                <span style={{ color: colors.textMuted }} className="text-[9px] block uppercase">Constant</span>
                <span className="font-bold">{telemetry.meterConstant} <span style={{ color: colors.textMuted }} className="text-[9px]">imp/kWh</span></span>
              </div>
              <div
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
                className="rounded-lg p-2 border"
              >
                <span style={{ color: colors.textMuted }} className="text-[9px] block uppercase">Integrity</span>
                <span style={{ color: colors.accentEmerald }} className="font-bold">Verified</span>
              </div>
            </div>

            <div
              style={{ borderColor: colors.border }}
              className="flex items-center justify-between pt-1 border-t text-[11px]"
            >
              <span style={{ color: colors.textSecondary }} className="flex items-center gap-1">
                <span
                  className={`size-2.5 rounded-full transition-all duration-100 border ${
                    isPulseBlinking
                      ? 'bg-[#10B981] border-[#34D399] shadow-[0_0_12px_#10B981]'
                      : 'bg-emerald-950/60 border-emerald-800'
                  }`}
                />
                Optical Pulses
              </span>
              <span style={{ color: colors.textPrimary }} className="font-mono text-[10px] font-bold">
                {telemetry.pulseCount}
              </span>
            </div>
          </div>
        </div>

        {/* Consumer User Footer */}
        <div
          style={{
            backgroundColor: colors.subtle,
            borderColor: colors.border,
          }}
          className="border-t p-4 font-mono"
        >
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold truncate">{user?.name || 'Consumer User'}</span>
            <span style={{ color: colors.textMuted }} className="text-[10px]">{user?.meterId || 'RM-3200-S3'}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px]" style={{ color: colors.textMuted }}>
            <span>RTC DS1302</span>
            <span style={{ color: colors.textSecondary }}>{telemetry.rtcTime.split(' ')[1] || '20:30:00'}</span>
          </div>
        </div>
      </aside>
    </>
  )
}
