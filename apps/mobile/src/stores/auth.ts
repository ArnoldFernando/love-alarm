import { create } from "zustand"
import * as SecureStore from "expo-secure-store"

interface User {
  id: string
  email?: string
  role: string
  account_status: string
  profile?: {
    username: string
    display_name: string
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: User, token: string) => Promise<void>
  clearAuth: () => Promise<void>
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: async (user, token) => {
    await SecureStore.setItemAsync("token", token)
    set({ user, token, isAuthenticated: true, isLoading: false })
  },
  clearAuth: async () => {
    await SecureStore.deleteItemAsync("token")
    set({ user: null, token: null, isAuthenticated: false, isLoading: false })
  },
  hydrate: async () => {
    const token = await SecureStore.getItemAsync("token")
    set({ isLoading: false, isAuthenticated: !!token })
  },
}))
