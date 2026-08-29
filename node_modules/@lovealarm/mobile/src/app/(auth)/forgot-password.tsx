import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native"
import { Link } from "expo-router"
import { api } from "@/services/api"

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    if (!email) return
    setLoading(true)
    setError("")
    try {
      const res = await api.post("/auth/forgot-password", { email })
      if (res.data.success) {
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Request failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-white px-6 pt-20">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Reset Password</Text>
      <Text className="text-gray-500 mb-6">Enter your email to receive a reset link.</Text>

      {success ? (
        <View className="bg-green-50 p-4 rounded-lg mb-4">
          <Text className="text-green-700">Check your email for reset instructions.</Text>
        </View>
      ) : null}

      {error ? (
        <View className="bg-red-50 p-3 rounded-lg mb-4">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      ) : null}

      <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 mb-4"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />

      <TouchableOpacity
        onPress={onSubmit}
        disabled={loading}
        className="bg-rose-600 rounded-lg py-3 items-center"
      >
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold">Send Reset Link</Text>}
      </TouchableOpacity>

      <View className="flex-row justify-center mt-6">
        <Link href="/login" asChild>
          <TouchableOpacity>
            <Text className="text-rose-600">Back to Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}
