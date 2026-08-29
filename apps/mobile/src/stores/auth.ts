import { create } from "zustand"
import * as SecureStore from "expo-secure-store"
import { queryClient } from "@/lib/queryClient"

interface User {
  id: string
  email: string
  profile?: {
    display_name: string
    username: string
  }
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (token, user) => {
    SecureStore.setItemAsync("token", token)
    queryClient.clear()
    set({ token, user, isAuthenticated: true, isLoading: false })
  },

  logout: () => {
    SecureStore.deleteItemAsync("token")
    queryClient.clear()
    set({ token: null, user: null, isAuthenticated: false, isLoading: false })
  },

  initialize: async () => {
    const token = await SecureStore.getItemAsync("token")
    set({ token, isAuthenticated: !!token, isLoading: false })
  },
}))