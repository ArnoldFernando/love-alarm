import axios from "axios"
import Constants from "expo-constants"
import { useAuthStore } from "@/stores/auth"

const getBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri // e.g. "192.168.20.199:8081"
  const host = hostUri?.split(":")[0]
  return host ? `http://${host}:8011/api/v1` : "http://localhost:8011/api/v1"
}

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})