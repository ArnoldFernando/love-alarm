import axios from "axios"
import Constants from "expo-constants"
import { useAuthStore } from "@/stores/auth"

const getBaseUrl = () => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim()
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "")
  }

  const hostUri = Constants.expoConfig?.hostUri // e.g. "192.168.20.199:8081"
  const host = hostUri?.split(":")[0]
  return host ? `http://${host}:8011/api/v1` : "http://localhost:8011/api/v1"
}

const API_BASE_URL = getBaseUrl()

console.log("🔥 API BASE URL:", API_BASE_URL)

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().token

  console.log(
    "API REQUEST:",
    config.method?.toUpperCase(),
    config.url,
    "HAS TOKEN:",
    !!token
  )

  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  r => r,
  error => {
    console.error(
      "API ERROR:",
      error.config?.method?.toUpperCase(),
      error.config?.url,
      error.response?.status,
      error.response?.data
    )

    if (error.response?.status === 401) {
  console.error("API 401 → NOT LOGGING OUT (DEBUG)")
}

    return Promise.reject(error)
  },
)