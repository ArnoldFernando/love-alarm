import { Stack } from "expo-router"
import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth"

export default function RootLayout() {
  const { hydrate } = useAuthStore()

  useEffect(() => {
    hydrate()
  }, [])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  )
}
