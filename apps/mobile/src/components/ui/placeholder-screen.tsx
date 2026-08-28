import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlaceholderScreen({ title }: { title: string }) {
  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center">
      <Text className="text-4xl mb-4">&#9829;</Text>
      <Text className="text-xl font-semibold text-gray-900">{title}</Text>
      <Text className="text-gray-500 mt-2">Coming soon</Text>
    </SafeAreaView>
  );
}
