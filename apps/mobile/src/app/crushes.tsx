import { useState } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import { router } from "expo-router"
import { ChevronLeft, Heart } from "lucide-react-native"

export default function CrushesScreen() {
  const queryClient = useQueryClient()

  const { data: crushes, isLoading } = useQuery({
    queryKey: ["crushes-received"],
    queryFn: async () => {
      const res = await api.get("/crushes/received")
      return res.data.data
    },
  })

  const crushBackMutation = useMutation({
    mutationFn: async (toUserId: string) => {
      return api.post("/crushes", { to_user_id: toUserId })
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["crushes-received"] })
      queryClient.invalidateQueries({ queryKey: ["matches"] })
      queryClient.invalidateQueries({ queryKey: ["home-stats"] })
      if (res.data.data.match_created) {
        Alert.alert("It's a match! 🎉", "You both liked each other.")
      }
    },
    onError: () => {
      Alert.alert("Something went wrong", "Could not like this profile. Try again.")
    },
  })

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-5 pt-12 pb-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Crushes</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#E11D48" />
        </View>
      ) : crushes && crushes.length > 0 ? (
        <ScrollView className="flex-1 px-5 pt-4">
          {crushes.map((crush: any) => (
            <TouchableOpacity
              key={crush.id}
              onPress={() => router.push(`/users/${crush.from_user.id}`)}
              className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm"
            >
              {crush.from_user?.photos?.[0]?.url ? (
  <Image
    source={{ uri: crush.from_user.photos[0].url }}
    className="w-14 h-14 rounded-full"
  />
) : (
  <View className="w-14 h-14 rounded-full bg-rose-100 items-center justify-center">
    <Text style={{ fontSize: 28 }}>🙂</Text>
  </View>
)}
              <View className="flex-1 ml-3">
                <Text className="text-gray-900 font-semibold">
  {crush.from_user?.profile?.display_name || "Someone"}
</Text>
                <Text className="text-gray-500 text-sm">
                  Liked you
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => crushBackMutation.mutate(crush.from_user.id)}
                disabled={crushBackMutation.isPending}
                className="w-11 h-11 rounded-full bg-rose-500 items-center justify-center"
              >
                <Heart size={20} color="#FFFFFF" fill="#FFFFFF" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-rose-100 items-center justify-center mb-4">
            <Heart size={40} color="#E11D48" />
          </View>
          <Text className="text-xl font-bold text-gray-900 text-center">
            No crushes yet
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            When someone likes you, they'll show up here.
          </Text>
        </View>
      )}
    </View>
  )
}