import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"
import { useAuthStore } from "@/stores/auth"
import { useAlarmSound } from "@/hooks/useAlarmSound"

export function GlobalAlarmSound() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { play, stop } = useAlarmSound()

  const { data: alarms = [] } = useQuery({
    queryKey: ["alarms"],
   queryFn: async () => {
  const res = await api.get("/alarms")
  if (Array.isArray(res.data?.data)) return res.data.data
  if (Array.isArray(res.data?.data?.data)) return res.data.data.data
  if (Array.isArray(res.data)) return res.data
  return []
},
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 15000 : false,
  })

  const activeAlarms = alarms.filter((a: any) =>
    ["triggered", "detected"].includes(a.status)
  )

  useEffect(() => {
    if (activeAlarms.length > 0) {
      play()
    } else {
      stop()
    }
  }, [activeAlarms.length])

  return null
}