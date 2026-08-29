import { useState } from "react"
import { View, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import { Camera } from "lucide-react-native"
import { getAvatarSource } from "@/utils/avatar"

interface Props {
  currentUrl?: string
}

export function AvatarUpload({ currentUrl }: Props) {
  const queryClient = useQueryClient()
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  const uploadMutation = useMutation({
    mutationFn: async (asset: ImagePicker.ImagePickerAsset) => {
      const formData = new FormData()
      formData.append("photo", {
        uri: asset.uri,
        name: asset.fileName || "photo.jpg",
        type: asset.mimeType || "image/jpeg",
      } as any)
      formData.append("is_primary", "1")

      return api.post("/profile/photos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
    onError: () => {
      Alert.alert("Upload failed", "Could not upload photo. Please try again.")
      setLocalPreview(null)
    },
  })

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo library access to change your picture.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    })

    if (!result.canceled && result.assets[0]) {
      setLocalPreview(result.assets[0].uri)
      uploadMutation.mutate(result.assets[0])
    }
  }


// ...inside the component, replace the displayUrl line:
const source = localPreview ? { uri: localPreview } : getAvatarSource(currentUrl)
  return (
    <TouchableOpacity onPress={pickImage} disabled={uploadMutation.isPending} className="relative">
      <Image source={source} className="w-24 h-24 rounded-full" />
      <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-rose-500 items-center justify-center border-2 border-white">
        {uploadMutation.isPending ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Camera size={14} color="#FFFFFF" />
        )}
      </View>
    </TouchableOpacity>
  )
}