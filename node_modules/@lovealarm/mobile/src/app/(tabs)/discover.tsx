"use client"

import { useState } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  RefreshControl,
} from "react-native"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import { router } from "expo-router"
import { getAvatarSource } from "@/utils/avatar"
import {
  Heart,
  X,
  MapPin,
  GraduationCap,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react-native"

const { width } = Dimensions.get("window")

interface UserProfile {
  id: string
  profile: {
    username: string
    display_name: string
    age: number
    gender: string
    bio: string
    school: string
    course: string
  }
  photos: { id: string; url: string; is_primary: boolean }[]
}

export default function DiscoverScreen() {
  const queryClient = useQueryClient()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ["discover"] })
    setRefreshing(false)
  }
  const [filters, setFilters] = useState({
    min_age: "",
    max_age: "",
    gender: "",
    school: "",
  })

    const { data: users, isLoading, error } = useQuery({
    queryKey: ["discover", filters],
    queryFn: async () => {
      const params: any = {}
      if (filters.min_age) params.min_age = filters.min_age
      if (filters.max_age) params.max_age = filters.max_age
      if (filters.gender) params.gender = filters.gender
      if (filters.school) params.school = filters.school

      try {
        const res = await api.get("/discover", { params })
        console.log("DISCOVER RESPONSE:", JSON.stringify(res.data))
        return res.data.data?.data || []
      } catch (err: any) {
        console.log("DISCOVER ERROR:", JSON.stringify(err.response?.data || err.message))
        throw err
      }
    },
  })

  const crushMutation = useMutation({
    mutationFn: async (toUserId: string) => {
      return api.post("/crushes", { to_user_id: toUserId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discover"] })
      queryClient.invalidateQueries({ queryKey: ["crushes"] })
      queryClient.invalidateQueries({ queryKey: ["matches"] })
    },
  })

  const handleLike = () => {
    if (users && users[currentIndex]) {
      crushMutation.mutate(users[currentIndex].id)
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handleSkip = () => {
    setCurrentIndex((prev) => prev + 1)
  }

  const handleViewProfile = (userId: string) => {
    router.push(`/users/${userId}`)
  }

  const currentUser: UserProfile | undefined = users?.[currentIndex]
  const hasMore = users && currentIndex < users.length

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#E11D48" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-5 pt-12 pb-4 flex-row items-center justify-between border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Discover</Text>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal size={22} color="#374151" />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View className="bg-white px-5 py-4 border-b border-gray-100">
          <View className="flex-row gap-2 mb-3">
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">Min Age</Text>
              <TouchableOpacity
                onPress={() => setFilters({ ...filters, min_age: filters.min_age === "18" ? "" : "18" })}
                className={`px-3 py-2 rounded-full items-center ${
                  filters.min_age === "18" ? "bg-rose-500" : "bg-gray-100"
                }`}
              >
                <Text className={filters.min_age === "18" ? "text-white" : "text-gray-700"}>
                  18+
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">Gender</Text>
              {["male", "female", "other"].map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() =>
                    setFilters({ ...filters, gender: filters.gender === g ? "" : g })
                  }
                  className={`px-3 py-2 rounded-full items-center mb-1 ${
                    filters.gender === g ? "bg-rose-500" : "bg-gray-100"
                  }`}
                >
                  <Text className={filters.gender === g ? "text-white" : "text-gray-700"}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setFilters({ min_age: "", max_age: "", gender: "", school: "" })}
          >
            <Text className="text-rose-500 text-sm text-center">Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerClassName="flex-1 items-center justify-center px-5"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {hasMore && currentUser ? (
          <View className="w-full">
            <TouchableOpacity
              onPress={() => handleViewProfile(currentUser.id)}
              activeOpacity={0.95}
              className="bg-white rounded-3xl overflow-hidden shadow-lg"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <View className="relative">
                <Image
                   source={getAvatarSource(
                    currentUser.photos?.find((p) => p.is_primary)?.url ||
                    currentUser.photos?.[0]?.url
                      )}
                  className="w-full h-96"
                  resizeMode="cover"
                />
                <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                  <Text className="text-white text-2xl font-bold">
                    {currentUser.profile?.display_name || "Unknown"},
                    <Text className="text-white/90"> {currentUser.profile?.age || "?"}</Text>
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <MapPin size={14} color="#FFFFFF" />
                    <Text className="text-white/80 text-sm ml-1">
                      {currentUser.profile?.school || "No school listed"}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="p-5">
                {currentUser.profile?.course && (
                  <View className="flex-row items-center mb-2">
                    <GraduationCap size={16} color="#6B7280" />
                    <Text className="text-gray-600 ml-2">{currentUser.profile.course}</Text>
                  </View>
                )}
                {currentUser.profile?.bio && (
                  <Text className="text-gray-600 text-sm leading-5" numberOfLines={3}>
                    {currentUser.profile.bio}
                  </Text>
                )}
                <View className="flex-row items-center mt-3">
                  <Text className="text-rose-500 text-sm font-medium">Tap to view full profile</Text>
                  <ChevronDown size={16} color="#E11D48" />
                </View>
              </View>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-6 gap-4">
              <TouchableOpacity
                onPress={handleSkip}
                className="w-16 h-16 rounded-full bg-white items-center justify-center shadow-md"
                style={{ elevation: 3 }}
              >
                <X size={28} color="#EF4444" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLike}
                disabled={crushMutation.isPending}
                className="w-20 h-20 rounded-full bg-rose-500 items-center justify-center shadow-lg"
                style={{ elevation: 5 }}
              >
                <Heart size={32} color="#FFFFFF" fill="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="items-center px-8">
            <View className="w-24 h-24 rounded-full bg-rose-100 items-center justify-center mb-4">
              <Heart size={40} color="#E11D48" />
            </View>
            <Text className="text-xl font-bold text-gray-900 text-center">
              No more profiles
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              You have seen all available profiles. Check back later!
            </Text>
            <TouchableOpacity
              onPress={() => setCurrentIndex(0)}
              className="mt-6 bg-rose-500 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-medium">Start Over</Text>
            </TouchableOpacity>
          </View>
                )}
      </ScrollView>
    </View>
  )
}