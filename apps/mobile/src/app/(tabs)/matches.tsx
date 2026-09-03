"use client"

import { useState } from "react"
import { View, Text, Image, TouchableOpacity, ScrollView, RefreshControl } from "react-native"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import { router } from "expo-router"
import { MessageCircle, Heart } from "lucide-react-native"
import { getAvatarSource } from "@/utils/avatar"

interface Match {
  id: string
  matched_user: {
    id: string
    profile: {
      display_name: string
      username: string
      age: number | null
    }
    photos: { url: string }[]
  }
  matched_at: string
  last_message: {
    content: string
    sent_at: string
    sender_id: string
    is_read: boolean
  } | null
}

export default function MatchesScreen() {
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  const { data: matches, isLoading } = useQuery({
  queryKey: ["matches"],
  queryFn: async () => {
    const res = await api.get("/matches")
    return res.data.data?.data || []
  },
})

  const { data: conversations } = useQuery({
  queryKey: ["conversations"],
  queryFn: async () => {
    const res = await api.get("/conversations")
    return res.data.data?.data || res.data.data || []
  },
})

  const onRefresh = async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ["matches"] })
    await queryClient.invalidateQueries({ queryKey: ["conversations"] })
    setRefreshing(false)
  }

  const getConversationId = (matchId: string) => {
    const conv = conversations?.find((c: any) => c.match_id === matchId)
    return conv?.id
  }

  const handleOpenChat = (match: Match) => {
    const conversationId = getConversationId(match.id)
    if (conversationId) {
      router.push(`/chat/${conversationId}`)
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-400">Loading matches...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-5 pt-12 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Matches</Text>
        <Text className="text-gray-500 text-sm mt-1">
          {matches?.length || 0} match{matches?.length !== 1 ? "es" : ""}
        </Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {matches && matches.length > 0 ? (
          <View className="px-5 mt-4 mb-8">
            {matches.map((match: Match) => (
              <TouchableOpacity
                key={match.id}
                onPress={() => handleOpenChat(match)}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm flex-row items-center"
              >
                {match.matched_user?.photos?.[0]?.url ? (
  // After:
<Image
  source={getAvatarSource(match.matched_user?.photos?.[0]?.url)}
  className="w-14 h-14 rounded-full"
/>
) : (
  <View className="w-14 h-14 rounded-full bg-rose-100 items-center justify-center">
    <Text style={{ fontSize: 28 }}>🙂</Text>
  </View>
)}
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-900 font-bold text-base">
  {match.matched_user?.profile?.display_name || "Unknown"}
  <Text className="text-gray-400 font-normal">
    {" "}
    {match.matched_user?.profile?.age || ""}
  </Text>
</Text>
                    <Text className="text-gray-400 text-xs">
                      {match.last_message
                        ? new Date(match.last_message.sent_at).toLocaleDateString()
                        : new Date(match.matched_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="flex-row items-center mt-1">
                    {match.last_message ? (
                      <>
                        <MessageCircle
                          size={14}
                          color={
                            !match.last_message.is_read &&
                            match.last_message.sender_id !== match.matched_user.id
                              ? "#E11D48"
                              : "#9CA3AF"
                          }
                        />
                        <Text
                          className={`text-sm ml-1 flex-1 ${
                            !match.last_message.is_read &&
                            match.last_message.sender_id !== match.matched_user.id
                              ? "text-gray-900 font-medium"
                              : "text-gray-500"
                          }`}
                          numberOfLines={1}
                        >
                          {match.last_message.content}
                        </Text>
                        {!match.last_message.is_read &&
                          match.last_message.sender_id !== match.matched_user.id && (
                            <View className="w-2.5 h-2.5 rounded-full bg-rose-500 ml-2" />
                          )}
                      </>
                    ) : (
                      <View className="flex-row items-center">
                        <Heart size={14} color="#E11D48" fill="#E11D48" />
                        <Text className="text-rose-500 text-sm ml-1">
                          It is a match! Say hello
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="items-center justify-center py-20 px-8">
            <View className="w-20 h-20 rounded-full bg-rose-100 items-center justify-center mb-4">
              <Heart size={36} color="#E11D48" fill="#E11D48" />
            </View>
            <Text className="text-xl font-bold text-gray-900 text-center">
              No matches yet
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              When someone you like also likes you back, you will be able to chat here.
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