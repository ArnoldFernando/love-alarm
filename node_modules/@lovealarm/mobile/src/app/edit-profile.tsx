import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import { router } from "expo-router"
import { ChevronLeft } from "lucide-react-native"

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Non-binary", value: "non_binary" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
]

const YEAR_OPTIONS = [
  { label: "1st Year", value: "1st" },
  { label: "2nd Year", value: "2nd" },
  { label: "3rd Year", value: "3rd" },
  { label: "4th Year", value: "4th" },
  { label: "5th Year", value: "5th" },
]

export default function EditProfileScreen() {
  const queryClient = useQueryClient()

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/profile")
      return res.data.data
    },
  })

  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [school, setSchool] = useState("")
  const [course, setCourse] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState<string | null>(null)
  const [yearLevel, setYearLevel] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  if (profileData && !initialized) {
    setDisplayName(profileData.display_name || "")
    setBio(profileData.bio || "")
    setSchool(profileData.school || "")
    setCourse(profileData.course || "")
    setGender(profileData.gender || null)
    setYearLevel(profileData.year_level || null)
    setDateOfBirth(profileData.date_of_birth || "")
    setInitialized(true)
  }

  const updateMutation = useMutation({
    mutationFn: async () => {
      return api.put("/profile", {
        display_name: displayName || null,
        bio: bio || null,
        school: school || null,
        course: course || null,
        gender: gender,
        year_level: yearLevel,
        date_of_birth: dateOfBirth || null,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      Alert.alert("Success", "Profile updated!")
      router.back()
    },
    onError: (err: any) => {
      Alert.alert(
        "Update Failed",
        err.response?.data?.message || "Something went wrong"
      )
    },
  })

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#E11D48" />
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-row items-center px-5 pt-12 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Edit Profile</Text>
      </View>

      <View className="px-5 pt-5">
        <Text className="text-sm font-medium text-gray-700 mb-1">
          Display Name
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 mb-4"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your display name"
          maxLength={100}
        />

        <Text className="text-sm font-medium text-gray-700 mb-1">
          Date of Birth
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 mb-4"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="YYYY-MM-DD"
        />

        <Text className="text-sm font-medium text-gray-700 mb-2">
          Gender
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {GENDER_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setGender(opt.value)}
              className={`px-4 py-2 rounded-full border ${
                gender === opt.value
                  ? "bg-rose-600 border-rose-600"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={
                  gender === opt.value ? "text-white" : "text-gray-700"
                }
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-sm font-medium text-gray-700 mb-2">
          Year Level
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {YEAR_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setYearLevel(opt.value)}
              className={`px-4 py-2 rounded-full border ${
                yearLevel === opt.value
                  ? "bg-rose-600 border-rose-600"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={
                  yearLevel === opt.value ? "text-white" : "text-gray-700"
                }
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-sm font-medium text-gray-700 mb-1">
          School
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 mb-4"
          value={school}
          onChangeText={setSchool}
          placeholder="Your school"
          maxLength={200}
        />

        <Text className="text-sm font-medium text-gray-700 mb-1">
          Course
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 mb-4"
          value={course}
          onChangeText={setCourse}
          placeholder="Your course"
          maxLength={200}
        />

        <Text className="text-sm font-medium text-gray-700 mb-1">
          Bio
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 mb-6"
          value={bio}
          onChangeText={setBio}
          placeholder="Tell others about yourself"
          multiline
          numberOfLines={4}
          maxLength={500}
        />

        <TouchableOpacity
          onPress={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className="bg-rose-600 rounded-lg py-3 items-center mb-10"
        >
          {updateMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}