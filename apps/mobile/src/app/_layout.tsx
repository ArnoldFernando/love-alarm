import "./global.css"
import { useEffect, useState } from "react"
import { Stack, Redirect, useSegments } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { QueryClientProvider } from "@tanstack/react-query"
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
  const segments = useSegments()
  const [loveAlarmEnabled, setLoveAlarmEnabled] = useState(false)
  const PROXIMITY_DEBUG_DISABLED = false

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!isAuthenticated) {
      setLoveAlarmEnabled(false)
      return
    }

    api.get("/profile/settings").then((res) => {
  const enabled = !!res.data.data?.love_alarm_enabled
  setLoveAlarmEnabled(enabled)

  if (PROXIMITY_DEBUG_DISABLED) return

  if (enabled && res.data.data?.background_detection_enabled) {
    startBackgroundLocationTracking()
  }
  if (enabled && AppState.currentState === "active") {
    startForegroundLocationTracking()
  }
}).catch(() => {
  setLoveAlarmEnabled(false)
})

    const subscription = AppState.addEventListener("change", (nextState) => {
       if (PROXIMITY_DEBUG_DISABLED) return 
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
  }, [isAuthenticated, loveAlarmEnabled])

  if (isLoading) {
    return null // or a splash/loading component
  }

  const isAuthRoute = segments[0] === "(auth)"

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
      {!isAuthenticated && !isAuthRoute && <Redirect href="/(auth)/login" />}
      {isAuthenticated && isAuthRoute && <Redirect href="/(tabs)" />}
      <StatusBar style="auto" />
    </QueryClientProvider>
  )
}