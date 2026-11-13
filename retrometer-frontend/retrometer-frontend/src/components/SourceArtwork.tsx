import React from 'react'
import type { SourcePresetType } from '../types/telemetry'

interface SourceArtworkProps {
  preset: SourcePresetType
  active?: boolean
  className?: string
  size?: number
}

export const UtilityGridArtwork: React.FC<{ active?: boolean; size?: number; className?: string }> = ({
  active = true,
  size = 120,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 ${className}`}
    >
      <defs>
        <linearGradient id="gridTowerGrad" x1="80" y1="20" x2="80" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={active ? '#38BDF8' : '#64748B'} />
          <stop offset="100%" stopColor={active ? '#0284C7' : '#334155'} />
        </linearGradient>
        <linearGradient id="gridGlowGrad" x1="80" y1="20" x2="80" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity={active ? '0.4' : '0.05'} />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
        </linearGradient>
        <filter id="gridGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background Soft Aura */}
      <circle cx="80" cy="80" r="68" fill="url(#gridGlowGrad)" />

      {/* Horizon / Ground Line */}
      <path d="M20 142H140" stroke={active ? '#0284C7' : '#475569'} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" />

      {/* High Voltage Lines spanning across */}
      <path
        d="M10 52 Q80 72 150 52"
        stroke={active ? '#38BDF8' : '#475569'}
        strokeWidth="1.8"
        fill="none"
        strokeDasharray={active ? '6 3' : 'none'}
        className={active ? 'animate-pulse' : ''}
      />
      <path
        d="M10 74 Q80 94 150 74"
        stroke={active ? '#0ea5e9' : '#334155'}
        strokeWidth="1.8"
        fill="none"
      />

      {/* Lattice Transmission Pylon Tower */}
      {/* Main Legs */}
      <path d="M54 140L72 34H88L106 140" stroke="url(#gridTowerGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Tower Top Spike */}
      <path d="M80 18L80 34" stroke={active ? '#38BDF8' : '#64748B'} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="80" cy="18" r="3" fill={active ? '#38BDF8' : '#94A3B8'} filter={active ? 'url(#gridGlow)' : undefined} />

      {/* Crossarm 1 (Top Upper) */}
      <path d="M46 52H114" stroke="url(#gridTowerGrad)" strokeWidth="3" strokeLinecap="round" />
      <path d="M58 52L80 34L102 52" stroke="url(#gridTowerGrad)" strokeWidth="2" fill="none" />

      {/* Insulator strings top */}
      <line x1="48" y1="52" x2="48" y2="60" stroke={active ? '#F59E0B' : '#64748B'} strokeWidth="3" strokeLinecap="round" />
      <line x1="112" y1="52" x2="112" y2="60" stroke={active ? '#F59E0B' : '#64748B'} strokeWidth="3" strokeLinecap="round" />

      {/* Crossarm 2 (Lower Main) */}
      <path d="M38 74H122" stroke="url(#gridTowerGrad)" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 74L80 52L110 74" stroke="url(#gridTowerGrad)" strokeWidth="2" fill="none" />

      {/* Insulator strings lower */}
      <line x1="40" y1="74" x2="40" y2="84" stroke={active ? '#F59E0B' : '#64748B'} strokeWidth="3" strokeLinecap="round" />
      <line x1="120" y1="74" x2="120" y2="84" stroke={active ? '#F59E0B' : '#64748B'} strokeWidth="3" strokeLinecap="round" />

      {/* Cross Lattice Bracing */}
      <path d="M68 74L92 104" stroke="url(#gridTowerGrad)" strokeWidth="2" />
      <path d="M92 74L68 104" stroke="url(#gridTowerGrad)" strokeWidth="2" />
      <path d="M64 104H96" stroke="url(#gridTowerGrad)" strokeWidth="2.5" />
      <path d="M64 104L100 140" stroke="url(#gridTowerGrad)" strokeWidth="2" />
      <path d="M96 104L60 140" stroke="url(#gridTowerGrad)" strokeWidth="2" />

      {/* High-Voltage Lightning Bolt Crest */}
      <g transform="translate(71, 78) scale(0.9)">
        <polygon
          points="10,0 2,12 8,12 6,22 18,9 11,9"
          fill={active ? '#FBBF24' : '#64748B'}
          filter={active ? 'url(#gridGlow)' : undefined}
        />
      </g>
    </svg>
  )
}

export const SolarPVArtwork: React.FC<{ active?: boolean; size?: number; className?: string }> = ({
  active = true,
  size = 120,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 ${className}`}
    >
      <defs>
        <linearGradient id="solarSunGrad" x1="130" y1="20" x2="130" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={active ? '#FBBF24' : '#64748B'} />
          <stop offset="100%" stopColor={active ? '#F59E0B' : '#475569'} />
        </linearGradient>
        <linearGradient id="panelGrad1" x1="80" y1="65" x2="80" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={active ? '#10B981' : '#475569'} />
          <stop offset="50%" stopColor={active ? '#059669' : '#334155'} />
          <stop offset="100%" stopColor={active ? '#065F46' : '#1E293B'} />
        </linearGradient>
        <linearGradient id="solarGlowGrad" x1="80" y1="80" x2="80" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" stopOpacity={active ? '0.35' : '0.05'} />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
        <filter id="sunGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ambient Glow */}
      <circle cx="80" cy="80" r="68" fill="url(#solarGlowGrad)" />

      {/* Glowing Radiant Sun */}
      <g filter={active ? 'url(#sunGlow)' : undefined}>
        <circle cx="126" cy="36" r="16" fill="url(#solarSunGrad)" />
        {/* Sun Rays */}
        {active && (
          <>
            <line x1="126" y1="12" x2="126" y2="6" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="126" y1="60" x2="126" y2="66" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="102" y1="36" x2="96" y2="36" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="150" y1="36" x2="156" y2="36" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="109" y1="19" x2="105" y2="15" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
            <line x1="143" y1="53" x2="147" y2="57" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
            <line x1="109" y1="53" x2="105" y2="57" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
            <line x1="143" y1="19" x2="147" y2="15" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
      </g>

      {/* Support Structure & Struts */}
      <path d="M34 140L50 90" stroke={active ? '#6EE7B7' : '#475569'} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M126 140L110 90" stroke={active ? '#6EE7B7' : '#475569'} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M80 142L80 95" stroke={active ? '#6EE7B7' : '#475569'} strokeWidth="3" strokeLinecap="round" />
      <path d="M25 142H135" stroke={active ? '#059669' : '#334155'} strokeWidth="2.5" strokeLinecap="round" />

      {/* Angled Solar PV Panel (Perspective Quadrilateral) */}
      <polygon
        points="32,82 128,68 140,126 20,132"
        fill="url(#panelGrad1)"
        stroke={active ? '#34D399' : '#64748B'}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Grid Lines across PV Cells (Perspective lines) */}
      {/* Longitudinal separators */}
      <line x1="56" y1="78" x2="50" y2="130" stroke={active ? '#A7F3D0' : '#64748B'} strokeWidth="1.2" strokeOpacity="0.8" />
      <line x1="80" y1="75" x2="80" y2="129" stroke={active ? '#A7F3D0' : '#64748B'} strokeWidth="1.4" strokeOpacity="0.9" />
      <line x1="104" y1="72" x2="110" y2="128" stroke={active ? '#A7F3D0' : '#64748B'} strokeWidth="1.2" strokeOpacity="0.8" />

      {/* Latitudinal cell dividers */}
      <line x1="28" y1="98" x2="132" y2="87" stroke={active ? '#A7F3D0' : '#64748B'} strokeWidth="1.2" strokeOpacity="0.8" />
      <line x1="24" y1="115" x2="136" y2="106" stroke={active ? '#A7F3D0' : '#64748B'} strokeWidth="1.2" strokeOpacity="0.8" />

      {/* Anti-reflective Glass Specular Glint */}
      {active && (
        <path
          d="M40 86L95 73L75 125L26 128Z"
          fill="#FFFFFF"
          fillOpacity="0.12"
        />
      )}
    </svg>
  )
}

export const DieselGeneratorArtwork: React.FC<{ active?: boolean; size?: number; className?: string }> = ({
  active = true,
  size = 120,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 ${className}`}
    >
      <defs>
        <linearGradient id="dgEnclosureGrad" x1="80" y1="40" x2="80" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={active ? '#F97316' : '#64748B'} />
          <stop offset="60%" stopColor={active ? '#EA580C' : '#475569'} />
          <stop offset="100%" stopColor={active ? '#C2410C' : '#334155'} />
        </linearGradient>
        <linearGradient id="dgGlowGrad" x1="80" y1="80" x2="80" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EA580C" stopOpacity={active ? '0.35' : '0.05'} />
          <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
        </linearGradient>
        <filter id="dgGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Glow Aura */}
      <circle cx="80" cy="80" r="68" fill="url(#dgGlowGrad)" />

      {/* Concrete Vibration Base Pad */}
      <rect x="20" y="132" width="120" height="12" rx="3" fill={active ? '#475569' : '#334155'} stroke={active ? '#64748B' : '#1E293B'} strokeWidth="1.5" />
      <line x1="20" y1="144" x2="140" y2="144" stroke={active ? '#0EA5E9' : '#475569'} strokeWidth="2" strokeDasharray="3 3" />

      {/* Exhaust Silencer Stack & Thermal Muffler */}
      <rect x="34" y="24" width="14" height="28" rx="2" fill={active ? '#78716C' : '#475569'} stroke={active ? '#D6D3D1' : '#64748B'} strokeWidth="2" />
      <path d="M30 24H52" stroke={active ? '#F59E0B' : '#64748B'} strokeWidth="3" strokeLinecap="round" />
      {/* Exhaust Smoke Puffs if active */}
      {active && (
        <g opacity="0.75" className="animate-pulse">
          <circle cx="41" cy="14" r="5" fill="#E2E8F0" opacity="0.6" />
          <circle cx="46" cy="8" r="7" fill="#E2E8F0" opacity="0.4" />
        </g>
      )}

      {/* Main Sound-Attenuated Weatherproof Canopy */}
      <rect
        x="24"
        y="46"
        width="112"
        height="86"
        rx="8"
        fill="url(#dgEnclosureGrad)"
        stroke={active ? '#FDBA74' : '#64748B'}
        strokeWidth="3"
      />

      {/* Radiator Cooling Louver Vents (Left Section) */}
      <g>
        <rect x="32" y="60" width="34" height="60" rx="4" fill="#0F172A" fillOpacity="0.4" stroke={active ? '#FDBA74' : '#64748B'} strokeWidth="1.5" />
        <line x1="36" y1="68" x2="62" y2="68" stroke={active ? '#FED7AA' : '#64748B'} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="36" y1="76" x2="62" y2="76" stroke={active ? '#FED7AA' : '#64748B'} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="36" y1="84" x2="62" y2="84" stroke={active ? '#FED7AA' : '#64748B'} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="36" y1="92" x2="62" y2="92" stroke={active ? '#FED7AA' : '#64748B'} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="36" y1="100" x2="62" y2="100" stroke={active ? '#FED7AA' : '#64748B'} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="36" y1="108" x2="62" y2="108" stroke={active ? '#FED7AA' : '#64748B'} strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Digital Control Panel & Status Display (Right Section) */}
      <rect x="74" y="60" width="54" height="42" rx="4" fill="#0B132B" stroke={active ? '#38BDF8' : '#475569'} strokeWidth="2" />
      
      {/* Screen with simulated frequency sine wave badge */}
      <rect x="78" y="64" width="46" height="22" rx="2" fill="#030712" />
      <path
        d="M80 75 Q85 68 91 75 T102 75 T113 75 T122 75"
        fill="none"
        stroke={active ? '#10B981' : '#475569'}
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* LED Status indicators */}
      <circle cx="82" cy="94" r="3" fill={active ? '#10B981' : '#475569'} filter={active ? 'url(#dgGlow)' : undefined} />
      <circle cx="92" cy="94" r="3" fill={active ? '#F59E0B' : '#475569'} />
      <circle cx="102" cy="94" r="3" fill={active ? '#EF4444' : '#475569'} />

      {/* Emergency Stop Pushbutton */}
      <circle cx="118" cy="94" r="4" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />

      {/* AC Alternator Sine Badge (Lower right) */}
      <rect x="74" y="108" width="54" height="16" rx="3" fill="#1E293B" stroke={active ? '#F97316' : '#475569'} strokeWidth="1" />
      <text x="80" y="120" fontSize="8" fontWeight="bold" fill={active ? '#FED7AA' : '#94A3B8'} fontFamily="monospace">
        50Hz // 3P
      </text>
    </svg>
  )
}

export const BatteryInverterArtwork: React.FC<{ active?: boolean; size?: number; className?: string }> = ({
  active = true,
  size = 120,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 ${className}`}
    >
      <defs>
        <linearGradient id="batteryGrad" x1="80" y1="30" x2="80" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={active ? '#8B5CF6' : '#64748B'} />
          <stop offset="100%" stopColor={active ? '#6D28D9' : '#334155'} />
        </linearGradient>
        <linearGradient id="batteryGlowGrad" x1="80" y1="80" x2="80" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity={active ? '0.35' : '0.05'} />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </linearGradient>
        <filter id="batGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Aura */}
      <circle cx="80" cy="80" r="68" fill="url(#batteryGlowGrad)" />

      {/* Battery Cabinet */}
      <rect
        x="36"
        y="30"
        width="88"
        height="110"
        rx="8"
        fill="url(#batteryGrad)"
        stroke={active ? '#C4B5FD' : '#64748B'}
        strokeWidth="3"
      />

      {/* Terminal Cap Top */}
      <rect x="62" y="22" width="36" height="8" rx="2" fill={active ? '#A78BFA' : '#475569'} stroke={active ? '#DDD6FE' : '#64748B'} strokeWidth="1.5" />
      <circle cx="70" cy="26" r="2" fill="#EF4444" />
      <circle cx="90" cy="26" r="2" fill="#3B82F6" />

      {/* State-Of-Charge (SoC) LED Segments (4 tiers) */}
      <g>
        <rect x="48" y="44" width="64" height="14" rx="3" fill={active ? '#10B981' : '#334155'} stroke={active ? '#34D399' : '#475569'} strokeWidth="1.5" />
        <rect x="48" y="62" width="64" height="14" rx="3" fill={active ? '#10B981' : '#334155'} stroke={active ? '#34D399' : '#475569'} strokeWidth="1.5" />
        <rect x="48" y="80" width="64" height="14" rx="3" fill={active ? '#10B981' : '#334155'} stroke={active ? '#34D399' : '#475569'} strokeWidth="1.5" />
        <rect x="48" y="98" width="64" height="14" rx="3" fill={active ? '#F59E0B' : '#334155'} stroke={active ? '#FBBF24' : '#475569'} strokeWidth="1.5" />
      </g>

      {/* Inverter Status Waveform Display */}
      <rect x="48" y="118" width="64" height="16" rx="3" fill="#0F172A" stroke={active ? '#A78BFA' : '#475569'} strokeWidth="1.5" />
      <path
        d="M54 126 Q60 120 66 126 T78 126 T90 126 T102 126"
        fill="none"
        stroke={active ? '#A78BFA' : '#64748B'}
        strokeWidth="1.8"
      />
      {/* Lightning energy transfer badge */}
      <polygon
        points="83,52 79,64 83,64 81,72 87,60 83,60"
        fill={active ? '#FEF08A' : '#64748B'}
        filter={active ? 'url(#batGlow)' : undefined}
      />
    </svg>
  )
}

export const CustomLoadArtwork: React.FC<{ active?: boolean; size?: number; className?: string }> = ({
  active = true,
  size = 120,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 ${className}`}
    >
      <defs>
        <linearGradient id="customGrad" x1="80" y1="30" x2="80" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={active ? '#06B6D4' : '#64748B'} />
          <stop offset="100%" stopColor={active ? '#0891B2' : '#334155'} />
        </linearGradient>
        <linearGradient id="customGlowGrad" x1="80" y1="80" x2="80" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity={active ? '0.35' : '0.05'} />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
        </linearGradient>
        <filter id="custGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Aura */}
      <circle cx="80" cy="80" r="68" fill="url(#customGlowGrad)" />

      {/* Smart Subpanel / Distribution Box */}
      <rect
        x="32"
        y="30"
        width="96"
        height="110"
        rx="8"
        fill="url(#customGrad)"
        stroke={active ? '#67E8F9' : '#64748B'}
        strokeWidth="3"
      />

      {/* Top Breaker DIN Rail */}
      <rect x="42" y="44" width="76" height="30" rx="4" fill="#0F172A" stroke={active ? '#67E8F9' : '#475569'} strokeWidth="1.5" />
      {/* Circuit Breaker Switches */}
      <rect x="48" y="48" width="10" height="22" rx="2" fill={active ? '#10B981' : '#64748B'} />
      <rect x="62" y="48" width="10" height="22" rx="2" fill={active ? '#10B981' : '#64748B'} />
      <rect x="76" y="48" width="10" height="22" rx="2" fill={active ? '#F59E0B' : '#64748B'} />
      <rect x="90" y="48" width="10" height="22" rx="2" fill={active ? '#10B981' : '#64748B'} />
      <rect x="104" y="48" width="8" height="22" rx="2" fill={active ? '#EF4444' : '#64748B'} />

      {/* Bottom Meter Screen & EV Cable Connector */}
      <rect x="42" y="82" width="76" height="48" rx="4" fill="#082F49" stroke={active ? '#38BDF8' : '#475569'} strokeWidth="1.5" />
      <circle cx="80" cy="106" r="16" fill="#0369A1" stroke={active ? '#38BDF8' : '#475569'} strokeWidth="2" />
      <path d="M74 106L86 106M80 100L80 112" stroke={active ? '#E0F2FE' : '#94A3B8'} strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Status LED */}
      <circle cx="108" cy="92" r="3" fill={active ? '#10B981' : '#64748B'} filter={active ? 'url(#custGlow)' : undefined} />
    </svg>
  )
}

export default function SourceArtwork({ preset, active = true, size = 120, className = '' }: SourceArtworkProps) {
  switch (preset) {
    case 'grid':
      return <UtilityGridArtwork active={active} size={size} className={className} />
    case 'solar':
      return <SolarPVArtwork active={active} size={size} className={className} />
    case 'dg':
      return <DieselGeneratorArtwork active={active} size={size} className={className} />
    case 'battery':
      return <BatteryInverterArtwork active={active} size={size} className={className} />
    case 'custom':
    default:
      return <CustomLoadArtwork active={active} size={size} className={className} />
  }
}

