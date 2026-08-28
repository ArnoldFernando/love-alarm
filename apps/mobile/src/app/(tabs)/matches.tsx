import { View, Text } from "react-native"

export default function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-xl text-gray-400">{title}</Text>
    </View>
  )
}

export default function Screen() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-xl text-gray-400">Coming Soon</Text>
    </View>
  )
}
