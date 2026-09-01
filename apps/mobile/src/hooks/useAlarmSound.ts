import { useCallback, useEffect, useRef } from "react"
import { Audio } from "expo-av"

export function useAlarmSound() {
  const soundRef = useRef<Audio.Sound | null>(null)
  const desiredPlaying = useRef(false)
  const loadingPromise = useRef<Promise<void> | null>(null)

  const play = useCallback(async () => {
    desiredPlaying.current = true

    if (soundRef.current) {
      await soundRef.current.setPositionAsync(0)
      await soundRef.current.playAsync()
      return
    }

    if (loadingPromise.current) {
      await loadingPromise.current
      return
    }

    loadingPromise.current = (async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/sounds/love-alarm.mp3"),
        { shouldPlay: false, isLooping: true, volume: 1.0 }
      )
      soundRef.current = sound

      // If a stop was requested while we were still loading, honor it now.
      if (desiredPlaying.current) {
        await sound.playAsync()
      }
    })()

    try {
      await loadingPromise.current
    } finally {
      loadingPromise.current = null
    }
  }, [])

  const stop = useCallback(async () => {
    desiredPlaying.current = false

    if (!soundRef.current) return

    try {
      await soundRef.current.stopAsync()
      await soundRef.current.setPositionAsync(0)
    } catch (error) {
      console.error("Failed to stop alarm sound:", error)
    }
  }, [])

  useEffect(() => {
    return () => {
      const cleanup = async () => {
        if (soundRef.current) {
          await soundRef.current.unloadAsync()
          soundRef.current = null
        }
        desiredPlaying.current = false
      }
      cleanup()
    }
  }, [])

  return { play, stop }
}