import type { Profile } from './profile'
import type { UserSettings } from './settings'

export interface User {
  id: string
  email?: string
  role: 'user' | 'moderator' | 'admin'
  account_status: 'active' | 'suspended' | 'banned' | 'deleted' | 'pending_verification'
  email_verified: boolean
  email_verified_at?: string
  created_at: string
  updated_at: string
  profile?: Profile
  settings?: UserSettings
}

export interface LoginRequest {
  email: string
  password: string
  password_confirmation?: string
  device_name?: string
}

export interface RegisterRequest {
  email: string
  password: string
  password_confirmation: string
  username: string
  display_name?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
  }
}
