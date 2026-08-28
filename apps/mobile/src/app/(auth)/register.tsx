import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema } from "@lovealarm/shared-validation"
import { api } from "@/services/api"
import { router } from "expo-router"

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      password_confirmation: "",
      username: "",
      display_name: "",
    },
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const res = await api.post("/auth/register", data)
      if (res.data.success) {
        Alert.alert("Success", "Account created! Please verify your email.")
        router.replace("/login")
      }
    } catch (err: any) {
      Alert.alert("Registration Failed", err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-10">
      <View className="items-center mb-8">
        <Text className="text-4xl text-rose-600 mb-2">&#9829;</Text>
        <Text className="text-2xl font-bold text-gray-900">Create Account</Text>
      </View>

      {[
        { name: "username", label: "Username", placeholder: "johndoe" },
        { name: "display_name", label: "Display Name", placeholder: "John Doe" },
        { name: "email", label: "Email", placeholder: "you@example.com", autoCapitalize: "none", keyboardType: "email-address" },
        { name: "password", label: "Password", placeholder: "Min 8 chars, mixed case, number, symbol", secure: true },
        { name: "password_confirmation", label: "Confirm Password", placeholder: "Repeat password", secure: true },
      ].map((field) => (
        <View key={field.name} className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">{field.label}</Text>
          <Controller
            control={control}
            name={field.name as any}
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                placeholder={field.placeholder}
                autoCapitalize={field.autoCapitalize || "sentences"}
                keyboardType={field.keyboardType || "default"}
                secureTextEntry={field.secure || false}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors[field.name as keyof typeof errors] && (
            <Text className="text-red-500 text-xs mt-1">
              {(errors as any)[field.name]?.message}
            </Text>
          )}
        </View>
      ))}

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        className="bg-rose-600 rounded-lg py-3 items-center mt-2 mb-8"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">Create Account</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}
