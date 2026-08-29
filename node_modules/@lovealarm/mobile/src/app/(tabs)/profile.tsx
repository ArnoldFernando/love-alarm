"use client"

import { useState } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import { useAuthStore } from "@/stores/auth"
import { router } from "expo-router"
import {
  User,
  Heart,
  Bell,
  LogOut,
  ChevronRight,
  MapPin,
  GraduationCap,
  Mail,
  Settings,
} from "lucide-react-native"
import { AvatarUpload } from "@/components/AvatarUpload"
import { Edit3 } from "lucide-react-native"
export default function ProfileScreen() {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()
  const [showSettings, setShowSettings] = useState(false)

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/profile")
          console.log("PROFILE RESPONSE:", JSON.stringify(res.data))
    
      return res.data.data
    },
  })

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await api.get("/profile/settings")
      return res.data.data
    },
  })

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.put("/profile/settings", data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] })
    },
  })

 const handleLogout = () => {
  Alert.alert(
    "Log out",
    "Are you sure you want to log out?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          try {
            await api.post("/auth/logout")
          } catch (error) {
            // Server-side logout failed (e.g. token already expired) —
            // proceed with local logout anyway so the user isn't stuck.
            console.log("Logout API call failed, clearing local session anyway")
          } finally {
            logout()
          }
        },
      },
    ]
  )
}

  const profile = profileData
  const user = profileData

  const toggleSetting = (key: string, value: boolean) => {
    updateSettingsMutation.mutate({ [key]: value })
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-rose-500 px-5 pt-12 pb-20 rounded-b-3xl">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-2xl font-bold">Profile</Text>
          <TouchableOpacity onPress={() => setShowSettings(!showSettings)}>
            <Settings size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mx-5 -mt-14 bg-white rounded-3xl p-5 shadow-lg">
        <View className="items-center">
          <AvatarUpload
  currentUrl={
    profile?.photos?.find((p: any) => p.is_primary)?.url ||
    profile?.photos?.[0]?.url
  }
/>
          <Text className="text-xl font-bold text-gray-900 mt-3">
            {profile?.display_name || "Your Name"}
          </Text>
          <Text className="text-gray-500">@{profile?.username || "username"}</Text>
          <View className="flex-row items-center mt-1">
            <Mail size={14} color="#6B7280" />
            <Text className="text-gray-500 text-sm ml-1">{user?.email}</Text>
          </View>
        </View>

        <View className="flex-row justify-around mt-5 pt-5 border-t border-gray-100">
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-900">{profile?.age || "-"}</Text>
            <Text className="text-gray-500 text-xs">Age</Text>
          </View>
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-900 capitalize">
              {profile?.gender || "-"}
            </Text>
            <Text className="text-gray-500 text-xs">Gender</Text>
          </View>
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-900">
              {profile?.year_level || "-"}
            </Text>
            <Text className="text-gray-500 text-xs">Year</Text>
          </View>
        </View>
      </View>

       <TouchableOpacity
          onPress={() => router.push("/edit-profile")}
          className="flex-row items-center justify-center bg-gray-100 rounded-xl py-2.5 mt-4"
        >
          <Edit3 size={16} color="#374151" />
          <Text className="text-gray-700 ml-2 font-medium">Edit Profile</Text>
        </TouchableOpacity>

      <View className="mx-5 mt-4 bg-white rounded-2xl overflow-hidden shadow-sm">
        {profile?.school && (
          <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
            <MapPin size={18} color="#6B7280" />
            <Text className="text-gray-700 ml-3 flex-1">{profile.school}</Text>
          </View>
        )}
        {profile?.course && (
          <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
            <GraduationCap size={18} color="#6B7280" />
            <Text className="text-gray-700 ml-3 flex-1">{profile.course}</Text>
          </View>
        )}
        {profile?.bio && (
          <View className="px-5 py-4">
            <Text className="text-gray-500 text-sm mb-1">Bio</Text>
            <Text className="text-gray-700 leading-5">{profile.bio}</Text>
          </View>
        )}
      </View>

      {showSettings && settings && (
        <View className="mx-5 mt-4 bg-white rounded-2xl overflow-hidden shadow-sm">
          <Text className="px-5 pt-4 pb-2 text-gray-900 font-bold">Settings</Text>

          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <Heart size={18} color="#E11D48" />
              <Text className="text-gray-700 ml-3">Love Alarm</Text>
            </View>
            <Switch
              value={settings.love_alarm_enabled}
              onValueChange={(v) => toggleSetting("love_alarm_enabled", v)}
              trackColor={{ false: "#E5E7EB", true: "#FDA4AF" }}
              thumbColor={settings.love_alarm_enabled ? "#E11D48" : "#9CA3AF"}
            />
          </View>

          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <User size={18} color="#6B7280" />
              <Text className="text-gray-700 ml-3">Profile Visible</Text>
            </View>
            <Switch
              value={settings.profile_visible}
              onValueChange={(v) => toggleSetting("profile_visible", v)}
              trackColor={{ false: "#E5E7EB", true: "#FDA4AF" }}
              thumbColor={settings.profile_visible ? "#E11D48" : "#9CA3AF"}
            />
          </View>

          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <Bell size={18} color="#6B7280" />
              <Text className="text-gray-700 ml-3">Push Notifications</Text>
            </View>
            <Switch
              value={settings.push_notifications_enabled}
              onValueChange={(v) => toggleSetting("push_notifications_enabled", v)}
              trackColor={{ false: "#E5E7EB", true: "#FDA4AF" }}
              thumbColor={settings.push_notifications_enabled ? "#E11D48" : "#9CA3AF"}
            />
          </View>

          <View className="flex-row items-center justify-between px-5 py-4">
            <View className="flex-row items-center">
              <MapPin size={18} color="#6B7280" />
              <Text className="text-gray-700 ml-3">Background Detection</Text>
            </View>
            <Switch
              value={settings.background_detection_enabled}
              onValueChange={(v) => toggleSetting("background_detection_enabled", v)}
              trackColor={{ false: "#E5E7EB", true: "#FDA4AF" }}
              thumbColor={settings.background_detection_enabled ? "#E11D48" : "#9CA3AF"}
            />
          </View>
        </View>
      )}

      <View className="mx-5 mt-4 mb-8 bg-white rounded-2xl overflow-hidden shadow-sm">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center px-5 py-4"
        >
          <LogOut size={18} color="#EF4444" />
          <Text className="text-red-500 ml-3 font-medium flex-1">Log Out</Text>
          <ChevronRight size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}