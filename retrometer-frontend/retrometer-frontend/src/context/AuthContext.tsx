import React, { createContext, useContext, useState, useEffect } from 'react'

export interface ConsumerUser {
  name: string
  meterId: string
  email: string
  address: string
  tariffCategory: string
  sanctionedLoadKw: number
  accountNumber: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: ConsumerUser | null
  login: (meterIdOrEmail: string, pass: string) => boolean
  quickDemoLogin: () => void
  logout: () => void
  showSplash: boolean
  dismissSplash: () => void
}

const DEMO_USER: ConsumerUser = {
  name: 'Atharv Sharma',
  meterId: 'RM-3200-S3',
  email: 'atharv@retrometer.io',
  address: 'Plot 42, Green Glen Layout, Bengaluru 560103',
  tariffCategory: 'LT-1 Domestic (Subsidized)',
  sanctionedLoadKw: 5.0,
  accountNumber: 'DISCOM-KA-90821-44',
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showSplash, setShowSplash] = useState<boolean>(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('retrometer_auth') === 'true'
  })
  const [user, setUser] = useState<ConsumerUser | null>(() => {
    const saved = sessionStorage.getItem('retrometer_user')
    return saved ? JSON.parse(saved) : null
  })

  // 2.2s Splash Timer on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2200)
    return () => clearTimeout(timer)
  }, [])

  const dismissSplash = () => {
    setShowSplash(false)
  }

  const login = (meterIdOrEmail: string, _pass: string) => {
    const u: ConsumerUser = {
      ...DEMO_USER,
      meterId: meterIdOrEmail.includes('@') ? 'RM-3200-S3' : meterIdOrEmail.toUpperCase(),
      email: meterIdOrEmail.includes('@') ? meterIdOrEmail : DEMO_USER.email,
    }
    setUser(u)
    setIsAuthenticated(true)
    sessionStorage.setItem('retrometer_auth', 'true')
    sessionStorage.setItem('retrometer_user', JSON.stringify(u))
    return true
  }

  const quickDemoLogin = () => {
    setUser(DEMO_USER)
    setIsAuthenticated(true)
    sessionStorage.setItem('retrometer_auth', 'true')
    sessionStorage.setItem('retrometer_user', JSON.stringify(DEMO_USER))
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    sessionStorage.removeItem('retrometer_auth')
    sessionStorage.removeItem('retrometer_user')
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        quickDemoLogin,
        logout,
        showSplash,
        dismissSplash,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

