import React, { useState, useRef, useEffect } from 'react'
import { useTheme, type ThemeMode } from '../context/ThemeContext'
import { Palette, Check, Moon, Sun, Flame, Feather, X } from 'lucide-react'

interface ThemeSelectorProps {
  align?: 'right' | 'left'
  compact?: boolean
}

export default function ThemeSelector({ align = 'right', compact = false }: ThemeSelectorProps) {
  const { theme, setTheme, colors } = useTheme()
  const [open, setOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const themes: {
    id: ThemeMode
    name: string
    subtitle: string
    icon: any
    canvasColor: string
    cardColor: string
    borderColor: string
    textColor: string
    accent1: string
    accent2: string
    tag: string
  }[] = [
    {
      id: 'sage',
      name: 'Soft Sage',
      subtitle: 'Warm sand paper & muted sage-teal',
      icon: Feather,
      canvasColor: '#F3F1EC',
      cardColor: '#FAF9F5',
      borderColor: '#E2DDD3',
      textColor: '#292524',
      accent1: '#2E7D6B',
      accent2: '#3B7A9E',
      tag: 'Soft Sage',
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      subtitle: 'Deep obsidian slate & neon metrology',
      icon: Moon,
      canvasColor: '#0B1120',
      cardColor: '#1E293B',
      borderColor: '#334155',
      textColor: '#F8FAFC',
      accent1: '#10B981',
      accent2: '#38BDF8',
      tag: 'Dark',
    },
    {
      id: 'light',
      name: 'Light Mode',
      subtitle: 'Clean daylight UI & high-contrast slate',
      icon: Sun,
      canvasColor: '#F8FAFC',
      cardColor: '#FFFFFF',
      borderColor: '#E2E8F0',
      textColor: '#0F172A',
      accent1: '#059669',
      accent2: '#0284C7',
      tag: 'Daylight',
    },
    {
      id: 'crimson-peach',
      name: 'Crimson Peach',
      subtitle: 'Warm peach canvas & deep rich crimson',
      icon: Flame,
      canvasColor: '#E6B794',
      cardColor: '#F2D2B8',
      borderColor: '#CFA07E',
      textColor: '#8E2F2E',
      accent1: '#8E2F2E',
      accent2: '#A84342',
      tag: 'Editorial',
    },
  ]

  const activeThemeColor =
    theme === 'sage'
      ? '#2E7D6B'
      : theme === 'dark'
      ? '#38BDF8'
      : theme === 'light'
      ? '#0284C7'
      : '#8E2F2E'

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger Button: Theme 🎨 */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title="Change App Visual Theme (Soft Sage, Dark, Light, Crimson Peach)"
        style={{
          backgroundColor: colors.subtle,
          borderColor: colors.border,
          color: colors.textPrimary,
        }}
        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-mono font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm ${
          open ? 'ring-2 ring-emerald-500/40' : ''
        }`}
      >
        <Palette size={14} style={{ color: colors.accentCyan }} />
        <span className="font-bold">Theme 🎨</span>
        <span
          className="size-2 rounded-full border border-black/20"
          style={{
            backgroundColor: activeThemeColor,
          }}
        />
      </button>

      {/* Popover Window */}
      {open && (
        <div
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textPrimary,
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)',
          }}
          className={`absolute z-50 mt-2 w-80 rounded-2xl border p-4 font-mono text-xs transition-all animate-in fade-in zoom-in-95 duration-150 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {/* Header */}
          <div
            style={{ borderColor: colors.border }}
            className="flex items-center justify-between border-b pb-3 mb-3"
          >
            <div className="flex items-center gap-2">
              <Palette size={15} style={{ color: colors.accentCyan }} />
              <span className="font-bold text-sm">Theme Selector</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ color: colors.textSecondary }}
              className="rounded-lg p-1 hover:opacity-80 transition-opacity"
            >
              <X size={15} />
            </button>
          </div>

          <p style={{ color: colors.textMuted }} className="text-[11px] mb-3">
            Select a comfort theme for live meters and diagnostic dashboards:
          </p>

          {/* 3 Live Swatch Cards */}
          <div className="space-y-2.5">
            {themes.map((t) => {
              const isSelected = theme === t.id
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id)
                    setOpen(false)
                  }}
                  style={{
                    backgroundColor: isSelected ? t.canvasColor : t.cardColor,
                    borderColor: isSelected ? t.accent1 : t.borderColor,
                    color: t.textColor,
                  }}
                  className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition-all hover:scale-[1.02] active:scale-[0.99] group ${
                    isSelected
                      ? 'shadow-md ring-2 ring-current/30 font-bold'
                      : 'hover:border-current/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Swatch Preview Pill */}
                    <div
                      style={{
                        backgroundColor: t.canvasColor,
                        borderColor: t.borderColor,
                      }}
                      className="size-10 rounded-xl border flex items-center justify-center relative overflow-hidden shadow-inner shrink-0"
                    >
                      <Icon size={18} style={{ color: t.accent1 }} />
                      <div className="absolute bottom-1 right-1 flex gap-0.5">
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: t.accent1 }}
                        />
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: t.accent2 }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{t.name}</span>
                        <span
                          style={{
                            backgroundColor: `${t.accent1}20`,
                            color: t.accent1,
                            borderColor: `${t.accent1}40`,
                          }}
                          className="rounded px-1.5 py-0.2 text-[9px] font-bold border"
                        >
                          {t.tag}
                        </span>
                      </div>
                      <span
                        style={{ color: t.textColor, opacity: 0.8 }}
                        className="text-[10px] block mt-0.5"
                      >
                        {t.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Active Indicator Checkmark */}
                  {isSelected && (
                    <div
                      style={{
                        backgroundColor: t.accent1,
                        color: t.id === 'crimson-peach' ? '#F2D2B8' : '#FFFFFF',
                      }}
                      className="size-5 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                    >
                      <Check size={13} strokeWidth={3} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Persist indicator */}
          <div
            style={{ borderColor: colors.border, color: colors.textMuted }}
            className="mt-3 pt-2.5 border-t text-[10px] text-center flex items-center justify-between"
          >
            <span>Preference: LocalStorage</span>
            <span style={{ color: colors.accentEmerald }} className="font-bold">
              Auto-Synced
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

