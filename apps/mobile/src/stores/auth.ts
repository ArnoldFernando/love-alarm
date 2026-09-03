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

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (token, user) => {
    SecureStore.setItemAsync("token", token)
    SecureStore.setItemAsync("user", JSON.stringify(user))
    set({ token, user, isAuthenticated: true, isLoading: false })
  },

  logout: () => {
    const { token, user, isAuthenticated } = get()
    if (!token && !user && !isAuthenticated) {
      return
    }

    set({ token: null, user: null, isAuthenticated: false, isLoading: false })
    queryClient.clear()
    SecureStore.deleteItemAsync("token")
    SecureStore.deleteItemAsync("user")
  },

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync("token")
      const userJson = await SecureStore.getItemAsync("user")
      let user: User | null = null
      if (userJson) {
        try {
          user = JSON.parse(userJson) as User
        } catch (parseError) {
          console.error("Failed to parse user data from secure store:", parseError)
          await SecureStore.deleteItemAsync("user")
        }
      }
      set({ token, user, isAuthenticated: !!token, isLoading: false })
    } catch (error) {
      console.error("Failed to initialize auth:", error)
      set({ token: null, user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
