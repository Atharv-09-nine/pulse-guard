import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import { TelemetryProvider } from './context/TelemetryContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import AuthScreen from './pages/AuthScreen'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const UsageTariffs = lazy(() => import('./pages/UsageTariffs'))
const SecurityHealth = lazy(() => import('./pages/SecurityHealth'))

function PageFallback() {
  return (
    <div className="flex h-96 items-center justify-center font-mono text-xs text-gray-400">
      <div className="flex items-center gap-3 rounded-xl border border-[#262A33] bg-[#181B20] px-4 py-3 shadow-lg">
        <span className="size-2 rounded-full bg-[#38BDF8] animate-ping" />
        <span>Loading RetroMeter Metrology Stream...</span>
      </div>
    </div>
  )
}

function MainRoutes() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <AuthScreen />
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="usage" element={<UsageTariffs />} />
        <Route path="security" element={<SecurityHealth />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TelemetryProvider>
          <Suspense fallback={<PageFallback />}>
            <MainRoutes />
          </Suspense>
        </TelemetryProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
