import type { ImageSourcePropType } from "react-native"

export const DEFAULT_AVATAR: ImageSourcePropType = require("../../assets/images/default-avatar.png")

export function getAvatarSource(url?: string | null): ImageSourcePropType {
  return url ? { uri: url } : DEFAULT_AVATAR
}