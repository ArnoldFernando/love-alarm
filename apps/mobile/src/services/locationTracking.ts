import * as Location from "expo-location"
import * as TaskManager from "expo-task-manager"
import { api } from "@/services/api"

export const LOCATION_TASK_NAME = "love-alarm-background-location"

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.log("Background location task error:", error)
    return
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] }
    const latest = locations[locations.length - 1]
    if (!latest) return

        const coords = {
      latitude: latest.coords.latitude,
      longitude: latest.coords.longitude,
      accuracy: latest.coords.accuracy,
    }

    try {
      // Store this device's own location first, so OTHER users' proximity
      // checks can actually find it — checkProximity only reads, it never writes.
      await api.post("/proximity/update", coords)
      await api.post("/proximity/check", coords)
    } catch (err) {
      console.log("Failed to send proximity data:", err)
    }
  }
})

export async function startBackgroundLocationTracking() {
  const { status: foregroundStatus } =
    await Location.requestForegroundPermissionsAsync()
  if (foregroundStatus !== "granted") {
    console.log("Foreground location permission not granted")
    return false
  }

  const { status: backgroundStatus } =
    await Location.requestBackgroundPermissionsAsync()
  if (backgroundStatus !== "granted") {
    console.log("Background location permission not granted")
    return false
  }

  const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(
    LOCATION_TASK_NAME
  )
  if (alreadyStarted) return true

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 60000,
    distanceInterval: 25,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "Love Alarm is active",
      notificationBody: "Checking for nearby crushes.",
    },
  })

  return true
}

export async function stopBackgroundLocationTracking() {
  const isRunning = await Location.hasStartedLocationUpdatesAsync(
    LOCATION_TASK_NAME
  )
  if (isRunning) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
  }
}