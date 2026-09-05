"use client"

import { View, Alert, Text, Image, ScrollView, TouchableOpacity } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import { ArrowLeft, Heart, MapPin, GraduationCap, Flag, Ban } from "lucide-react-native"
import { useState } from "react"

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [reportReason, setReportReason] = useState("")
  const [showReport, setShowReport] = useState(false)

  const { data: userData } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await api.get(`/users/${id}`)
      return res.data.data
    },
  })

  const alreadyLiked = userData?.already_liked
  const crushId = userData?.crush_id

const crushMutation = useMutation({
  mutationFn: async () => {
    return api.post("/crushes", { to_user_id: id })
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["crushes"] })
    queryClient.invalidateQueries({ queryKey: ["matches"] })
    queryClient.invalidateQueries({ queryKey: ["home-stats"] })
  },
   onError: () => {
    Alert.alert("Something went wrong", "Could not like this profile. Try again.")
  },
})

  const blockMutation = useMutation({
    mutationFn: async () => {
      return api.post("/blocks", { blocked_user_id: id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocks"] })
      router.back()
    },
  })

  const reportMutation = useMutation({
    mutationFn: async () => {
      return api.post("/reports", {
        reported_user_id: id,
        reason: reportReason || "inappropriate_behavior",
      })
    },
    onSuccess: () => {
      setShowReport(false)
      setReportReason("")
    },
  })

  const profile = userData?.profile
  const photos = profile?.photos || []
  const interests = profile?.interests || []

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="relative">
        <Image
          source={{
            uri:
              photos.find((p: any) => p.is_primary)?.url ||
              photos[0]?.url ||
              "https://via.placeholder.com/400x500/E5E7EB/9CA3AF?text=No+Photo",
          }}
          className="w-full h-96"
          resizeMode="cover"
        />
        <View className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 left-5 w-10 h-10 rounded-full bg-black/30 items-center justify-center"
        >
          <ArrowLeft size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View className="mx-5 -mt-10 bg-white rounded-3xl p-6 shadow-lg">
        <Text className="text-2xl font-bold text-gray-900">
          {profile?.display_name || "Unknown"}
          <Text className="text-gray-400 font-normal text-lg">
            {" "}{profile?.age ? `, ${profile.age}` : ""}
          </Text>
        </Text>
        <Text className="text-gray-500">@{profile?.username || "unknown"}</Text>

        {profile?.school && (
          <View className="flex-row items-center mt-3">
            <MapPin size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-2">{profile.school}</Text>
          </View>
        )}
        {profile?.course && (
          <View className="flex-row items-center mt-2">
            <GraduationCap size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-2">{profile.course}</Text>
          </View>
        )}

        <View className="flex-row mt-5 gap-2">
          <TouchableOpacity
  onPress={() => {
    if (alreadyLiked) return // or wire up an unlike mutation, matching Discover's behavior
    crushMutation.mutate()
  }}
  disabled={crushMutation.isPending || alreadyLiked}
  className={`flex-1 rounded-xl py-3 items-center flex-row justify-center ${
    alreadyLiked ? "bg-gray-200" : "bg-rose-500"
  }`}
>
  <Heart size={18} color={alreadyLiked ? "#9CA3AF" : "#FFFFFF"} fill={alreadyLiked ? "#9CA3AF" : "#FFFFFF"} />
  <Text className={`font-medium ml-2 ${alreadyLiked ? "text-gray-500" : "text-white"}`}>
    {alreadyLiked ? "Liked" : "Like"}
  </Text>
</TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowReport(!showReport)}
            className="px-4 bg-gray-100 rounded-xl items-center justify-center"
          >
            <Flag size={18} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => blockMutation.mutate()}
            disabled={blockMutation.isPending}
            className="px-4 bg-gray-100 rounded-xl items-center justify-center"
          >
            <Ban size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {profile?.bio && (
        <View className="mx-5 mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-gray-900 font-bold text-base mb-2">About</Text>
          <Text className="text-gray-600 leading-5">{profile.bio}</Text>
        </View>
      )}

      {interests.length > 0 && (
        <View className="mx-5 mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-gray-900 font-bold text-base mb-3">Interests</Text>
          <View className="flex-row flex-wrap gap-2">
            {interests.map((interest: any) => (
              <View
                key={interest.id}
                className="bg-rose-50 rounded-full px-3 py-1.5"
              >
                <Text className="text-rose-600 text-sm font-medium">
                  {interest.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {photos.length > 1 && (
        <View className="mx-5 mt-4 mb-8 bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-gray-900 font-bold text-base mb-3">Photos</Text>
          <View className="flex-row flex-wrap gap-2">
            {photos.map((photo: any) => (
              <Image
                key={photo.id}
                source={{ uri: photo.url }}
                className="w-[48%] aspect-square rounded-xl"
                resizeMode="cover"
              />
            ))}
          </View>
        </View>
      )}

      {showReport && (
        <View className="mx-5 mt-4 mb-8 bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-gray-900 font-bold text-base mb-3">Report User</Text>
          {[
  "spam",
  "harassment",
  "fake_account",
  "impersonation",
  "inappropriate_behavior",
  "inappropriate_profile",
  "other",
].map((reason) => (
            <TouchableOpacity
              key={reason}
              onPress={() => setReportReason(reason)}
              className={`py-3 px-4 rounded-xl mb-2 ${
                reportReason === reason ? "bg-rose-500" : "bg-gray-100"
              }`}
            >
              <Text
                className={`font-medium ${
                  reportReason === reason ? "text-white" : "text-gray-700"
                }`}
              >
                {reason.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => reportMutation.mutate()}
            disabled={!reportReason || reportMutation.isPending}
            className={`mt-3 py-3 rounded-xl items-center ${
              reportReason ? "bg-rose-500" : "bg-gray-200"
            }`}
          >
            <Text className="text-white font-medium">Submit Report</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}