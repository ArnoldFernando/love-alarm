"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Save } from "lucide-react"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const settingsSchema = z.object({
  alarm_radius_meters: z.coerce.number().min(50).max(10000),
  alarm_cooldown_seconds: z.coerce.number().min(60).max(86400),
  max_active_alarms_per_user: z.coerce.number().min(1).max(1000),
  proximity_check_interval_seconds: z.coerce.number().min(10).max(3600),
  max_distance_km: z.coerce.number().min(1).max(500),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const qc = useQueryClient()
  const [saved, setSaved] = useState(false)

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await api.get("/admin/settings")
      return res.data.data
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: settings,
  })

  const mutation = useMutation({
    mutationFn: (data: SettingsFormData) => api.put("/admin/settings", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Proximity & Alarm Configuration</CardTitle>
            <CardDescription>
              Control how the Love Alarm detects and notifies nearby matches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="alarm_radius_meters">Alarm Radius (meters)</Label>
                <Input
                  id="alarm_radius_meters"
                  type="number"
                  {...register("alarm_radius_meters")}
                />
                {errors.alarm_radius_meters && (
                  <p className="text-sm text-red-600">{errors.alarm_radius_meters.message}</p>
                )}
                <p className="text-xs text-gray-500">Min 50m · Max 10,000m</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alarm_cooldown_seconds">Alarm Cooldown (seconds)</Label>
                <Input
                  id="alarm_cooldown_seconds"
                  type="number"
                  {...register("alarm_cooldown_seconds")}
                />
                {errors.alarm_cooldown_seconds && (
                  <p className="text-sm text-red-600">{errors.alarm_cooldown_seconds.message}</p>
                )}
                <p className="text-xs text-gray-500">Min 60s (1 min) · Max 86400s (24 hrs)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_active_alarms_per_user">Max Active Alarms per User</Label>
                <Input
                  id="max_active_alarms_per_user"
                  type="number"
                  {...register("max_active_alarms_per_user")}
                />
                {errors.max_active_alarms_per_user && (
                  <p className="text-sm text-red-600">{errors.max_active_alarms_per_user.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="proximity_check_interval_seconds">
                  Proximity Check Interval (seconds)
                </Label>
                <Input
                  id="proximity_check_interval_seconds"
                  type="number"
                  {...register("proximity_check_interval_seconds")}
                />
                {errors.proximity_check_interval_seconds && (
                  <p className="text-sm text-red-600">
                    {errors.proximity_check_interval_seconds.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">Min 10s · Max 3600s (1 hr)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_distance_km">Max Discovery Distance (km)</Label>
                <Input
                  id="max_distance_km"
                  type="number"
                  {...register("max_distance_km")}
                />
                {errors.max_distance_km && (
                  <p className="text-sm text-red-600">{errors.max_distance_km.message}</p>
                )}
                <p className="text-xs text-gray-500">Min 1km · Max 500km</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>

          {saved && (
            <span className="text-sm text-green-600 font-medium">
              ✓ Settings saved successfully
            </span>
          )}

          {mutation.isError && (
            <span className="text-sm text-red-600">
              Failed to save settings. Please try again.
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
