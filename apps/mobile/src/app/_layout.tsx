import "./global.css"
import { useEffect } from "react"
import { Stack, Redirect } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { useAuthStore } from "@/stores/auth"
import {
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
  startForegroundLocationTracking,
  stopForegroundLocationTracking,
} from "@/services/locationTracking"
import { api } from "@/services/api"
import { AppState } from "react-native"
import { GlobalAlarmSound } from "@/components/GlobalAlarmSound"


export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
  initialize()
}, [initialize])

useEffect(() => {
  if (!isAuthenticated) return

  let loveAlarmEnabled = false

  api.get("/profile/settings").then((res) => {
    loveAlarmEnabled = !!res.data.data?.love_alarm_enabled
    if (loveAlarmEnabled && res.data.data?.background_detection_enabled) {
      startBackgroundLocationTracking()
    }
    // App just launched — if it's already in the foreground, start fast tracking too
    if (loveAlarmEnabled && AppState.currentState === "active") {
      startForegroundLocationTracking()
    }
  }).catch(() => {})

  const subscription = AppState.addEventListener("change", (nextState) => {
    if (!loveAlarmEnabled) return
    if (nextState === "active") {
      startForegroundLocationTracking()
    } else {
      stopForegroundLocationTracking()
    }
  })

  return () => {
    subscription.remove()
    stopForegroundLocationTracking()
  }
}, [isAuthenticated])

  if (isLoading) {
    return null // or a splash/loading component
  }

  return (
    <QueryClientProvider client={queryClient}>
  <GlobalAlarmSound />
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="(auth)" />
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="chat/[id]" />
    <Stack.Screen name="users/[id]" />
    <Stack.Screen name="edit-profile" />
    <Stack.Screen name="crushes" />
    <Stack.Screen name="liked" />
    <Stack.Screen name="notifications" />
<Stack.Screen name="blocked-users" />
    
  </Stack>
  {!isAuthenticated && <Redirect href="/(auth)/login" />}
  <StatusBar style="auto" />
</QueryClientProvider>
  )
}