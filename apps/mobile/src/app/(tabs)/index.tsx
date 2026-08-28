import { View, Text, TouchableOpacity } from "react-native"
import { useAuthStore } from "@/stores/auth"

export default function HomeScreen() {
  const { user, clearAuth } = useAuthStore()

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <View className="items-center mb-8">
        <Text className="text-6xl text-rose-600 mb-3">&#9829;</Text>
        <Text className="text-2xl font-bold text-gray-900">Love Alarm</Text>
        <Text className="text-gray-500 mt-2">
          Welcome back, {user?.profile?.display_name || "User"}
        </Text>
      </View>

      <View className="bg-rose-50 rounded-2xl p-6 mb-4">
        <Text className="text-lg font-semibold text-rose-800 mb-1">Love Alarm Status</Text>
        <Text className="text-rose-600">You're ready.</Text>
      </View>

      <TouchableOpacity
        onPress={clearAuth}
        className="border border-gray-300 rounded-lg py-3 items-center mt-auto mb-8"
      >
        <Text className="text-gray-700 font-medium">Log Out</Text>
      </TouchableOpacity>
    </View>
  )
}
