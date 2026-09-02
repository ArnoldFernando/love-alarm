import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import type { LoginCredentials, AuthResponse } from '@/types'

export function useAuth() {
  const router = useRouter()
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore()

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const response = await api.post<{ data: AuthResponse }>('/auth/login', credentials)
        const { user, token } = response.data.data
        setAuth(user, token)
        return { success: true, user }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Login failed'
        return { success: false, error: message }
      }
    },
    [setAuth]
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuth()

      // Clear React Query cache
      queryClient.clear()

      // Clear localStorage
      localStorage.clear()

      // Force a hard page reload to clear all caches
      window.location.href = '/login'
    }
  }, [clearAuth, queryClient, router])

  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return false
    }
    return true
  }, [isAuthenticated, router])

  const requireAdmin = useCallback(() => {
    if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'moderator')) {
      router.push('/login')
      return false
    }
    return true
  }, [isAuthenticated, user, router])

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    requireAuth,
    requireAdmin,
  }
}
