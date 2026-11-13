import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTelemetry } from '../context/TelemetryContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ThemeSelector from '../components/ThemeSelector'
import { Lock, Unlock, ShieldAlert, Cpu, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { unlockAdmin, isAdminUnlocked } = useTelemetry()
  const { login } = useAuth()
  const { colors } = useTheme()

  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    const trimmed = password.trim()
    const success = unlockAdmin(trimmed)
    if (success) {
      setSuccessMsg('Admin access verified! Redirecting to Metrology Console...')
      // Also ensure consumer session is active
      login('admin@retrometer.internal', trimmed)
      setTimeout(() => {
        navigate('/dashboard')
      }, 600)
    } else {
      setErrorMsg('Invalid Admin Passcode. Default: "admin"')
    }
  }

  return (
    <div
      style={{
        backgroundColor: colors.canvas,
        color: colors.textPrimary,
      }}
      className="min-h-screen w-full flex items-center justify-center p-4 font-mono select-none transition-colors duration-200"
    >
      <div className="absolute top-5 right-5">
        <ThemeSelector align="right" />
      </div>

      <div
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.textPrimary,
        }}
        className="w-full max-w-md rounded-2xl border p-8 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <div
            style={{
              backgroundColor: `${colors.accentAmber}20`,
              borderColor: `${colors.accentAmber}40`,
              color: colors.accentAmber,
            }}
            className="size-14 rounded-2xl border mx-auto flex items-center justify-center shadow-inner"
          >
            <Lock size={28} />
          </div>
          <h2 className="text-xl font-black tracking-tight" style={{ color: colors.textPrimary }}>
            Admin Metrology Login
          </h2>
          <p style={{ color: colors.textMuted }} className="text-xs">
            Enter authorized passcode to access hardware calibration, Wi-Fi endpoints, and test injection.
          </p>
        </div>

        <form onSubmit={handleAdminUnlock} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold mb-1.5" style={{ color: colors.textSecondary }}>
              Admin Passcode
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter "admin"'
              autoFocus
              style={{
                backgroundColor: colors.canvas,
                borderColor: colors.border,
                color: colors.textPrimary,
              }}
              className="w-full px-4 py-3 rounded-xl border text-sm font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <span style={{ color: colors.textMuted }} className="text-[10px] block mt-1">
              Authorized Passcode: <code className="text-amber-500 font-bold">admin</code>
            </span>
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={14} />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            style={{
              backgroundColor: colors.accentAmber,
              color: '#000000',
            }}
            className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <span>Unlock Admin Console</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div className="border-t pt-4 text-center" style={{ borderColor: colors.border }}>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            style={{ color: colors.textMuted }}
            className="text-xs hover:underline"
          >
            ← Return to Consumer Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

