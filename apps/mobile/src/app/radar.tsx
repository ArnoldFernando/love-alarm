import { useEffect, useRef, useState } from "react"
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native"
import { useQuery } from "@tanstack/react-query"
import * as Location from "expo-location"
import { api } from "@/services/api"
import { router } from "expo-router"
import { ChevronLeft, Radar as RadarIcon } from "lucide-react-native"

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

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setErrorMsg("Location permission is required to use the radar.")
        return
      }
      const loc = await Location.getCurrentPositionAsync({})
setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
console.log("MY LOCATION:", loc.coords.latitude, loc.coords.longitude)
    })()
  }, [])

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sweepAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )
    loop.start()
    return () => loop.stop()
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

  const rotate = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <View className="flex-1 bg-gray-950">
      <View className="px-5 pt-12 pb-4">
  <Text className="text-white text-xl font-bold">Radar</Text>
</View>

      {errorMsg ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-gray-400 text-center">{errorMsg}</Text>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center">
          <View
            style={{
              width: RADAR_SIZE,
              height: RADAR_SIZE,
              borderRadius: RADAR_SIZE / 2,
              backgroundColor: "#052e1a",
              borderWidth: 1,
              borderColor: "#14532d",
              overflow: "hidden",
            }}
          >
            {/* Range rings */}
            {[1, 0.66, 0.33].map((scale) => (
              <View
                key={scale}
                style={{
                  position: "absolute",
                  top: CENTER - (CENTER * scale),
                  left: CENTER - (CENTER * scale),
                  width: RADAR_SIZE * scale,
                  height: RADAR_SIZE * scale,
                  borderRadius: (RADAR_SIZE * scale) / 2,
                  borderWidth: 1,
                  borderColor: "#14532d",
                }}
              />
            ))}

            {/* Sweep line */}
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: RADAR_SIZE,
                height: RADAR_SIZE,
                transform: [{ rotate }],
              }}
            >
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: CENTER,
                  width: 1,
                  height: CENTER,
                  backgroundColor: "#22c55e",
                }}
              />
            </Animated.View>

            {/* Center dot (you) */}
            <View
              style={{
                position: "absolute",
                top: CENTER - 5,
                left: CENTER - 5,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#E11D48",
              }}
            />

            {/* Blips */}
            {nearbyUsers.map((u, index) => {
              const angle = (index * 137.5) % 360 // spread deterministically
              const radiusRatio = Math.min(u.distance_meters / MAX_RADIUS_METERS, 1)
              const r = radiusRatio * (CENTER - 20)
              const rad = (angle * Math.PI) / 180
              const x = CENTER + r * Math.cos(rad) - 4
              const y = CENTER + r * Math.sin(rad) - 4

              return (
                <View key={u.user_id} style={{ position: "absolute", top: y, left: x, alignItems: "center" }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#4ade80",
                    }}
                  />
                  <Text
                    style={{
                      color: "#bbf7d0",
                      fontSize: 10,
                      marginTop: 2,
                      maxWidth: 70,
                    }}
                    numberOfLines={1}
                  >
                    {u.display_name}
                  </Text>
                </View>
              )
            })}
          </View>

          <Text className="text-gray-400 mt-6">
            {isLoading
              ? "Scanning..."
              : `${nearbyUsers.length} ${nearbyUsers.length === 1 ? "person" : "people"} nearby`}
          </Text>
        </View>
      )}
    </View>
  )
}