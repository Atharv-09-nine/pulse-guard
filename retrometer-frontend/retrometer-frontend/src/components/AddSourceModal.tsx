import React, { useState } from 'react'
import type { SourcePresetType } from '../types/telemetry'
import { useTelemetry } from '../context/TelemetryContext'
import { useTheme } from '../context/ThemeContext'
import SourceArtwork from './SourceArtwork'
import { X, Plus, Cpu, Zap, IndianRupee, Sliders, Check } from 'lucide-react'

interface AddSourceModalProps {
  isOpen: boolean
  onClose: () => void
}

const PRESET_OPTIONS: { id: SourcePresetType; label: string; defaultProducer: boolean; desc: string }[] = [
  { id: 'solar', label: 'Rooftop Solar PV', defaultProducer: true, desc: 'Photovoltaic generation array' },
  { id: 'grid', label: 'Utility Grid / Substation', defaultProducer: false, desc: 'Distribution utility supply' },
  { id: 'dg', label: 'Diesel / Gas Generator', defaultProducer: true, desc: 'Auxiliary backup genset' },
  { id: 'battery', label: 'Battery / Hybrid Inverter', defaultProducer: true, desc: 'Energy storage system' },
  { id: 'custom', label: 'Dedicated Heavy Load / Subpanel', defaultProducer: false, desc: 'EV Charger, Heat Pump, AC bank' },
]

export default function AddSourceModal({ isOpen, onClose }: AddSourceModalProps) {
  const { addSource, sources } = useTelemetry()
  const { colors } = useTheme()

  const [name, setName] = useState('')
  const [preset, setPreset] = useState<SourcePresetType>('solar')
  const [ctChannel, setCtChannel] = useState<number>(() => {
    // Pick the first unused CT channel between 1 and 16
    const used = sources.map((s) => s.ctChannel)
    for (let i = 1; i <= 16; i++) {
      if (!used.includes(i)) return i
    }
    return 4
  })
  const [isProducer, setIsProducer] = useState(true)
  const [current, setCurrent] = useState('4.5')
  const [powerFactor, setPowerFactor] = useState('0.95')
  const [tariffRate, setTariffRate] = useState('6.50')
  const [calMultiplier, setCalMultiplier] = useState('1.000')

  if (!isOpen) return null

  const handlePresetSelect = (selectedPreset: SourcePresetType) => {
    setPreset(selectedPreset)
    const opt = PRESET_OPTIONS.find((p) => p.id === selectedPreset)
    if (opt) {
      setIsProducer(opt.defaultProducer)
      if (!name || PRESET_OPTIONS.some((p) => p.label === name)) {
        setName(opt.label)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const sourceName = name.trim() || `${preset.toUpperCase()} CT-${ctChannel}`
    addSource({
      name: sourceName,
      preset,
      ctChannel,
      isProducer,
      current: parseFloat(current) || 3.5,
      powerFactor: parseFloat(powerFactor) || 0.95,
      tariffRate: parseFloat(tariffRate) || 6.5,
      calMultiplier: parseFloat(calMultiplier) || 1.0,
    })
    onClose()
  }

  const usedChannels = sources.map((s) => s.ctChannel)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.textPrimary,
        }}
        className="relative w-full max-w-xl rounded-2xl border shadow-2xl p-6 font-mono transition-colors duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-2.5">
            <div
              style={{
                backgroundColor: `${colors.accentEmerald}20`,
                borderColor: `${colors.accentEmerald}40`,
                color: colors.accentEmerald,
              }}
              className="size-9 rounded-xl border flex items-center justify-center"
            >
              <Plus size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: colors.textPrimary }}>
                Add Multi-CT Energy Source
              </h2>
              <p className="text-xs" style={{ color: colors.textMuted }}>
                Assign SCT-013 current sensor to CD74HC4067 multiplexer channel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-500/20 transition-colors"
            style={{ color: colors.textMuted }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Preset Selector with Artwork Preview */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.textSecondary }}>
              Select Source Preset & Artwork
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_OPTIONS.map((opt) => {
                const isSelected = preset === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handlePresetSelect(opt.id)}
                    style={{
                      backgroundColor: isSelected ? `${colors.accentEmerald}15` : colors.canvas,
                      borderColor: isSelected ? colors.accentEmerald : colors.border,
                    }}
                    className="p-2.5 rounded-xl border flex flex-col items-center text-center transition-all hover:scale-[1.02]"
                  >
                    <div className="size-14 flex items-center justify-center">
                      <SourceArtwork preset={opt.id} active={isSelected} size={54} />
                    </div>
                    <span className="text-xs font-bold mt-1" style={{ color: isSelected ? colors.accentEmerald : colors.textPrimary }}>
                      {opt.label}
                    </span>
                    <span className="text-[10px]" style={{ color: colors.textMuted }}>
                      {opt.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Name & CT Channel Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: colors.textSecondary }}>
                Source Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Solar Array 2 / EV Charger"
                required
                style={{
                  backgroundColor: colors.canvas,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
                className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: colors.textSecondary }}>
                CT Channel (CD74HC4067 Mux)
              </label>
              <select
                value={ctChannel}
                onChange={(e) => setCtChannel(Number(e.target.value))}
                style={{
                  backgroundColor: colors.canvas,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
                className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              >
                {Array.from({ length: 16 }, (_, i) => i + 1).map((ch) => {
                  const isAssigned = usedChannels.includes(ch)
                  return (
                    <option key={ch} value={ch}>
                      CT-{ch} {isAssigned ? '(Currently In Use)' : '(Available)'}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          {/* Source Type / Producer Mode */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsProducer(true)}
              style={{
                backgroundColor: isProducer ? `${colors.accentEmerald}20` : colors.canvas,
                borderColor: isProducer ? colors.accentEmerald : colors.border,
                color: isProducer ? colors.accentEmerald : colors.textMuted,
              }}
              className="py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Zap size={14} />
              <span>Generation (Producer)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsProducer(false)}
              style={{
                backgroundColor: !isProducer ? `${colors.accentCyan}20` : colors.canvas,
                borderColor: !isProducer ? colors.accentCyan : colors.border,
                color: !isProducer ? colors.accentCyan : colors.textMuted,
              }}
              className="py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Cpu size={14} />
              <span>Consumption (Load)</span>
            </button>
          </div>

          {/* Secondary Metrology Parameters: Current, PF, Tariff, Gain */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1" style={{ color: colors.textMuted }}>
                Nominal Current (A)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                style={{
                  backgroundColor: colors.canvas,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold mb-1" style={{ color: colors.textMuted }}>
                Power Factor (cos φ)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="1.0"
                value={powerFactor}
                onChange={(e) => setPowerFactor(e.target.value)}
                style={{
                  backgroundColor: colors.canvas,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold mb-1" style={{ color: colors.textMuted }}>
                Tariff (₹/kWh)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={tariffRate}
                onChange={(e) => setTariffRate(e.target.value)}
                style={{
                  backgroundColor: colors.canvas,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold mb-1" style={{ color: colors.textMuted }}>
                Gain Ki_ph
              </label>
              <input
                type="number"
                step="0.001"
                min="0.5"
                max="2.0"
                value={calMultiplier}
                onChange={(e) => setCalMultiplier(e.target.value)}
                style={{
                  backgroundColor: colors.canvas,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border focus:outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: colors.border }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                borderColor: colors.border,
                color: colors.textMuted,
              }}
              className="px-4 py-2 rounded-xl border text-xs font-bold hover:bg-slate-500/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: colors.accentEmerald,
                color: '#FFFFFF',
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus size={14} />
              <span>Add Energy Source</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

