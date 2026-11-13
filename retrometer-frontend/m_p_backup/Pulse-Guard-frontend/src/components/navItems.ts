import {
  Activity,
  Cpu,
  FileCheck2,
  Gauge,
  LayoutDashboard,
  MapPin,
  Sliders,
  Waves,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  to: string
  label: string
  title: string
  subtitle: string
  icon: LucideIcon
  end?: boolean
}

export const navItems: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Overview',
    title: 'AC Grid & Optical Telemetry',
    subtitle: 'Live real-time stream from ZMPT101B, SCT-013, and Optical Pulse Engine',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/dashboard/waveform',
    label: 'Waveform Scope',
    title: '800-Sample Waveform Oscilloscope',
    subtitle: 'Synchronous ADC capture, zero-crossing, DC bias offset & power factor',
    icon: Activity,
  },
  {
    to: '/dashboard/map',
    label: 'Grid GIS Map',
    title: 'Geospatial Grid & Meter Map',
    subtitle: 'Feeder topology, substation nodes and localized power theft alerts',
    icon: MapPin,
  },
  {
    to: '/dashboard/calibration',
    label: 'ESP32 & Calibration',
    title: 'Hardware Tuning & Step Simulator',
    subtitle: 'Sensor calibration factors, 25% step test engine & WebSerial stream',
    icon: Sliders,
  },
  {
    to: '/dashboard/reports',
    label: 'Energy Audit',
    title: 'Discrepancy & Anti-Theft Reports',
    subtitle: 'Certified meter energy vs CT power integration and audit event logs',
    icon: FileCheck2,
  },
]
