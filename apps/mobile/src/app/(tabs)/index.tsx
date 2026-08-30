"use client"

import { useEffect, useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"
import { useAuthStore } from "@/stores/auth"
import { router } from "expo-router"
import { Bell, Heart, Users, ChevronRight } from "lucide-react-native"

export default function HomeScreen() {
  const { user } = useAuthStore()
  const [ringActive, setRingActive] = useState(false)

  const { data: stats, isLoading } = useQuery({
  queryKey: ["home-stats"],
  queryFn: async () => {
    const [alarmsRes, matchesRes, likedRes, crushesReceivedRes] = await Promise.allSettled([
      api.get("/alarms"),
      api.get("/matches"),
      api.get("/crushes"),
      api.get("/crushes/received"),
    ])
    return {
      alarms: alarmsRes.status === "fulfilled" ? alarmsRes.value.data.data?.length || 0 : 0,
      matches: matchesRes.status === "fulfilled" ? matchesRes.value.data.data?.length || 0 : 0,
      liked: likedRes.status === "fulfilled" ? likedRes.value.data.data?.length || 0 : 0,
      crushes: crushesReceivedRes.status === "fulfilled" ? crushesReceivedRes.value.data.data?.length || 0 : 0,
    }
  },
})

  const { data: recentAlarms } = useQuery({
    queryKey: ["recent-alarms"],
    queryFn: async () => {
      const res = await api.get("/alarms")
      return res.data.data?.slice(0, 3) || []
    },
  })

  useEffect(() => {
    if (recentAlarms && recentAlarms.length > 0) {
      const hasActive = recentAlarms.some((a: any) => a.status === "triggered" || a.status === "detected")
      setRingActive(hasActive)
    }
  }, [recentAlarms])

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-rose-500 px-5 pt-14 pb-8 rounded-b-3xl">
        <Text className="text-white text-2xl font-bold">
          Hello, {user?.profile?.display_name || "there"}!
        </Text>
        <Text className="text-rose-100 mt-1">
          Your Love Alarm is {ringActive ? "ringing!" : "active"}
        </Text>
      </View>

      <View className="items-center -mt-10">
        <View
          className={`w-40 h-40 rounded-full items-center justify-center shadow-lg ${
            ringActive ? "bg-rose-500" : "bg-white"
          }`}
          style={{
            shadowColor: ringActive ? "#E11D48" : "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Heart
            size={48}
            color={ringActive ? "#FFFFFF" : "#E11D48"}
            fill={ringActive ? "#FFFFFF" : "transparent"}
          />
          <Text
            className={`mt-2 font-bold text-lg ${
              ringActive ? "text-white" : "text-rose-500"
            }`}
          >
            {ringActive ? "RINGING" : "ACTIVE"}
          </Text>
        </View>
      </View>

      <View className="px-5 mt-6">
  <Text className="text-gray-900 font-bold text-lg mb-3">Overview</Text>

  <View className="flex-row gap-3">
    <TouchableOpacity
      onPress={() => router.push("/alarms")}
      className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm"
    >
      <Bell size={24} color="#E11D48" />
      <Text className="text-2xl font-bold text-gray-900 mt-2">
        {isLoading ? "-" : stats?.alarms}
      </Text>
      <Text className="text-gray-500 text-sm">Alarms</Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => router.push("/matches")}
      className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm"
    >
      <Heart size={24} color="#E11D48" fill="#E11D48" />
      <Text className="text-2xl font-bold text-gray-900 mt-2">
        {isLoading ? "-" : stats?.matches}
      </Text>
      <Text className="text-gray-500 text-sm">Matches</Text>
    </TouchableOpacity>
    <TouchableOpacity
  onPress={() => router.push("/crushes")}
  className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm"
>
  <Users size={24} color="#E11D48" />
  <Text className="text-2xl font-bold text-gray-900 mt-2">
    {isLoading ? "-" : stats?.crushes}
  </Text>
  <Text className="text-gray-500 text-sm">Crushes</Text>
</TouchableOpacity>
  </View>

  {/* Own row, clearly separated below the stats */}
 <TouchableOpacity
  onPress={() => router.push("/liked")}
  className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-3.5 mt-3 shadow-sm"
>
  <View className="flex-row items-center">
    <Heart size={18} color="#E11D48" />
    <Text className="text-gray-700 font-medium ml-2">People You Liked</Text>
  </View>
  <Text className="text-gray-900 font-bold">{isLoading ? "-" : stats?.liked}</Text>
</TouchableOpacity>
</View>

      <View className="px-5 mt-6 mb-8">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-gray-900 font-bold text-lg">Recent Alarms</Text>
          <TouchableOpacity onPress={() => router.push("/alarms")}>
            <View className="flex-row items-center">
              <Text className="text-rose-500 text-sm">See all</Text>
              <ChevronRight size={16} color="#E11D48" />
            </View>
          </TouchableOpacity>
        </View>

        {recentAlarms && recentAlarms.length > 0 ? (
          recentAlarms.map((alarm: any) => (
            <TouchableOpacity
              key={alarm.id}
              onPress={() => router.push(`/alarms/${alarm.id}`)}
              className="bg-white rounded-xl p-4 mb-2 flex-row items-center shadow-sm"
            >
              <View className="w-10 h-10 rounded-full bg-rose-100 items-center justify-center mr-3">
                <Bell size={18} color="#E11D48" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-medium">
                  {alarm.type === "mutual_crush" ? "Mutual Crush Nearby!" : "Crush Nearby!"}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {alarm.triggered_by_user?.display_name || "Someone"} is within range
                </Text>
              </View>
              <View
                className={`px-2 py-1 rounded-full ${
                  alarm.status === "triggered" ? "bg-rose-100" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    alarm.status === "triggered" ? "text-rose-600" : "text-gray-600"
                  }`}
                >
                  {alarm.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="bg-white rounded-xl p-6 items-center shadow-sm">
            <Bell size={32} color="#D1D5DB" />
            <Text className="text-gray-400 mt-2 text-center">
              No alarms yet. Go discover people nearby!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}