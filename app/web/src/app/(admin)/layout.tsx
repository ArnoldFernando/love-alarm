"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '@/components/layout/AdminLayout'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    console.log('Admin Layout Auth State:', { isAuthenticated, user, userRole: user?.role })
    // Still loading auth state
    if (isAuthenticated === undefined) return

    if (!isAuthenticated) {
      setAuthError('You are not logged in. Redirecting to login...')
      const timer = setTimeout(() => router.push('/login'), 1500)
      return () => clearTimeout(timer)
    }

    if (user && user.role !== 'admin' && user.role !== 'moderator') {
      setAuthError(`Your account role "${user.role}" does not have admin access. Only admin and moderator accounts can access this dashboard.`)
      return
    }

    setIsChecking(false)
  }, [isAuthenticated, user, router])

  // Show error state
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">{authError}</p>
          {!user && (
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    )
  }

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return <AdminLayout>{children}</AdminLayout>
}
