import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import AdminPasscodeModal from '../components/AdminPasscodeModal'
import AdminConfigDrawer from '../components/AdminConfigDrawer'
import { useTheme } from '../context/ThemeContext'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { colors } = useTheme()

  return (
    <div
      style={{
        backgroundColor: colors.canvas,
        color: colors.textPrimary,
      }}
      className="min-h-screen transition-colors duration-200"
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-68 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 xl:px-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Admin Passcode Modal & Configuration Drawer */}
      <AdminPasscodeModal />
      <AdminConfigDrawer />
    </div>
  )
}
