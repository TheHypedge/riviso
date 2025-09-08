'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  createdAt: string
  plan: 'free' | 'pro' | 'enterprise'
  auditsUsed: number
  auditsLimit: number
  role: 'super_admin' | 'admin' | 'manager' | 'user'
}

interface AuditUsageStats {
  usedToday: number
  remainingToday: number | null
  dailyLimit: number
  isUnlimited: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  auditUsage: AuditUsageStats | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => Promise<boolean>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
  refreshAuditUsage: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [auditUsage, setAuditUsage] = useState<AuditUsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Function to refresh audit usage
  const refreshAuditUsage = async () => {
    if (!user) return
    
    try {
      // Try backend API first
      const backendUrls = [
        process.env.NEXT_PUBLIC_BACKEND_URL,
        process.env.NEXT_PUBLIC_RENDER_BACKEND_URL,
        'https://riviso.onrender.com',
        'http://localhost:8000'
      ].filter(Boolean)
      
      const backendUrl = backendUrls[0] || 'https://riviso.onrender.com'
      
      const response = await fetch(`${backendUrl}/audits/usage?user_id=${user.id}`)
      if (response.ok) {
        const usageStats = await response.json()
        setAuditUsage({
          usedToday: usageStats.used_today,
          remainingToday: usageStats.remaining_today,
          dailyLimit: usageStats.daily_limit,
          isUnlimited: false
        })
        return
      }
      
      // Fallback to local API
      const localResponse = await fetch(`/api/audit/usage?userId=${user.id}`)
      if (localResponse.ok) {
        const usageStats = await localResponse.json()
        setAuditUsage(usageStats)
      }
    } catch (error) {
      console.error('Error fetching audit usage:', error)
    }
  }

  // Check for existing authentication on mount
  useEffect(() => {
    console.log('🔐 AuthContext: Checking for stored authentication...')
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    console.log('🔐 AuthContext: Stored token:', storedToken ? 'Present' : 'Not found')
    console.log('🔐 AuthContext: Stored user:', storedUser ? 'Present' : 'Not found')

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log('🔐 AuthContext: Parsed user:', parsedUser)
        setToken(storedToken)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  // Refresh audit usage when user changes
  useEffect(() => {
    if (user) {
      refreshAuditUsage()
    } else {
      setAuditUsage(null)
    }
  }, [user])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log('🔐 AuthContext: Login successful, user data:', data.user)
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        console.log('🔐 AuthContext: User stored in localStorage')
        return true
      } else {
        throw new Error(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const signup = async (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
  }): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        return true
      } else {
        throw new Error(data.message || 'Signup failed')
      }
    } catch (error) {
      console.error('Signup error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const value: AuthContextType = {
    user,
    token,
    auditUsage,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
    refreshAuditUsage
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
