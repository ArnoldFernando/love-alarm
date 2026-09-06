"use client"
import { useAuthStore } from "@/stores/auth"
import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image } from "react-native"
import { getAvatarSource } from "@/utils/avatar"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useFocusEffect } from "@react-navigation/native"
import { api } from "@/services/api"
import { router } from "expo-router"

import { Bell, Heart, Clock, Check } from "lucide-react-native"

interface Alarm {
  id: string
  type: "mutual_crush" | "one_way_crush"
  status: string
  triggered_by_user: {
    id: string
    display_name: string
    username: string
    photo_url?: string | null   // add this
  } | null
  triggered_at: string
  acknowledged_at: string | null
}

export default function AlarmsScreen() {
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const isLoading = useAuthStore(s => s.isLoading)

  const { data: alarms = [], isLoading: alarmsLoading } = useQuery<Alarm[]>({
    queryKey: ["alarms"],
    queryFn: async (): Promise<Alarm[]> => {
      const res = await api.get("/alarms")

  if (Array.isArray(res.data?.data)) {
    return res.data.data
  }

  if (Array.isArray(res.data?.data?.data)) {
    return res.data.data.data
  }

  if (Array.isArray(res.data)) {
    return res.data
  }

  return []
}, enabled: isAuthenticated && !isLoading,
  })

  const acknowledgeMutation = useMutation({
    mutationFn: async (alarmId: string) => {
      return api.post(`/alarms/${alarmId}/acknowledge`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] })
      queryClient.invalidateQueries({ queryKey: ["home-stats"] })
    },
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ["alarms"] })
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "triggered":
      case "detected":
        return "bg-rose-500"
      case "acknowledged":
        return "bg-green-500"
      case "expired":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "triggered":
        return "Ringing"
      case "detected":
        return "Nearby"
      case "acknowledged":
        return "Acknowledged"
      case "expired":
        return "Expired"
      default:
        return status
    }
  }

 const activeAlarms = alarms?.filter((a: Alarm) =>
  ["triggered", "detected"].includes(a.status)
) || []



  const pastAlarms = alarms?.filter((a: Alarm) =>
    !["triggered", "detected"].includes(a.status)
  ) || []

  // Play alarm sound when there are active alarms and screen is focused
 
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-5 pt-12 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Love Alarms</Text>
        <Text className="text-gray-500 text-sm mt-1">
          {activeAlarms.length} active alarm{activeAlarms.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeAlarms.length > 0 && (
          <View className="px-5 mt-4">
            <Text className="text-gray-900 font-bold text-lg mb-3">Active Now</Text>
            {activeAlarms.map((alarm: Alarm) => (
              <View
                key={alarm.id}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-rose-100"
              >
                <View className="flex-row items-start">
                  <View className="w-12 h-12 rounded-full bg-rose-100 items-center justify-center mr-3">
                    <Heart size={22} color="#E11D48" fill="#E11D48" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-900 font-bold text-lg">
                        {alarm.type === "mutual_crush"
                          ? "Mutual Crush Nearby!"
                          : "Crush Nearby!"}
                      </Text>
                      <View
                        className={`px-2 py-1 rounded-full ${getStatusColor(alarm.status)}`}
                      >
                        <Text className="text-white text-xs font-medium">
                          {getStatusText(alarm.status)}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-gray-600 mt-1">
                      {alarm.triggered_by_user?.display_name || "Someone"} is within your alarm radius
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <Clock size={14} color="#9CA3AF" />
                      <Text className="text-gray-400 text-xs ml-1">
                        {new Date(alarm.triggered_at).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>

                {alarm.status !== "acknowledged" && (
                  <TouchableOpacity
                    onPress={() => acknowledgeMutation.mutate(alarm.id)}
                    disabled={acknowledgeMutation.isPending}
                    className="mt-3 bg-rose-500 rounded-xl py-3 items-center"
                  >
                    <View className="flex-row items-center">
                      <Check size={18} color="#FFFFFF" />
                      <Text className="text-white font-medium ml-2">
                        Acknowledge Alarm
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {pastAlarms.length > 0 && (
          <View className="px-5 mt-4 mb-8">
            <Text className="text-gray-900 font-bold text-lg mb-3">History</Text>
            {pastAlarms.map((alarm: Alarm) => (
              <TouchableOpacity
                key={alarm.id}
                onPress={() => router.push(`/alarms/${alarm.id}`)}
                className="bg-white rounded-2xl p-4 mb-2 shadow-sm flex-row items-center"
              >
                <Image
  source={getAvatarSource(alarm.triggered_by_user?.photo_url)}
  className="w-10 h-10 rounded-full mr-3"
/>
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">
                    {alarm.type === "mutual_crush" ? "Mutual Crush" : "Crush"} -{" "}
                    {getStatusText(alarm.status)}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {alarm.triggered_by_user?.display_name || "Unknown"}
                  </Text>
                </View>
                <Text className="text-gray-400 text-xs">
                  {new Date(alarm.triggered_at).toLocaleDateString()}
                </Text>
              </TouchableOpacity>



            ))}
          </View>
        )}




        {alarms?.length === 0 && (
          <View className="items-center justify-center py-20 px-8">
            <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
              <Bell size={36} color="#D1D5DB" />
            </View>
            <Text className="text-xl font-bold text-gray-900 text-center">
              No alarms yet
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              When someone you have a crush on is nearby, you will see an alarm here.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/discover")}
              className="mt-6 bg-rose-500 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-medium">Discover People</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  )
}