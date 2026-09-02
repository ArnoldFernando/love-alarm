import { useEffect, useRef, useState, useCallback } from "react"
import { useFocusEffect } from "@react-navigation/native"
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native"
import { useQuery } from "@tanstack/react-query"
import * as Location from "expo-location"
import { LinearGradient } from "expo-linear-gradient"
import { api } from "@/services/api"
import { Heart } from "lucide-react-native"
import { router } from "expo-router"
const RADAR_SIZE = 300
const CENTER = RADAR_SIZE / 2
const MAX_RADIUS_METERS = 30

interface NearbyUser {
user_id: string
display_name: string
distance_meters: number
}

export default function RadarScreen() {
const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const sweepAnim = useRef(new Animated.Value(0)).current
    const pulseAnim = useRef(new Animated.Value(0)).current

      useEffect(() => {
    let subscription: Location.LocationSubscription | null = null

    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setErrorMsg("Location permission is required to use the radar.")
        return
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
                (loc) => {
          console.log("Radar location updated")
          setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
        }
      )
    })()

    return () => {
      subscription?.remove()
    }
  }, [])

    useEffect(() => {
    const sweepLoop = Animated.loop(
    Animated.timing(sweepAnim, {
    toValue: 1,
    duration: 4000,
    easing: Easing.linear,
    useNativeDriver: true,
    })
    )
    sweepLoop.start()

    const pulseLoop = Animated.loop(
    Animated.sequence([
    Animated.timing(pulseAnim, {
    toValue: 1,
    duration: 1000,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
    }),
    Animated.timing(pulseAnim, {
    toValue: 0,
    duration: 1000,
    easing: Easing.in(Easing.ease),
    useNativeDriver: true,
    }),
    ])
    )
    pulseLoop.start()

    return () => {
    sweepLoop.stop()
    pulseLoop.stop()
    }
    }, [])

    const { data: nearbyUsers = [], isLoading } = useQuery<NearbyUser[]>({
      queryKey: ["radar", location?.latitude, location?.longitude],
      queryFn: async () => {
      if (!location) return []
      const res = await api.post("/proximity/radar", {
      latitude: location.latitude,
      longitude: location.longitude,
      })
      return res.data.data?.users || []
      },
      enabled: !!location,
      refetchInterval: 8000,
      })

      useFocusEffect(
  useCallback(() => {
    if (!location) return

    const reportLocation = () => {
      api.post("/proximity/update", {
        latitude: location.latitude,
        longitude: location.longitude,
      }).catch(() => {})
    }

    reportLocation()
    const interval = setInterval(reportLocation, 8000)
    return () => clearInterval(interval)
  }, [location?.latitude, location?.longitude])
)

      const rotate = sweepAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
      })

      const pulseScale = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.6],
      })

      const pulseOpacity = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 0],
      })

      return (
      <LinearGradient colors={["#3b0a1e", "#7a1436" , "#e11d48" ]} style={{ flex: 1 }}>
        <View className="px-5 pt-12 pb-4">
          <View className="flex-row items-center">
            <Heart size={22} color="#fecdd3" fill="#fecdd3" />
            <Text className="text-white text-2xl font-bold ml-2">Love Radar</Text>
          </View>
          <Text className="text-rose-200 text-sm mt-1">
            Discover hearts within {MAX_RADIUS_METERS}m
          </Text>
        </View>

        {errorMsg ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-rose-200 text-center">{errorMsg}</Text>
        </View>
        ) : (
        <View className="flex-1 items-center justify-center">
          <View style={{
              width: RADAR_SIZE,
              height: RADAR_SIZE,
              borderRadius: RADAR_SIZE / 2,
              alignItems: "center",
              justifyContent: "center",
            }}>
            {/* Soft glow backdrop */}
            <View style={{
                position: "absolute",
                width: RADAR_SIZE + 40,
                height: RADAR_SIZE + 40,
                borderRadius: (RADAR_SIZE + 40) / 2,
                backgroundColor: "rgba(251, 113, 133, 0.08)",
              }} />

            {/* Radar disc */}
            <View style={{
                width: RADAR_SIZE,
                height: RADAR_SIZE,
                borderRadius: RADAR_SIZE / 2,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: "rgba(251, 113, 133, 0.35)",
                overflow: "hidden",
              }}>
              {/* Range rings */}
              {[1, 0.66, 0.33].map((scale) => (
              <View key={scale} style={{
                    position: "absolute",
                    top: CENTER - CENTER * scale,
                    left: CENTER - CENTER * scale,
                    width: RADAR_SIZE * scale,
                    height: RADAR_SIZE * scale,
                    borderRadius: (RADAR_SIZE * scale) / 2,
                    borderWidth: 1,
                    borderColor: "rgba(251, 113, 133, 0.25)",
                  }} />
              ))}

              {/* Sweep line with soft trail */}
              <Animated.View style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: RADAR_SIZE,
                  height: RADAR_SIZE,
                  transform: [{ rotate }],
                }}>
                <LinearGradient colors={["rgba(251,113,133,0.5)", "rgba(251,113,133,0)" ]} start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }} style={{
                    position: "absolute",
                    top: 0,
                    left: CENTER - 1,
                    width: 2,
                    height: CENTER,
                  }} />
              </Animated.View>

              {/* Pulsing ring from center (you) */}
              <Animated.View style={{
                  position: "absolute",
                  top: CENTER - 18,
                  left: CENTER - 18,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#fb7185",
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseScale }],
                }} />

              {/* Center heart (you) */}
              <View style={{
                  position: "absolute",
                  top: CENTER - 12,
                  left: CENTER - 12,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: "#ffffff",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#E11D48",
                  shadowOpacity: 0.8,
                  shadowRadius: 8,
                  elevation: 6,
                }}>
                <Heart size={14} color="#E11D48" fill="#E11D48" />
              </View>

              {/* Blips */}
              {nearbyUsers.map((u, index) => {
              const angle = (index * 137.5) % 360
              const radiusRatio = Math.min(u.distance_meters / MAX_RADIUS_METERS, 1)
              const r = radiusRatio * (CENTER - 24)
              const rad = (angle * Math.PI) / 180
              const x = CENTER + r * Math.cos(rad) - 12
              const y = CENTER + r * Math.sin(rad) - 12

              return (
              <TouchableOpacity key={u.user_id} onPress={()=> router.push(`/users/${u.user_id}`)}
                activeOpacity={0.7}
                style={{ position: "absolute", top: y, left: x, alignItems: "center", width: 80 }}
                >
                <View style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: "rgba(251, 113, 133, 0.9)",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#fb7185",
          shadowOpacity: 0.9,
          shadowRadius: 6,
          elevation: 4,
        }}>
                  <Heart size={12} color="#FFFFFF" fill="#FFFFFF" />
                </View>
                <Text style={{
          color: "#fecdd3",
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
          textAlign: "center",
        }} numberOfLines={1}>
                  {u.display_name}
                </Text>
              </TouchableOpacity>
              )
              })}
            </View>
          </View>

          <View className="flex-row items-center mt-8 bg-white/10 px-4 py-2 rounded-full">
            <Heart size={14} color="#fecdd3" fill="#fecdd3" />
            <Text className="text-rose-100 ml-2 text-sm">
              {isLoading
              ? "Scanning for hearts..."
              : `${nearbyUsers.length} ${nearbyUsers.length === 1 ? "heart" : "hearts"} nearby`}
            </Text>
          </View>
        </View>
        )}
      </LinearGradient>
      )
      }