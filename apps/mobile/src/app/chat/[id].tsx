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
import { getAvatarSource } from "@/utils/avatar"
import { LinearGradient } from "expo-linear-gradient"
import { ArrowLeft, Send, Check, CheckCheck, Heart, Smile } from "lucide-react-native"
import EmojiPicker, { type EmojiType } from "rn-emoji-keyboard"

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
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
      const raw = res.data.data?.data || []
      return [...raw].sort(
        (a: Message, b: Message) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
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

  const handlePickEmoji = (emojiObject: EmojiType) => {
    setMessageText((prev) => prev + emojiObject.emoji)
  }

  const otherUser = conversation?.other_user

  const otherUserAvatar = getAvatarSource(
    otherUser?.photos?.find((p: any) => p.is_primary)?.url || otherUser?.photos?.[0]?.url
  )

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.sender_id === user?.id

    return (
      <View
        className={`mb-3 max-w-[80%] ${
          isMine ? "self-end ml-auto" : "self-start mr-auto"
        }`}
      >
        {isMine ? (
          <LinearGradient
            colors={["#FB7185", "#E11D48"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-4 py-2.5 rounded-2xl rounded-br-sm"
          >
            <Text className="text-base leading-6 text-white">{item.content}</Text>
          </LinearGradient>
        ) : (
          <View
            className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white border border-rose-50"
            style={{
              shadowColor: "#E11D48",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 3,
              elevation: 1,
            }}
          >
            <Text className="text-base leading-6 text-gray-800">{item.content}</Text>
          </View>
        )}
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
      className="flex-1 bg-rose-50"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <LinearGradient
        colors={["#FDA4AF", "#FB7185"]}
        className="pt-12 pb-4 px-5 flex-row items-center rounded-b-3xl"
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View className="p-0.5 bg-white/30 rounded-full">
          <Image source={otherUserAvatar} className="w-10 h-10 rounded-full border-2 border-white" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-white font-bold text-base">
            {otherUser?.profile?.display_name || "Chat"}
          </Text>
          <Text className="text-white/80 text-xs">
            {otherUser?.profile?.username ? `@${otherUser.profile.username}` : ""}
          </Text>
        </View>
        <Heart size={18} color="#FFFFFF" fill="#FFFFFF" opacity={0.85} />
      </LinearGradient>

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
              <View className="w-16 h-16 rounded-full bg-rose-100 items-center justify-center mb-4">
                <Heart size={28} color="#E11D48" fill="#E11D48" />
              </View>
              <Text className="text-gray-500 text-center text-base">
                No messages yet. Say hello! 💕
              </Text>
            </View>
          }
        />
      )}

      <View className="bg-white px-4 py-3 flex-row items-center border-t border-rose-100">
        <TouchableOpacity
          onPress={() => setShowEmojiPicker(true)}
          className="mr-2 w-9 h-9 items-center justify-center"
        >
          <Smile size={24} color="#FDA4AF" />
        </TouchableOpacity>
        <TextInput
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Say something sweet..."
          placeholderTextColor="#FDA4AF"
          multiline
          maxLength={1000}
          className="flex-1 bg-rose-50 rounded-full px-4 py-2.5 text-gray-900 text-base max-h-24"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!messageText.trim() || sendMutation.isPending}
          className="ml-3 w-10 h-10 rounded-full items-center justify-center overflow-hidden"
        >
          {messageText.trim() ? (
            <LinearGradient
              colors={["#FB7185", "#E11D48"]}
              className="w-10 h-10 items-center justify-center"
            >
              <Send size={18} color="#FFFFFF" />
            </LinearGradient>
          ) : (
            <View className="w-10 h-10 bg-gray-200 items-center justify-center rounded-full">
              <Send size={18} color="#9CA3AF" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <EmojiPicker
  open={showEmojiPicker}
  onClose={() => setShowEmojiPicker(false)}
  onEmojiSelected={handlePickEmoji}
  allowMultipleSelections
  theme={{
    backdrop: "#00000055",
    knob: "#FB7185",
    container: "#FFFFFF",
    header: "#E11D48",
    skinTonesContainer: "#FFF1F2",
    category: {
      icon: "#FDA4AF",
      iconActive: "#E11D48",
      container: "#FFFFFF",
      containerActive: "#FFF1F2",
    },
  }}
/>
    </KeyboardAvoidingView>
  )
}