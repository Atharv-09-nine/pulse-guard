import React, { useState } from 'react'
import { useTelemetry } from '../context/TelemetryContext'
import { useTheme } from '../context/ThemeContext'
import { Lock, X, ShieldAlert, KeyRound, Eye, EyeOff } from 'lucide-react'

export default function AdminPasscodeModal() {
  const { isAdminModalOpen, setIsAdminModalOpen, unlockAdmin } = useTelemetry()
  const { colors } = useTheme()

  const [passcode, setPasscode] = useState('')
  const [showPasscode, setShowPasscode] = useState(false)
  const [error, setError] = useState(false)

  if (!isAdminModalOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = unlockAdmin(passcode)
    if (!success) {
      setError(true)
    } else {
      setPasscode('')
      setError(false)
    }
  }

  const handleClose = () => {
    setIsAdminModalOpen(false)
    setPasscode('')
    setError(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.textPrimary,
        }}
        className="relative w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-2xl font-mono transition-colors duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          style={{ color: colors.textSecondary }}
          className="absolute top-5 right-5 rounded-lg p-2 hover:opacity-80 transition-opacity"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div
            style={{
              backgroundColor: `${colors.accentAmber}15`,
              borderColor: `${colors.accentAmber}30`,
              color: colors.accentAmber,
            }}
            className="size-12 rounded-2xl border flex items-center justify-center"
          >
            <Lock size={24} />
          </div>
          <div>
            <h3 style={{ color: colors.textPrimary }} className="text-base font-bold">
              Admin Metrology Lock 🔒
            </h3>
            <p style={{ color: colors.textMuted }} className="text-xs mt-0.5">
              Enter engineering passcode to access hardware calibrations & simulator.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-xs text-rose-500 flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>Invalid Passcode. Access Denied.</span>
          </div>
        )}

        {/* Passcode Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label style={{ color: colors.textSecondary }} className="text-[11px] block mb-1.5 font-semibold">
              Authorized Passcode
            </label>
            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                placeholder="Enter passcode..."
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value)
                  setError(false)
                }}
                autoFocus
                style={{
                  backgroundColor: colors.subtle,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
                className="w-full rounded-xl border pl-10 pr-10 py-3 placeholder-gray-500 focus:outline-none focus:border-amber-400 text-sm transition-colors"
              />
              <KeyRound size={17} className="absolute left-3.5 top-3.5 text-gray-500" />
              <button
                type="button"
                onClick={() => setShowPasscode((p) => !p)}
                className="absolute right-3.5 top-3.5 text-gray-500 hover:text-gray-300"
              >
                {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Subtle Test Hint */}
            <span style={{ color: colors.textMuted }} className="text-[10px] block mt-1.5">
              Testing Hint: Default passcode is <strong className="text-amber-500">admin1234</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              style={{
                backgroundColor: colors.subtle,
                borderColor: colors.border,
                color: colors.textSecondary,
              }}
              className="flex-1 rounded-xl border py-2.5 text-xs font-semibold hover:opacity-80 transition-opacity"
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: colors.name === 'crimson-peach' ? colors.accentCyan : '#F59E0B',
                color: '#FFFFFF',
              }}
              className="flex-1 rounded-xl py-2.5 text-xs font-bold hover:opacity-90 shadow-lg active:scale-[0.99] transition-all"
            >
              Unlock Config 🔓
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

