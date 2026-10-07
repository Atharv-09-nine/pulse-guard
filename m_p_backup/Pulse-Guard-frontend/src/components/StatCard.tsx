import { motion } from 'framer-motion'
import {
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

export type StatTone = 'neutral' | 'good' | 'warn' | 'critical' | 'electric'

const tones: Record<StatTone, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  good: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  warn: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  critical: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 animate-pulse',
  electric: 'bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/30',
}

const borderAccents: Record<StatTone, string> = {
  neutral: 'from-slate-400 via-slate-200 to-transparent',
  good: 'from-emerald-500 via-teal-400 to-transparent',
  warn: 'from-amber-500 via-orange-400 to-transparent',
  critical: 'from-rose-600 via-red-400 to-transparent',
  electric: 'from-amber-500 via-yellow-400 to-transparent',
}

type StatCardProps = {
  label: string
  value: string
  subValue?: string
  delta?: string
  trend?: 'up' | 'down'
  icon: LucideIcon
  tone?: StatTone
  badge?: string
}

export default function StatCard({
  label,
  value,
  subValue,
  delta,
  trend = 'up',
  icon: Icon,
  tone = 'neutral',
  badge,
}: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/[0.04] sm:p-6"
    >
      {/* Dynamic top gradient bar */}
      <div
        className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${borderAccents[tone]} opacity-80`}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>
          {badge && (
            <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600">
              {badge}
            </span>
          )}
        </div>

        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          <Icon size={19} strokeWidth={1.8} />
        </span>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <p className="text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-[32px] font-mono">
          {value}
        </p>
        {subValue && (
          <span className="text-xs font-medium text-slate-500">
            {subValue}
          </span>
        )}
      </div>

      {delta && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span
            className={`flex size-5 items-center justify-center rounded-full ${
              trend === 'up'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-600'
            }`}
          >
            <TrendIcon size={12} strokeWidth={2.25} />
          </span>

          <p
            className={`text-xs font-medium ${
              tone === 'critical'
                ? 'text-rose-600'
                : trend === 'up'
                ? 'text-emerald-700'
                : 'text-slate-600'
            }`}
          >
            {delta}
          </p>
        </div>
      )}
    </motion.div>
  )
}
