"use client"

import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocalSearchParams, router } from "expo-router"
import { api } from "@/services/api"
import { getAvatarSource } from "@/utils/avatar"
import { LinearGradient } from "expo-linear-gradient"
import { ChevronLeft, Clock, Heart, Sparkles, CheckCircle2 } from "lucide-react-native"

interface AlarmDetail {
  id: string
  type: "mutual_crush" | "one_way_crush"
  status: string
  triggered_by_user: {
    id: string
    display_name: string
    username: string
    photo_url?: string | null
  } | null
  triggered_at: string
  acknowledged_at: string | null
  expires_at: string
}

export default function AlarmDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const queryClient = useQueryClient()

  const cachedAlarms = queryClient.getQueryData<AlarmDetail[]>(["alarms"])
  const cachedAlarm = cachedAlarms?.find((a) => a.id === id)

  const { data: alarm, isLoading } = useQuery<AlarmDetail>({
    queryKey: ["alarm", id],
    queryFn: async () => {
      const res = await api.get(`/alarms/${id}`)
      return res.data.data
    },
    initialData: cachedAlarm,
    enabled: !!id,
  })

  // Look up an existing conversation with this user, if one exists
  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await api.get("/conversations")
      return res.data.data?.data || res.data.data || []
    },
    enabled: !!alarm?.triggered_by_user?.id,
  })

  const conversation = conversations?.find(
  (c: any) => c.other_user?.id === alarm?.triggered_by_user?.id
)

    console.log("ALARM TYPE:", alarm?.type)
  console.log("CONVERSATION FOUND:", conversation)
  console.log("ALL CONVERSATIONS:", conversations)

  if (isLoading && !alarm) {
    return (
      <View className="flex-1 items-center justify-center bg-rose-50">
        <ActivityIndicator size="large" color="#E11D48" />
      </View>
    )
  }

  if (!alarm) {
    return (
      <View className="flex-1 items-center justify-center bg-rose-50 px-8">
        <Heart size={40} color="#FDA4AF" fill="#FDA4AF" />
        <Text className="text-gray-500 text-center mt-4">Alarm not found.</Text>
      </View>
    )
  }

  const isMutual = alarm.type === "mutual_crush"

  const handleGoToChat = () => {
    if (conversation?.id) {
      router.push(`/chat/${conversation.id}`)
    }
  }

  return (
    <ScrollView className="flex-1 bg-rose-50" showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient
        colors={isMutual ? ["#FB7185", "#E11D48", "#BE123C"] : ["#FDA4AF", "#FB7185"]}
        className="pt-14 pb-10 px-5 rounded-b-[36px]"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/25 items-center justify-center mb-6"
        >
          <ChevronLeft size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View className="items-center">
          {/* Floating hearts accent */}
          <View className="absolute -top-2 -left-6">
            <Heart size={16} color="#FFFFFF" fill="#FFFFFF" opacity={0.5} />
          </View>
          <View className="absolute top-4 right-2">
            <Heart size={12} color="#FFFFFF" fill="#FFFFFF" opacity={0.35} />
          </View>
          <View className="absolute -top-4 right-16">
            <Sparkles size={14} color="#FFFFFF" opacity={0.6} />
          </View>

          <View className="p-1 bg-white/30 rounded-full">
            <Image
              source={getAvatarSource(alarm.triggered_by_user?.photo_url)}
              className="w-28 h-28 rounded-full border-4 border-white"
            />
            <View className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white items-center justify-center">
              <Heart size={18} color="#E11D48" fill="#E11D48" />
            </View>
          </View>

          <Text className="text-white text-2xl font-bold mt-4">
            {alarm.triggered_by_user?.display_name || "Someone"}
          </Text>
          {alarm.triggered_by_user?.username && (
            <Text className="text-white/80 mt-0.5">@{alarm.triggered_by_user.username}</Text>
          )}

          <View className="flex-row items-center bg-white/25 px-4 py-1.5 rounded-full mt-4">
            <Heart size={14} color="#FFFFFF" fill="#FFFFFF" />
            <Text className="text-white font-medium ml-2">
              {isMutual ? "It's a Mutual Crush 💕" : "Someone has a crush on you"}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Details */}
      <View className="px-5 -mt-5">
        <View className="bg-white rounded-3xl p-5 shadow-lg shadow-rose-200">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-rose-100 items-center justify-center">
              <Clock size={18} color="#E11D48" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-gray-400 text-xs">Your heart skipped a beat at</Text>
              <Text className="text-gray-900 font-semibold">
                {new Date(alarm.triggered_at).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </Text>
            </View>
          </View>

          {alarm.acknowledged_at && (
            <>
              <View className="h-px bg-rose-50 my-4" />
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center">
                  <CheckCircle2 size={18} color="#16A34A" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-gray-400 text-xs">Acknowledged</Text>
                  <Text className="text-gray-900 font-semibold">
                    {new Date(alarm.acknowledged_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {isMutual && (
          <View className="bg-white rounded-3xl p-5 mt-4 shadow-sm items-center">
            {conversation?.id ? (
              <>
                <Text className="text-gray-500 text-center leading-5">
                  You both like each other. Don't leave this hanging in the air — say something sweet. 💌
                </Text>
                <TouchableOpacity
                  onPress={handleGoToChat}
                  className="mt-4 bg-rose-500 px-6 py-3 rounded-full flex-row items-center"
                >
                  <Heart size={16} color="#FFFFFF" fill="#FFFFFF" />
                  <Text className="text-white font-medium ml-2">Go to Chat</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text className="text-gray-500 text-center leading-5">
                  You're a mutual match — head to your matches to start the conversation. 💌
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/matches")}
                  className="mt-4 bg-rose-500 px-6 py-3 rounded-full flex-row items-center"
                >
                  <Heart size={16} color="#FFFFFF" fill="#FFFFFF" />
                  <Text className="text-white font-medium ml-2">View Matches</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>

      <View className="h-10" />
    </ScrollView>
  )
}