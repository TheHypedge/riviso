'use client'

import { useAuth } from '@/contexts/AuthContext'
import { GlobalSearchProvider } from '@/contexts/GlobalSearchContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import DashboardOverview from '@/components/DashboardOverview'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <ProtectedRoute>
      <GlobalSearchProvider>
        <DashboardLayout user={user} logout={logout}>
          <DashboardOverview />
        </DashboardLayout>
      </GlobalSearchProvider>
    </ProtectedRoute>
  )
}