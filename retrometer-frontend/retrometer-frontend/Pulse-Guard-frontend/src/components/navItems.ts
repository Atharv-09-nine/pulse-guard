import {
  Zap,
  DollarSign,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  to: string
  label: string
  tabIndex: number
  title: string
  subtitle: string
  icon: LucideIcon
  badge?: string
  end?: boolean
}

export const navItems: NavItem[] = [
  {
    to: '/dashboard',
    label: 'My Energy (Live)',
    tabIndex: 1,
    title: 'Live Household Power & Concentric Vector',
    subtitle: 'Real-time active load, today’s cost, optical pulse rate & appliance breakdown',
    icon: Zap,
    badge: 'LIVE',
    end: true,
  },
  {
    to: '/dashboard/usage',
    label: 'Usage & Bills',
    tabIndex: 2,
    title: 'Energy Consumption & Bill Forecast',
    subtitle: 'Month, week, hourly & 15-min demand profile with Time-of-Use rates',
    icon: DollarSign,
  },
  {
    to: '/dashboard/security',
    label: 'Security & Health',
    tabIndex: 3,
    title: 'Meter Integrity & Grid Health',
    subtitle: 'Optical-electrical alignment verification, grid voltage stability & security seals',
    icon: ShieldCheck,
    badge: 'VERIFIED',
  },
]
