import type { ImageSourcePropType } from "react-native"
import { resolveMediaUrl } from "./media"

export const DEFAULT_AVATAR: ImageSourcePropType = require("../../assets/images/default-avatar.png")

export function getAvatarSource(url?: string | null): ImageSourcePropType {
  const resolved = resolveMediaUrl(url)
  return resolved ? { uri: resolved } : DEFAULT_AVATAR
}