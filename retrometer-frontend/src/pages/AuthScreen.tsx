import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ThemeSelector from '../components/ThemeSelector'
import {
  Zap,
  ShieldCheck,
  Radio,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Eye,
  EyeOff,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react'

export default function AuthScreen() {
  const { login, quickDemoLogin, showSplash, dismissSplash } = useAuth()
  const { colors, theme } = useTheme()

  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [consumerName, setConsumerName] = useState('')
  const [meterId, setMeterId] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) {
      setErrorMsg('Please enter your Meter ID or Registered Email.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      login(identifier, password)
      setLoading(false)
    }, 400)
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim() || !meterId.trim()) {
      setErrorMsg('Please enter your Email and Utility Meter ID.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      login(meterId, password)
      setLoading(false)
    }, 400)
  }

  return (
    <div
      style={{
        backgroundColor: colors.canvas,
        color: colors.textPrimary,
      }}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans select-none transition-colors duration-200"
    >
      {/* Theme Selector in the top-right corner */}
      <div className="absolute top-5 right-5 z-40">
        <ThemeSelector align="right" />
      </div>

      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: colors.accentEmerald }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: colors.accentCyan }}
      />

      {/* Grid backdrop overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${colors.accentCyan} 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* 1. SONAR-GUARD SPLASH SCREEN (2.2s on initial load) */}
      {showSplash && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B1120] transition-opacity duration-700">
          <div className="relative flex items-center justify-center size-80">
            {/* 3 Concentric Expanding Sonar/Radar Pulse Rings in Emerald & Cyan */}
            <div className="absolute inset-0 rounded-full border-2 border-[#10B981] animate-sonar-1" />
            <div className="absolute inset-0 rounded-full border-2 border-[#38BDF8] animate-sonar-2" />
            <div className="absolute inset-0 rounded-full border-2 border-[#10B981] animate-sonar-3" />

            {/* Sweeping Radar Scan Line */}
            <div className="absolute inset-2 rounded-full border border-gray-700/40 overflow-hidden">
              <div
                className="absolute inset-0 origin-center animate-radar-sweep pointer-events-none"
                style={{
                  background:
                    'conic-gradient(from 0deg at 50% 50%, rgba(16, 185, 129, 0.4) 0deg, rgba(56, 189, 248, 0.15) 60deg, transparent 90deg, transparent 360deg)',
                }}
              />
            </div>

            {/* Central Glowing Optical Meter Icon */}
            <div className="relative z-10 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#181B20] via-[#0F1115] to-[#1F242C] border border-[#38BDF8]/40 shadow-[0_0_35px_rgba(16,185,129,0.35)]">
              <Zap size={36} className="text-[#38BDF8] drop-shadow-[0_0_12px_#38BDF8]" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981]" />
              </span>
            </div>
          </div>

          {/* Sonar Status Text */}
          <div className="mt-8 flex flex-col items-center text-center space-y-2">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#38BDF8] uppercase">
                RETROMETER // DUAL-DOMAIN METROLOGY
              </span>
            </div>
            <p className="text-[11px] font-mono text-gray-400">
              Synchronizing ADE7953 True-RMS & 3200 imp/kWh Optical Subsystems...
            </p>
          </div>

          <button
            type="button"
            onClick={dismissSplash}
            className="absolute bottom-8 text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors"
          >
            Skip Intro →
          </button>
        </div>
      )}

      {/* 2. CONSUMER LOGIN & SIGN-UP GATE */}
      <div className="relative z-10 w-full max-w-md px-4 py-8 animate-in fade-in zoom-in-95 duration-500">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="inline-flex items-center justify-center size-14 rounded-2xl border shadow-xl mb-3"
          >
            <Zap size={28} style={{ color: colors.accentCyan }} />
          </div>
          <h1 className="text-2xl font-black font-mono tracking-wider">
            Retro<span style={{ color: colors.accentCyan }}>Meter</span>
          </h1>
          <p style={{ color: colors.textSecondary }} className="text-xs font-mono mt-1">
            Consumer Smart Energy Portal · 3200 imp/kWh Precision
          </p>
        </div>

        {/* Glassmorphic Auth Card */}
        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
          className="rounded-3xl border backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6 transition-colors duration-200"
        >
          {/* Consumer Sign In / Sign Up Tabs */}
          <div
            style={{
              backgroundColor: colors.subtle,
              borderColor: colors.border,
            }}
            className="flex rounded-xl p-1 border font-mono text-xs"
          >
            <button
              type="button"
              onClick={() => {
                setAuthTab('signin')
                setErrorMsg('')
              }}
              style={{
                backgroundColor: authTab === 'signin' ? colors.accentCyan : 'transparent',
                color: authTab === 'signin' ? '#FFFFFF' : colors.textSecondary,
              }}
              className="flex-1 rounded-lg py-2 font-semibold transition-all shadow-xs"
            >
              Consumer Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab('signup')
                setErrorMsg('')
              }}
              style={{
                backgroundColor: authTab === 'signup' ? colors.accentCyan : 'transparent',
                color: authTab === 'signup' ? '#FFFFFF' : colors.textSecondary,
              }}
              className="flex-1 rounded-lg py-2 font-semibold transition-all shadow-xs"
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Login 1-Click Button */}
          <button
            type="button"
            onClick={quickDemoLogin}
            style={{
              backgroundColor: `${colors.accentEmerald}15`,
              borderColor: colors.accentEmerald,
              color: colors.accentEmerald,
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-mono font-bold hover:shadow-lg transition-all group"
          >
            <Sparkles size={16} className="group-hover:scale-110 transition-transform" />
            <span>⚡ Quick Consumer Demo (1-Click Preview)</span>
          </button>

          <div
            style={{ color: colors.textMuted }}
            className="flex items-center gap-3 font-mono text-[10px]"
          >
            <div style={{ backgroundColor: colors.border }} className="h-px flex-1" />
            <span>OR ENTER CREDENTIALS</span>
            <div style={{ backgroundColor: colors.border }} className="h-px flex-1" />
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 p-2.5 text-xs font-mono text-rose-500">
              {errorMsg}
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={authTab === 'signin' ? handleSignIn : handleSignUp}
            className="space-y-4 font-mono text-xs"
          >
            {authTab === 'signup' && (
              <div>
                <label style={{ color: colors.textSecondary }} className="text-[11px] block mb-1">
                  Consumer Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Atharv Sharma"
                  value={consumerName}
                  onChange={(e) => setConsumerName(e.target.value)}
                  style={{
                    backgroundColor: colors.subtle,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                  className="w-full rounded-xl border px-3.5 py-2.5 placeholder-gray-400 focus:outline-none transition-colors"
                />
              </div>
            )}

            {authTab === 'signup' && (
              <div>
                <label style={{ color: colors.textSecondary }} className="text-[11px] block mb-1">
                  Utility Meter ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. RM-3200-S3"
                  value={meterId}
                  onChange={(e) => setMeterId(e.target.value)}
                  style={{
                    backgroundColor: colors.subtle,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                  className="w-full rounded-xl border px-3.5 py-2.5 placeholder-gray-400 focus:outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <label style={{ color: colors.textSecondary }} className="text-[11px] block mb-1">
                {authTab === 'signin' ? 'Meter ID or Registered Email' : 'Email Address'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={authTab === 'signin' ? 'RM-3200-S3 or consumer@domain.com' : 'consumer@domain.com'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  style={{
                    backgroundColor: colors.subtle,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                  className="w-full rounded-xl border pl-10 pr-3.5 py-2.5 placeholder-gray-400 focus:outline-none transition-colors"
                />
                <Mail size={16} className="absolute left-3.5 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label style={{ color: colors.textSecondary }} className="text-[11px]">Password</label>
                {authTab === 'signin' && (
                  <button
                    type="button"
                    onClick={() => alert('Demo password is any text, or click "Quick Consumer Demo" above!')}
                    style={{ color: colors.accentCyan }}
                    className="text-[10px] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    backgroundColor: colors.subtle,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                  className="w-full rounded-xl border pl-10 pr-10 py-2.5 placeholder-gray-400 focus:outline-none transition-colors"
                />
                <Lock size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:opacity-80"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: colors.accentCyan,
                color: '#FFFFFF',
              }}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-mono text-xs font-bold shadow-lg hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>{authTab === 'signin' ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Security & Discom badge */}
          <div
            style={{ borderColor: colors.border }}
            className="pt-2 border-t flex items-center justify-between text-[10px] font-mono"
          >
            <span style={{ color: colors.accentEmerald }} className="flex items-center gap-1 font-semibold">
              <ShieldCheck size={13} /> Encrypted Session
            </span>
            <span style={{ color: colors.textMuted }}>Standard Residential LT-1</span>
          </div>
        </div>

        <p style={{ color: colors.textMuted }} className="text-center text-[11px] font-mono mt-6">
          RetroMeter Node · ESP32-S3 Metrology System
        </p>
      </div>
    </div>
  )
}
