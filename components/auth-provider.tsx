'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, AuthState } from '@/lib/types'
import { getCurrentUser, setCurrentUser as storeUser, logout as storageLogout } from '@/lib/storage'

interface AuthContextType extends AuthState {
  login: (user: User) => void
  logout: () => void
  updateCurrentUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setAuthState({ user, isAuthenticated: true })
    }
    setIsLoading(false)
  }, [])

  const login = (user: User) => {
    storeUser(user)
    setAuthState({ user, isAuthenticated: true })
  }

  const logout = () => {
    storageLogout()
    setAuthState({ user: null, isAuthenticated: false })
  }

  const updateCurrentUser = (user: User) => {
    storeUser(user)
    setAuthState({ user, isAuthenticated: true })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
