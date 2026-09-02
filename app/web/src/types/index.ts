export interface User {
  id: string
  email: string
  role: 'user' | 'moderator' | 'admin'
  account_status: 'active' | 'suspended' | 'banned' | 'deleted'
  email_verified_at: string | null
  created_at: string
  updated_at: string
  profile?: UserProfile
}

export interface UserProfile {
  id: string
  user_id: string
  username: string
  display_name: string
  bio: string | null
  date_of_birth: string
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  avatar_url: string | null
  location_city: string | null
  location_country: string | null
  is_verified: boolean
  settings?: ProfileSettings
  created_at: string
  updated_at: string
}

export interface ProfileSettings {
  love_alarm_enabled: boolean
  discovery_enabled: boolean
  show_distance: boolean
  show_age: boolean
  max_distance_km: number
  min_age: number
  max_age: number
  interested_in: string[]
  background_detection_enabled: boolean
  notification_match: boolean
  notification_message: boolean
  notification_alarm: boolean
  notification_crush_nearby: boolean
}

export interface AdminStats {
  users: {
    total: number
    active: number
    new_today: number
    suspended: number
    banned: number
  }
  matches: {
    total: number
    today: number
  }
  alarms: {
    total: number
    today: number
  }
  reports: {
    total: number
    pending: number
    under_review: number
    resolved: number
  }
  online_users: number
}

export interface Match {
  id: string
  user1_id: string
  user2_id: string
  matched_at: string
  chat_enabled: boolean
  user1?: User
  user2?: User
}

export interface Alarm {
  id: string
  sender_id: string
  recipient_id: string
  triggered_at: string
  distance_meters: number
  sender?: User
  recipient?: User
}

export interface Report {
  id: string
  reporter_id: string
  reported_user_id: string
  reason: string
  description: string | null
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed'
  resolution_note: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  reporter?: User
  reported_user?: User
  reviewer?: User
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  target_type: string | null
  target_id: string | null
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, any> | null
  created_at: string
  user?: User
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  password_confirmation: string
  username: string
  display_name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
}

export interface AuthResponse {
  user: User
  token: string
}
