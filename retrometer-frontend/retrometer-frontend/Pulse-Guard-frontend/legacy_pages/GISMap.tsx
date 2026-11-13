import { useState } from 'react'
import { CircleMarker, MapContainer, Popup, ScaleControl, TileLayer } from 'react-leaflet'
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Gauge,
  MapPin,
  Radio,
  ShieldAlert,
  Zap,
} from 'lucide-react'

type MeterNode = {
  id: string
  name: string
  feeder: string
  position: [number, number]
  status: 'ONLINE' | 'TAMPER_ALERT' | 'STEP_SPIKE' | 'IDLE'
  voltage: number
  ctPower: number
  opticalPower: number
  meterConstant: number
  discrepancy: number
}

const meterNodes: MeterNode[] = [
  {
    id: 'NODE-ESP-01',
    name: 'Sector 4 Industrial Feeder (Active Unit)',
    feeder: '11kV Feeder Line Alpha',
    position: [19.076, 72.877],
    status: 'ONLINE',
    voltage: 231.4,
    ctPower: 985,
    opticalPower: 988,
    meterConstant: 3200,
    discrepancy: 0.3,
  },
  {
    id: 'NODE-ESP-02',
    name: 'Commercial Complex Meter Bank B',
    feeder: '11kV Feeder Line Beta',
    position: [19.112, 72.852],
    status: 'TAMPER_ALERT',
    voltage: 228.1,
    ctPower: 2450,
    opticalPower: 80, // optical pulses bypassed!
    meterConstant: 3200,
    discrepancy: 96.7,
  },
  {
    id: 'NODE-ESP-03',
    name: 'Residential Substation Distribution 7',
    feeder: '415V Phase Distribution',
    position: [19.034, 72.912],
    status: 'STEP_SPIKE',
    voltage: 230.8,
    ctPower: 1850,
    opticalPower: 1845,
    meterConstant: 3200,
    discrepancy: 0.2,
  },
  {
    id: 'NODE-ESP-04',
    name: 'Harbor Warehouse Feeder 9',
    feeder: 'Marine Grid Branch',
    position: [18.965, 72.825],
    status: 'ONLINE',
    voltage: 232.0,
    ctPower: 420,
    opticalPower: 418,
    meterConstant: 3200,
    discrepancy: 0.4,
  },
  {
    id: 'NODE-ESP-05',
    name: 'Auxiliary Water Treatment Station',
    feeder: 'Municipal Grid 3',
    position: [19.185, 72.965],
    status: 'IDLE',
    voltage: 229.5,
    ctPower: 0,
    opticalPower: 0,
    meterConstant: 3200,
    discrepancy: 0.0,
  },
]

const colorForStatus = (status: MeterNode['status']) => {
  switch (status) {
    case 'ONLINE':
      return '#10b981' // emerald
    case 'TAMPER_ALERT':
      return '#e11d48' // rose
    case 'STEP_SPIKE':
      return '#f59e0b' // amber
    case 'IDLE':
      return '#64748b' // slate
  }
}

export default function GISMap() {
  const [selectedNode, setSelectedNode] = useState<MeterNode>(meterNodes[0])

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-7">
      {/* Header */}
      <section className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
            Geospatial Infrastructure
          </p>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">
            Grid Feeders & Smart Meter Map
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Real-time geospatial monitoring of ESP32 pulse meters, distribution feeders, and localized anti-theft flags.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs shadow-2xs">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
            <span className="size-2.5 rounded-full bg-emerald-500" /> Normal Online
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
            <span className="size-2.5 rounded-full bg-rose-600 animate-pulse" /> Tamper / Theft Alert
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
            <span className="size-2.5 rounded-full bg-amber-500" /> Step Spike Load
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
            <span className="size-2.5 rounded-full bg-slate-400" /> Idle Watchdog
          </span>
        </div>
      </section>

      {/* Main Map + Inspector Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Leaflet Map Canvas (2 columns on lg) */}
        <div className="h-[600px] overflow-hidden rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 relative z-0">
          <MapContainer
            center={[19.076, 72.877]}
            zoom={11}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ScaleControl position="bottomleft" />

            {meterNodes.map((node) => (
              <CircleMarker
                key={node.id}
                center={node.position}
                radius={node.status === 'TAMPER_ALERT' ? 12 : 9}
                pathOptions={{
                  color: colorForStatus(node.status),
                  fillColor: colorForStatus(node.status),
                  fillOpacity: 0.85,
                  weight: node.status === 'TAMPER_ALERT' ? 3 : 2,
                }}
                eventHandlers={{
                  click: () => setSelectedNode(node),
                }}
              >
                <Popup>
                  <div className="p-1 font-sans">
                    <p className="font-bold text-xs text-slate-900">{node.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{node.id} • {node.feeder}</p>
                    <div className="mt-2 space-y-0.5 text-[11px] font-mono">
                      <div>Voltage: <strong>{node.voltage} V</strong></div>
                      <div>CT Real Power: <strong>{node.ctPower} W</strong></div>
                      <div>Optical Meter: <strong>{node.opticalPower} W</strong></div>
                      <div className={node.discrepancy > 20 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-semibold'}>
                        Discrepancy: {node.discrepancy}%
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Node Inspector Drawer */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Node Telemetry Inspector
                </span>
                <h3 className="text-lg font-bold text-[#0f172a]">{selectedNode.name}</h3>
                <p className="text-xs font-mono text-slate-500">{selectedNode.id}</p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold font-mono ${
                  selectedNode.status === 'TAMPER_ALERT'
                    ? 'bg-rose-100 text-rose-700 animate-pulse'
                    : selectedNode.status === 'STEP_SPIKE'
                    ? 'bg-amber-100 text-amber-700'
                    : selectedNode.status === 'ONLINE'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {selectedNode.status}
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="mt-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-slate-500">Distribution Feeder</span>
                <span className="font-semibold text-slate-800">{selectedNode.feeder}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-slate-500">Grid Voltage (RMS)</span>
                <span className="font-semibold text-slate-800">{selectedNode.voltage} V</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-slate-500">CT Active Power</span>
                <span className="font-bold text-amber-600">{selectedNode.ctPower} W</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-slate-500">Optical Meter Power</span>
                <span className="font-bold text-emerald-600">{selectedNode.opticalPower} W</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-slate-500">Meter Constant</span>
                <span className="font-semibold text-slate-700">{selectedNode.meterConstant} imp/kWh</span>
              </div>

              <div className={`flex items-center justify-between rounded-xl p-3 border ${
                selectedNode.discrepancy > 20
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <span className="font-medium">Theft Discrepancy</span>
                <span className="font-bold text-sm">{selectedNode.discrepancy}%</span>
              </div>
            </div>

            {/* Tampering Diagnostic Box */}
            {selectedNode.status === 'TAMPER_ALERT' && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-900">
                <div className="flex items-center gap-2 font-bold text-rose-800">
                  <ShieldAlert size={16} />
                  <span>CRITICAL THEFT EVENT DETECTED</span>
                </div>
                <p className="mt-1 text-[11px] text-rose-700 leading-relaxed">
                  CT sensor on Pin D15 registers 2450W of active power, while optical pulse sensor on Pin D5 reports only 80W. Physical bypass bridge or optical sensor blinding suspected.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
            Location: {selectedNode.position[0]}, {selectedNode.position[1]}
          </div>
        </div>
      </div>
    </div>
  )
}
