import * as Location from "expo-location"
import * as TaskManager from "expo-task-manager"
import { api } from "@/services/api"
import { __DEV__ } from "react-native"

export const LOCATION_TASK_NAME = "love-alarm-background-location"

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    if (__DEV__) console.log("Background location task failed")
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
      await api.post("/proximity/update", coords)
      await api.post("/proximity/check", coords)
    } catch (err) {
      if (__DEV__) console.log("Failed to send proximity data")
    }
  }
})

export async function startBackgroundLocationTracking() {
  try {
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync()
    if (foregroundStatus !== "granted") {
      if (__DEV__) console.log("Foreground location permission not granted")
      return false
    }

    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync()
    if (backgroundStatus !== "granted") {
      if (__DEV__) console.log("Background location permission not granted")
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
  } catch (err) {
    if (__DEV__) console.log("Failed to start background location tracking:", err)
    return false
  }
}

export async function stopBackgroundLocationTracking() {
  const isRunning = await Location.hasStartedLocationUpdatesAsync(
    LOCATION_TASK_NAME
  )
  if (isRunning) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
  }
}


let foregroundSubscription: Location.LocationSubscription | null = null

export async function startForegroundLocationTracking() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== "granted") return false
    if (foregroundSubscription) return true

    foregroundSubscription = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5 },
      async (location) => {
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        }
        try {
          await api.post("/proximity/update", coords)
          await api.post("/proximity/check", coords)
        } catch (err) {
          if (__DEV__) console.log("Failed to send foreground proximity data")
        }
      }
    )

    return true
  } catch (err) {
    if (__DEV__) console.log("Failed to start foreground location tracking:", err)
    return false
  }
}

export function stopForegroundLocationTracking() {
  if (foregroundSubscription) {
    foregroundSubscription.remove()
    foregroundSubscription = null
  }
}