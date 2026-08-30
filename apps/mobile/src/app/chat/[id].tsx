"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import { useAuthStore } from "@/stores/auth"
import { ArrowLeft, Send, Check, CheckCheck } from "lucide-react-native"

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  read_at: string | null
  sender?: {
    id: string
    profile?: {
      display_name: string
      username: string
    }
    photos?: { url: string }[]
  }
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [messageText, setMessageText] = useState("")
  const flatListRef = useRef<FlatList>(null)

  const { data: conversation } = useQuery({
    queryKey: ["conversation", id],
    queryFn: async () => {
      const res = await api.get(`/conversations/${id}`)
      return res.data.data
    },
  })

  const { data: messages, isLoading } = useQuery({
  queryKey: ["messages", id],
  queryFn: async () => {
    const res = await api.get(`/conversations/${id}/messages`)
    return res.data.data?.data || []
  },
})

 const sendMutation = useMutation({
  mutationFn: async (content: string) => {
    return api.post(`/conversations/${id}/messages`, { content })
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["messages", id] })
    queryClient.invalidateQueries({ queryKey: ["conversations"] })
    queryClient.invalidateQueries({ queryKey: ["matches"] })
    setMessageText("")
  },
  onError: (err: any) => {
    Alert.alert("Failed to send", err.response?.data?.message || "Something went wrong")
  },
})

  const readMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/conversations/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", id] })
    },
  })

  useEffect(() => {
    readMutation.mutate()
  }, [id])

  const handleSend = () => {
    if (messageText.trim()) {
      sendMutation.mutate(messageText.trim())
    }
  }

  const otherUser = conversation?.users?.find((u: any) => u.id !== user?.id)

  const renderMessage = ({ item }: { item: Message }) => {
  const isMine = item.sender_id === user?.id
  console.log("DEBUG:", { messageSender: item.sender_id, myId: user?.id, isMine })

    return (
      <View
        className={`mb-3 max-w-[80%] ${
          isMine ? "self-end ml-auto" : "self-start mr-auto"
        }`}
      >
        <View
          className={`px-4 py-2.5 rounded-2xl ${
            isMine
              ? "bg-rose-500 rounded-br-sm"
              : "bg-white rounded-bl-sm"
          }`}
          style={
            !isMine
              ? {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }
              : undefined
          }
        >
          <Text className={`text-sm leading-5 ${isMine ? "text-white" : "text-gray-800"}`}>
            {item.content}
          </Text>
        </View>
        <View className={`flex-row items-center mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
          <Text className="text-gray-400 text-xs">
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {isMine && (
            <View className="ml-1">
              {item.read_at ? (
                <CheckCheck size={14} color="#E11D48" />
              ) : (
                <Check size={14} color="#9CA3AF" />
              )}
            </View>
          )}
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View className="bg-white px-5 pt-12 pb-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Image
          source={{
            uri:
              otherUser?.photo_url ||
              "https://via.placeholder.com/100/E5E7EB/9CA3AF?text=?",
          }}
          className="w-10 h-10 rounded-full"
        />
        <View className="ml-3 flex-1">
          <Text className="text-gray-900 font-bold text-base">
            {otherUser?.display_name || "Chat"}
          </Text>
          <Text className="text-gray-500 text-xs">
            {otherUser?.username ? `@${otherUser.username}` : ""}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-5 py-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-gray-400 text-center">
                No messages yet. Say hello!
              </Text>
            </View>
          }
        />
      )}

      <View className="bg-white px-4 py-3 flex-row items-center border-t border-gray-100">
        <TextInput
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={1000}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-gray-900 text-sm max-h-24"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!messageText.trim() || sendMutation.isPending}
          className={`ml-3 w-10 h-10 rounded-full items-center justify-center ${
            messageText.trim() ? "bg-rose-500" : "bg-gray-200"
          }`}
        >
          <Send size={18} color={messageText.trim() ? "#FFFFFF" : "#9CA3AF"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}