import { useState } from 'react'
import {
  Download,
  FileCheck2,
  Filter,
  Search,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useTelemetry } from '../context/TelemetryContext'

interface AuditEvent {
  id: string
  timestamp: string
  feeder: string
  vRMS: number
  iRMS: number
  ctPower: number
  meterPower: number
  discrepancy: number
  type: 'NORMAL_CYCLE' | 'STEP_FLUSH' | 'THEFT_ALERT' | 'IDLE_TIMEOUT'
  severity: 'NORMAL' | 'NOTICE' | 'CRITICAL'
}

const mockEvents: AuditEvent[] = [
  {
    id: 'EVT-9041',
    timestamp: '22:24:18',
    feeder: 'Feeder Alpha-4',
    vRMS: 231.4,
    iRMS: 4.52,
    ctPower: 985,
    meterPower: 988,
    discrepancy: 0.3,
    type: 'NORMAL_CYCLE',
    severity: 'NORMAL',
  },
  {
    id: 'EVT-9040',
    timestamp: '22:22:05',
    feeder: 'Feeder Beta-2',
    vRMS: 228.1,
    iRMS: 11.2,
    ctPower: 2450,
    meterPower: 80,
    discrepancy: 96.7,
    type: 'THEFT_ALERT',
    severity: 'CRITICAL',
  },
  {
    id: 'EVT-9039',
    timestamp: '22:18:42',
    feeder: 'Residential-7',
    vRMS: 230.8,
    iRMS: 8.4,
    ctPower: 1850,
    meterPower: 1845,
    discrepancy: 0.2,
    type: 'STEP_FLUSH',
    severity: 'NOTICE',
  },
  {
    id: 'EVT-9038',
    timestamp: '22:15:11',
    feeder: 'Industrial-1',
    vRMS: 232.0,
    iRMS: 1.9,
    ctPower: 420,
    meterPower: 418,
    discrepancy: 0.4,
    type: 'NORMAL_CYCLE',
    severity: 'NORMAL',
  },
  {
    id: 'EVT-9037',
    timestamp: '22:09:55',
    feeder: 'Station-Aux-3',
    vRMS: 229.5,
    iRMS: 0.0,
    ctPower: 0,
    meterPower: 0,
    discrepancy: 0.0,
    type: 'IDLE_TIMEOUT',
    severity: 'NORMAL',
  },
  {
    id: 'EVT-9036',
    timestamp: '22:04:12',
    feeder: 'Feeder Beta-2',
    vRMS: 227.4,
    iRMS: 10.9,
    ctPower: 2380,
    meterPower: 75,
    discrepancy: 96.8,
    type: 'THEFT_ALERT',
    severity: 'CRITICAL',
  },
]

export default function Reports() {
  const { telemetry } = useTelemetry()
  const [filterType, setFilterType] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEvents = mockEvents.filter((ev) => {
    if (filterType !== 'ALL' && ev.severity !== filterType) return false
    if (searchQuery && !ev.id.toLowerCase().includes(searchQuery.toLowerCase()) && !ev.feeder.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  const exportCSV = () => {
    const headers = ['Event ID', 'Timestamp', 'Feeder', 'V_RMS (V)', 'I_RMS (A)', 'CT_Power (W)', 'Meter_Power (W)', 'Discrepancy (%)', 'Type', 'Severity']
    const rows = filteredEvents.map((e) => [e.id, e.timestamp, e.feeder, e.vRMS, e.iRMS, e.ctPower, e.meterPower, e.discrepancy, e.type, e.severity])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `pulseguard_audit_report_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-7">
      {/* Page Header */}
      <section className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Compliance & Verification Logs
          </p>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">
            Energy Audit & Anti-Theft Reports
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Historical comparison records between direct CT load measurements and optical meter pulse certifications.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all cursor-pointer"
        >
          <Download size={15} />
          <span>Export Audit Log (CSV)</span>
        </button>
      </section>

      {/* Summary KPI row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Metered Energy
          </span>
          <p className="mt-2 font-mono text-2xl font-bold text-[#0f172a]">
            {telemetry.certifiedEnergyKWh.toFixed(4)} <span className="text-xs font-normal text-slate-500">kWh</span>
          </p>
          <span className="mt-1 block text-xs text-emerald-600">Certified by 3200 imp/kWh</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Integrated CT Energy
          </span>
          <p className="mt-2 font-mono text-2xl font-bold text-[#0f172a]">
            {telemetry.ctEnergyKWh.toFixed(4)} <span className="text-xs font-normal text-slate-500">kWh</span>
          </p>
          <span className="mt-1 block text-xs text-slate-500">Active power integral</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Flagged Theft Events
          </span>
          <p className="mt-2 font-mono text-2xl font-bold text-rose-600">
            2 <span className="text-xs font-normal text-slate-500">Incidents</span>
          </p>
          <span className="mt-1 block text-xs text-rose-600">Feeder Beta-2 Bypass Detected</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Average Discrepancy
          </span>
          <p className="mt-2 font-mono text-2xl font-bold text-[#0f172a]">
            0.32%
          </p>
          <span className="mt-1 block text-xs text-emerald-600">Within ±1.5% utility margin</span>
        </div>
      </section>

      {/* Audit Log Table */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search event ID or feeder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs text-slate-900 outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter size={14} className="text-slate-400 mr-1" />
            {['ALL', 'CRITICAL', 'NOTICE', 'NORMAL'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setFilterType(lvl)}
                className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                  filterType === lvl
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] text-slate-500 uppercase tracking-wider font-sans">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Feeder Line</th>
                <th className="py-3 px-4">V_RMS</th>
                <th className="py-3 px-4">I_RMS</th>
                <th className="py-3 px-4">CT Power</th>
                <th className="py-3 px-4">Optical Meter</th>
                <th className="py-3 px-4">Discrepancy</th>
                <th className="py-3 px-4">Engine Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{evt.id}</td>
                  <td className="py-3.5 px-4 text-slate-500">{evt.timestamp}</td>
                  <td className="py-3.5 px-4 font-sans font-medium text-slate-800">{evt.feeder}</td>
                  <td className="py-3.5 px-4 text-slate-700">{evt.vRMS} V</td>
                  <td className="py-3.5 px-4 text-slate-700">{evt.iRMS} A</td>
                  <td className="py-3.5 px-4 font-bold text-amber-600">{evt.ctPower} W</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">{evt.meterPower} W</td>
                  <td className="py-3.5 px-4">
                    <span className={evt.discrepancy > 20 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                      {evt.discrepancy}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold font-sans ${
                        evt.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-700'
                          : evt.severity === 'NOTICE'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {evt.type === 'THEFT_ALERT' && <ShieldAlert size={12} />}
                      {evt.type === 'STEP_FLUSH' && <Zap size={12} />}
                      <span>{evt.type.replace('_', ' ')}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
