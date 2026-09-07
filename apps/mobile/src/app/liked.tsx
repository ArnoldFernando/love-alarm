import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"
import { router } from "expo-router"
import { ChevronLeft, Heart } from "lucide-react-native"

export default function LikedScreen() {
  const { data: crushes, isLoading } = useQuery({
  queryKey: ["crushes-sent"],
  queryFn: async () => {
    const res = await api.get("/crushes")
    return res.data.data?.data || []
  },
})

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-5 pt-12 pb-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Liked</Text>
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
              onPress={() => router.push(`/users/${crush.to_user.id}`)}
              className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm"
            >
             {crush.to_user?.photos?.[0]?.url ? (
  <Image
    source={{ uri: crush.to_user.photos[0].url }}
    className="w-14 h-14 rounded-full"
  />
) : (
  <View className="w-14 h-14 rounded-full bg-rose-100 items-center justify-center">
    <Text style={{ fontSize: 28 }}>🙂</Text>
  </View>
)}
              <View className="flex-1 ml-3">
                <Text className="text-gray-900 font-semibold">
  {crush.to_user?.profile?.display_name || "Someone"}
</Text>
                <Text className="text-gray-500 text-sm">You liked them</Text>
              </View>
              <Heart size={20} color="#E11D48" fill="#E11D48" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-rose-100 items-center justify-center mb-4">
            <Heart size={40} color="#E11D48" />
          </View>
          <Text className="text-xl font-bold text-gray-900 text-center">
            No likes sent yet
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            Go to Discover to start liking people.
          </Text>
        </View>
      )}
    </View>
  )
}