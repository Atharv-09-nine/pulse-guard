import { Menu, Lock, Unlock, LogOut, Radio, Zap, ShieldCheck } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { navItems } from './navItems'
import { useTelemetry } from '../context/TelemetryContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ThemeSelector from './ThemeSelector'

type HeaderProps = {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useLocation()
  const {
    telemetry,
    isPulseBlinking,
    isAdminUnlocked,
    setIsAdminModalOpen,
    setIsAdminDrawerOpen,
    lockAdmin,
  } = useTelemetry()

  const { user, logout } = useAuth()
  const { colors } = useTheme()

  const current =
    navItems.find((item) =>
      item.end ? pathname === item.to : pathname.startsWith(item.to),
    ) ?? navItems[0]

  return (
    <header
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        color: colors.textPrimary,
      }}
      className="sticky top-0 z-20 border-b backdrop-blur-md transition-colors duration-200"
    >
      <div className="flex min-h-[74px] items-center justify-between gap-3 px-4 sm:gap-5 sm:px-6">
        {/* Left: Mobile menu & Tab title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
              color: colors.textSecondary,
            }}
            className="rounded-xl border p-2 hover:opacity-80 transition-opacity lg:hidden"
          >
            <Menu size={18} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  backgroundColor: `${colors.accentCyan}20`,
                  color: colors.accentCyan,
                  borderColor: `${colors.accentCyan}40`,
                }}
                className="rounded px-2 py-0.5 text-[10px] font-bold font-mono border"
              >
                TAB 0{current.tabIndex}
              </span>
              <h1 className="text-base sm:text-lg font-bold tracking-tight font-mono">
                {current.title}
              </h1>
            </div>
            <p style={{ color: colors.textMuted }} className="mt-0.5 hidden text-xs sm:block">
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Optical blinker, Consumer Meter, Theme Selector, Admin Lock, Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Optical Pulse Blinker Badge */}
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-mono"
          >
            <span
              className={`size-2.5 rounded-full transition-all duration-75 ${
                isPulseBlinking
                  ? 'bg-[#10B981] shadow-[0_0_12px_#10B981] scale-125'
                  : 'bg-emerald-950/60 border border-emerald-800'
              }`}
            />
            <span className="hidden sm:inline" style={{ color: colors.textSecondary }}>
              Pulse: <strong style={{ color: colors.textPrimary }}>{telemetry.pulseIntervalMs}ms</strong>
            </span>
            <span className="sm:hidden" style={{ color: colors.textSecondary }}>
              <strong style={{ color: colors.textPrimary }}>{telemetry.pulseIntervalMs}ms</strong>
            </span>
          </div>

          {/* Consumer Meter Badge */}
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="hidden xl:flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-mono"
          >
            <span style={{ color: colors.textMuted }}>Meter:</span>
            <span className="font-bold">{user?.meterId || 'RM-3200-S3'}</span>
          </div>

          {/* THEME SELECTOR POPOVER TRIGGER */}
          <ThemeSelector align="right" />

          {/* SUBTLE ADMIN CONFIG LOCK BUTTON */}
          {isAdminUnlocked ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsAdminDrawerOpen(true)}
                title="Open Unlocked Admin Configuration Console"
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-mono font-bold text-amber-500 hover:bg-amber-500/20 transition-all"
              >
                <Unlock size={13} />
                <span>Admin Config</span>
              </button>
              <button
                type="button"
                onClick={lockAdmin}
                title="Lock Admin Mode"
                style={{ backgroundColor: colors.subtle }}
                className="rounded-xl border border-rose-500/30 p-1.5 text-rose-500 hover:bg-rose-500/20 transition-all"
              >
                <Lock size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(true)}
              title="Enter Passcode to Access Hardware & Calibration Settings"
              style={{
                backgroundColor: colors.subtle,
                borderColor: colors.border,
                color: colors.textSecondary,
              }}
              className="flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-mono hover:text-amber-500 hover:border-amber-500/40 transition-all"
            >
              <Lock size={12} className="text-gray-400" />
              <span className="hidden sm:inline">Admin Config 🔒</span>
              <span className="sm:hidden">Admin 🔒</span>
            </button>
          )}

          {/* Consumer Sign Out */}
          <button
            type="button"
            onClick={logout}
            title="Sign out of consumer portal"
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
              color: colors.textSecondary,
            }}
            className="flex items-center gap-1 rounded-xl border p-2 hover:text-rose-500 hover:border-rose-500/40 transition-all"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}
