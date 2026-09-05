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
  setAuth: (token: string, user: User) => Promise<void>
  logout: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (token, user) => {
    try {
      // Save credentials first
      await SecureStore.setItemAsync("token", token)
      await SecureStore.setItemAsync("user", JSON.stringify(user))

      // Only mark authenticated after persistence succeeds
      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      console.error("Failed to save authentication:", error)

      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      throw error
    }
  },

  logout: async () => {
    const { token, user, isAuthenticated } = get()

    if (!token && !user && !isAuthenticated) {
      return
    }

    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })

    queryClient.clear()

    try {
      await SecureStore.deleteItemAsync("token")
      await SecureStore.deleteItemAsync("user")
    } catch (error) {
      console.error("Failed to clear authentication:", error)
    }
  },

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync("token")
      const userJson = await SecureStore.getItemAsync("user")

      let user: User | null = null

      if (userJson) {
        try {
          user = JSON.parse(userJson) as User
        } catch (error) {
          console.error("Failed to parse stored user:", error)
          await SecureStore.deleteItemAsync("user")
        }
      }

      set({
        token,
        user,
        isAuthenticated: !!token,
        isLoading: false,
      })
    } catch (error) {
      console.error("Failed to initialize auth:", error)

      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },
}))