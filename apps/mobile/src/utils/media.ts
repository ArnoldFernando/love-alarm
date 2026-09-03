// utils/media.ts
import { api } from "@/services/api"

export function resolveMediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined
  if (/^https?:\/\//i.test(path)) return path // already absolute, leave as-is

  const apiBase = api.defaults.baseURL ?? ""
  const origin = apiBase.replace(/\/api\/v1\/?$/, "") // strip trailing /api/v1 to get bare host
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`
}