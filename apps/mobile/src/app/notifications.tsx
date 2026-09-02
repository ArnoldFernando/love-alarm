import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from "react-native"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import { router } from "expo-router"
import { ChevronLeft, Bell, Heart, MessageCircle, Trash2, CheckCheck } from "lucide-react-native"

interface Notification {
  id: string
  type: string
  title: string
  body: string
  data: any
  read_at: string | null
  created_at: string
}

const getIcon = (type: string) => {
  if (type.includes("match")) return Heart
  if (type.includes("message")) return MessageCircle
  return Bell
}

export default function NotificationsScreen() {
  const queryClient = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/notifications")
      if (Array.isArray(res.data?.data)) return res.data.data
      if (Array.isArray(res.data?.data?.data)) return res.data.data.data
      return []
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: async () => api.post("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] })
    },
  })

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] })
    },
  })

  const renderItem = ({ item }: { item: Notification }) => {
    const Icon = getIcon(item.type)
    const isUnread = !item.read_at

    return (
      <TouchableOpacity
        onPress={() => isUnread && markReadMutation.mutate(item.id)}
        className={`flex-row items-start px-5 py-4 border-b border-gray-100 ${
          isUnread ? "bg-rose-50" : "bg-white"
        }`}
      >
        <View className="w-10 h-10 rounded-full bg-rose-100 items-center justify-center mr-3">
          <Icon size={18} color="#E11D48" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold">{item.title}</Text>
          <Text className="text-gray-500 text-sm mt-0.5">{item.body}</Text>
          <Text className="text-gray-400 text-xs mt-1">
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity onPress={() => deleteMutation.mutate(item.id)} className="p-1">
          <Trash2 size={16} color="#9CA3AF" />
        </TouchableOpacity>
        {isUnread && <View className="w-2 h-2 rounded-full bg-rose-500 ml-2 mt-1" />}
      </TouchableOpacity>
    )
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-5 pt-12 pb-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Notifications</Text>
        </View>
        <TouchableOpacity
          onPress={() => markAllReadMutation.mutate()}
          disabled={markAllReadMutation.isPending}
        >
          <CheckCheck size={20} color="#E11D48" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#E11D48" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 px-8">
              <Bell size={40} color="#D1D5DB" />
              <Text className="text-gray-400 text-center mt-4">No notifications yet</Text>
            </View>
          }
        />
      )}
    </View>
  )
}