import { useState } from "react"
import { TouchableOpacity, View, Text, Image, Alert, ActivityIndicator } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import { Camera } from "lucide-react-native"

interface Props {
  isPrimary?: boolean
}

export function PhotoUploadButton({ isPrimary = false }: Props) {
  const queryClient = useQueryClient()
  const [preview, setPreview] = useState<string | null>(null)

  const uploadMutation = useMutation({
    mutationFn: async (asset: ImagePicker.ImagePickerAsset) => {
      const formData = new FormData()
      formData.append("photo", {
        uri: asset.uri,
        name: asset.fileName || "photo.jpg",
        type: asset.mimeType || "image/jpeg",
      } as any)
      formData.append("is_primary", isPrimary ? "1" : "0")

      return api.post("/profile/photos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      setPreview(null)
    },
    onError: () => {
      Alert.alert("Upload failed", "Could not upload photo. Please try again.")
      setPreview(null)
    },
  })

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo library access to upload a picture.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    })

    if (!result.canceled && result.assets[0]) {
      setPreview(result.assets[0].uri)
      uploadMutation.mutate(result.assets[0])
    }
  }

  return (
    <TouchableOpacity
      onPress={pickImage}
      disabled={uploadMutation.isPending}
      className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center border-2 border-dashed border-gray-300"
    >
      {uploadMutation.isPending ? (
        <ActivityIndicator color="#E11D48" />
      ) : preview ? (
        <Image source={{ uri: preview }} className="w-full h-full rounded-full" />
      ) : (
        <View className="items-center">
          <Camera size={24} color="#9CA3AF" />
          <Text className="text-gray-400 text-xs mt-1">Add photo</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}