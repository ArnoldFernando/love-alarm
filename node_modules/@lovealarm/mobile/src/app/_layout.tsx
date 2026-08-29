import "./global.css"
import { useEffect } from "react"
import { Stack, Redirect } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { useAuthStore } from "@/stores/auth"



export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) {
    return null // or a splash/loading component
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="users/[id]" />
        <Stack.Screen name="edit-profile" />
      </Stack>
      {!isAuthenticated && <Redirect href="/(auth)/login" />}
      <StatusBar style="auto" />
    </QueryClientProvider>
  )
}