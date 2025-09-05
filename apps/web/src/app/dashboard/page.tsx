'use client'

import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { useState, useEffect } from 'react'

interface Audit {
  id: string
  userId: string
  url: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  completedAt?: string
  score?: number
  device?: 'mobile' | 'desktop'
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchUserAudits()
    }
  }, [user])

  const fetchUserAudits = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/auth/audits?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setAudits(data.audits || [])
      }
    } catch (error) {
      console.error('Error fetching user audits:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <ProtectedRoute>
      <DashboardLayout 
        user={user}
        logout={logout}
      />
    </ProtectedRoute>
  )
}