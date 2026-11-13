import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Gauge,
  Radio,
  ShieldAlert,
  Zap,
} from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()
  const [exiting, setExiting] = useState(false)

  // Auto transition after 5 seconds or allow instant click
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setExiting(true)
    }, 6000)

    return () => window.clearTimeout(timer)
  }, [])

  const handleEnter = () => {
    setExiting(true)
  }

  return (
    <motion.main
      initial={{ opacity: 1, scale: 1 }}
      animate={
        exiting
          ? {
              opacity: 0,
              scale: 1.03,
              filter: 'blur(8px)',
            }
          : {
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
            }
      }
      transition={{
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1],
      }}
      onAnimationComplete={() => {
        if (exiting) {
          navigate('/dashboard', { replace: true })
        }
      }}
      className="relative min-h-screen min-h-[100svh] overflow-hidden bg-[#070b14] text-white flex flex-col justify-between"
    >
      {/* Background glow and electrical grid effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 size-[600px] rounded-full bg-amber-500/10 blur-[130px]" />
        <div className="absolute -bottom-40 -left-40 size-[600px] rounded-full bg-blue-600/10 blur-[130px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-12">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20">
            <Zap size={22} className="fill-slate-950" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg sm:text-xl text-white">
              PulseGuard
            </span>
            <span className="ml-2.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-amber-300">
              v1.0.4 FIRMWARE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">ADC2 800-PTS @ 100μs</span>
          </span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:inline">3200 imp/kWh CAL</span>
        </div>
      </header>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12 text-center sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-800/50 px-4 py-1.5 text-xs text-slate-300 backdrop-blur-md mb-8"
        >
          <Radio size={14} className="text-amber-400 animate-pulse" />
          <span>Synchronous AC Grid Monitor & Fast-Tracking Optical Meter Engine</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-7xl"
        >
          Intelligent Telemetry for <br />
          <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200 bg-clip-text text-transparent">
            Smart Grids & Metering
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-base text-slate-400 sm:text-lg"
        >
          Coupling ZMPT101B voltage, SCT-013 current, and high-frequency optical pulse
          interruption with an instant &gt;25% step recovery engine to defeat phase lag and detect tampering.
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 flex flex-wrap justify-center gap-3 text-xs"
        >
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-slate-300 backdrop-blur-sm">
            <Cpu size={15} className="text-amber-400" />
            <span>ESP32 12-Bit ADC (11dB Atten)</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-slate-300 backdrop-blur-sm">
            <Activity size={15} className="text-emerald-400" />
            <span>50-Sample Fast Step Flush (&gt;25%)</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-slate-300 backdrop-blur-sm">
            <ShieldAlert size={15} className="text-rose-400" />
            <span>Real-time Bypass & Theft Detection</span>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            type="button"
            onClick={handleEnter}
            className="group flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-sm font-bold text-slate-950 shadow-xl shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-amber-500 hover:scale-[1.02] cursor-pointer"
          >
            <span>Launch Live Dashboard</span>
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </button>

          <span className="text-xs text-slate-500">
            Auto-launching in a few seconds...
          </span>
        </motion.div>
      </div>

      {/* Bottom Technical Spec Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/60 px-6 py-5 sm:px-12 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-6">
            <span>VOLTAGE_CAL: <strong className="text-amber-300">781.33</strong></span>
            <span>CT_CAL: <strong className="text-amber-300">133.33</strong></span>
            <span>METER_CONST: <strong className="text-amber-300">3200 imp/kWh</strong></span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Pin D2: ZMPT101B</span>
            <span>•</span>
            <span>Pin D15: SCT-013</span>
            <span>•</span>
            <span>Pin D5: Optical IRQ</span>
          </div>
        </div>
      </footer>
    </motion.main>
  )
}
