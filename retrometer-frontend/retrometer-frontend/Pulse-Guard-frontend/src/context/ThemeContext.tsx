import React, { createContext, useContext, useState, useEffect } from 'react'

export type ThemeMode = 'dark' | 'light' | 'crimson-peach'

export interface ThemeColors {
  name: ThemeMode
  canvas: string
  card: string
  cardHover: string
  subtle: string
  border: string
  borderLight: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  accentCyan: string
  accentEmerald: string
  accentAmber: string
  accentRose: string
  accentPurple: string
  hoverHighlight: string
  chartGrid: string
  chartText: string
  chartTooltipBg: string
  chartTooltipBorder: string
  gaugeOuterBg: string
  gaugeInnerBg: string
  gaugeCenterBg: string
  isDark: boolean
}

export const THEME_PALETTES: Record<ThemeMode, ThemeColors> = {
  dark: {
    name: 'dark',
    canvas: '#0B1120',
    card: '#1E293B',
    cardHover: '#283548',
    subtle: '#0F172A',
    border: '#334155',
    borderLight: '#475569',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    accentCyan: '#38BDF8',
    accentEmerald: '#10B981',
    accentAmber: '#F59E0B',
    accentRose: '#EF4444',
    accentPurple: '#8B5CF6',
    hoverHighlight: '#0284C7',
    chartGrid: '#334155',
    chartText: '#94A3B8',
    chartTooltipBg: '#1E293B',
    chartTooltipBorder: '#334155',
    gaugeOuterBg: '#334155',
    gaugeInnerBg: '#243044',
    gaugeCenterBg: '#1E293B',
    isDark: true,
  },
  light: {
    name: 'light',
    canvas: '#F8FAFC',
    card: '#FFFFFF',
    cardHover: '#F1F5F9',
    subtle: '#F1F5F9',
    border: '#E2E8F0',
    borderLight: '#CBD5E1',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    accentCyan: '#0284C7',
    accentEmerald: '#059669',
    accentAmber: '#D97706',
    accentRose: '#DC2626',
    accentPurple: '#7C3AED',
    hoverHighlight: '#0369A1',
    chartGrid: '#E2E8F0',
    chartText: '#64748B',
    chartTooltipBg: '#FFFFFF',
    chartTooltipBorder: '#E2E8F0',
    gaugeOuterBg: '#E2E8F0',
    gaugeInnerBg: '#F1F5F9',
    gaugeCenterBg: '#FFFFFF',
    isDark: false,
  },
  'crimson-peach': {
    name: 'crimson-peach',
    canvas: '#E6B794',
    card: '#F2D2B8',
    cardHover: '#EACBB0',
    subtle: '#DFC4AB',
    border: '#CFA07E',
    borderLight: '#B88B6A',
    textPrimary: '#8E2F2E',
    textSecondary: '#5A1D1C',
    textMuted: '#752E2D',
    accentCyan: '#8E2F2E',
    accentEmerald: '#166534',
    accentAmber: '#9A3412',
    accentRose: '#991B1B',
    accentPurple: '#701A75',
    hoverHighlight: '#A84342',
    chartGrid: '#CFA07E',
    chartText: '#5A1D1C',
    chartTooltipBg: '#F2D2B8',
    chartTooltipBorder: '#CFA07E',
    gaugeOuterBg: '#CFA07E',
    gaugeInnerBg: '#DFC4AB',
    gaugeCenterBg: '#F2D2B8',
    isDark: false,
  },
}

// Backward-compatibility alias
;(THEME_PALETTES as any).mild = THEME_PALETTES['crimson-peach']

interface ThemeContextType {
  theme: ThemeMode
  setTheme: (mode: ThemeMode) => void
  colors: ThemeColors
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('retrometer-theme')
      if (saved === 'mild' || saved === 'crimson-peach') {
        return 'crimson-peach'
      }
      if (saved === 'dark' || saved === 'light') {
        return saved as ThemeMode
      }
    }
    return 'dark'
  })

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('retrometer-theme', mode)
    }
  }

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
      // Also update meta theme-color or body class if appropriate
      document.body.style.backgroundColor = THEME_PALETTES[theme].canvas
      document.body.style.color = THEME_PALETTES[theme].textPrimary
    }
  }, [theme])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        colors: THEME_PALETTES[theme] || THEME_PALETTES.dark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

