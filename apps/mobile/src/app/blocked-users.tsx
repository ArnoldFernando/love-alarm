import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, Image } from "react-native"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import { router } from "expo-router"
import { ChevronLeft, UserX } from "lucide-react-native"

interface Block {
  id: string
  blocked_user: {
    id: string
    profile: { display_name: string; username: string }
    photos: { url: string }[]
  }
  created_at: string
}

export default function BlockedUsersScreen() {
  const queryClient = useQueryClient()

  const { data: blocks = [], isLoading } = useQuery<Block[]>({
    queryKey: ["blocks"],
    queryFn: async () => {
      const res = await api.get("/blocks")
      if (Array.isArray(res.data?.data)) return res.data.data
      if (Array.isArray(res.data?.data?.data)) return res.data.data.data
      return []
    },
  })

  const unblockMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/blocks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocks"] })
    },
    onError: () => {
      Alert.alert("Something went wrong", "Could not unblock. Try again.")
    },
  })

  const handleUnblock = (block: Block) => {
    Alert.alert(
      "Unblock user",
      `Unblock ${block.blocked_user?.profile?.display_name || "this user"}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Unblock", onPress: () => unblockMutation.mutate(block.id) },
      ]
    )
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-5 pt-12 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Blocked Users</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#E11D48" />
        </View>
      ) : (
        <FlatList
          data={blocks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View className="flex-row items-center bg-gray-50 rounded-2xl p-4 mb-3">
              {item.blocked_user?.photos?.[0]?.url ? (
                <Image
                  source={{ uri: item.blocked_user.photos[0].url }}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <View className="w-12 h-12 rounded-full bg-rose-100 items-center justify-center">
                  <Text style={{ fontSize: 22 }}>🙂</Text>
                </View>
              )}
              <View className="flex-1 ml-3">
                <Text className="text-gray-900 font-semibold">
                  {item.blocked_user?.profile?.display_name || "Unknown"}
                </Text>
                <Text className="text-gray-500 text-sm">
                  @{item.blocked_user?.profile?.username || "unknown"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleUnblock(item)}
                disabled={unblockMutation.isPending}
                className="bg-white border border-gray-200 rounded-full px-4 py-2"
              >
                <Text className="text-gray-700 text-sm font-medium">Unblock</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 px-8">
              <UserX size={40} color="#D1D5DB" />
              <Text className="text-gray-400 text-center mt-4">No blocked users</Text>
            </View>
          }
        />
      )}
    </View>
  )
}