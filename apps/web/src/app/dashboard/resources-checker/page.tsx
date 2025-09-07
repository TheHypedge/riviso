'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { GlobalSearchProvider } from '@/contexts/GlobalSearchContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import ResourcesChecker from '@/components/tools/ResourcesChecker'

export default function ResourcesCheckerPage() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Track page view
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: 'Resources Checker',
        page_location: window.location.href,
        custom_parameter_1: 'seo_tool'
      })
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <ProtectedRoute>
      <GlobalSearchProvider>
        <DashboardLayout user={user} logout={logout}>
          <ResourcesChecker />
        </DashboardLayout>
      </GlobalSearchProvider>
    </ProtectedRoute>
  )
}
