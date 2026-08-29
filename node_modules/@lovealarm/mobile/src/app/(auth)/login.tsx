import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema } from "@lovealarm/shared-validation"
import { api } from "@/services/api"
import { useAuthStore } from "@/stores/auth"
import { router } from "expo-router"

export default function LoginScreen() {
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const res = await api.post("/auth/login", data)
      console.log("LOGIN RESPONSE:", JSON.stringify(res.data))
      if (res.data.success) {
  await setAuth(res.data.data.token, res.data.data.user)
  router.replace("/(tabs)")
}
    } catch (err: any) {
      Alert.alert("Login Failed", err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-white px-6 pt-20">
      <View className="items-center mb-10">
        <Text className="text-5xl text-rose-600 mb-2">&#9829;</Text>
        <Text className="text-2xl font-bold text-gray-900">Love Alarm</Text>
        <Text className="text-gray-500 mt-1">Sign in to continue</Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.email && (
            <Text className="text-red-500 text-xs mt-1">{errors.email.message}</Text>
          )}
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                placeholder="Your password"
                secureTextEntry
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.password && (
            <Text className="text-red-500 text-xs mt-1">{errors.password.message}</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          className="bg-rose-600 rounded-lg py-3 items-center mt-4"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/register")}
          className="items-center mt-4"
        >
          <Text className="text-rose-600 text-sm">
            Don't have an account?{" "}<Text className="font-semibold">Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
