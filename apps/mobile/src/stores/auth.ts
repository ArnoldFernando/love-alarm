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
  SecureStore.setItemAsync("user", JSON.stringify(user))
  set({ token, user, isAuthenticated: true, isLoading: false })
},

  logout: () => {
  SecureStore.deleteItemAsync("token")
  SecureStore.deleteItemAsync("user")
  set({ token: null, user: null, isAuthenticated: false, isLoading: false })
},

  initialize: async () => {
  const token = await SecureStore.getItemAsync("token")
  const userJson = await SecureStore.getItemAsync("user")
  const user = userJson ? JSON.parse(userJson) : null
  set({ token, user, isAuthenticated: !!token, isLoading: false })
},
}))