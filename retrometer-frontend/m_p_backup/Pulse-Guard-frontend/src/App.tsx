import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'
import { TelemetryProvider } from './context/TelemetryContext'

const WaveformScope = lazy(() => import('./pages/WaveformScope'))
const GISMap = lazy(() => import('./pages/GISMap'))
const Calibration = lazy(() => import('./pages/Calibration'))
const Reports = lazy(() => import('./pages/Reports'))

function PageFallback() {
  return (
    <div className="flex h-64 items-center justify-center text-xs font-mono text-slate-400">
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-amber-500 animate-ping" />
        <span>Syncing telemetry stream...</span>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <TelemetryProvider>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="waveform" element={<WaveformScope />} />
            <Route path="map" element={<GISMap />} />
            <Route path="calibration" element={<Calibration />} />
            <Route path="reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </TelemetryProvider>
  )
}
