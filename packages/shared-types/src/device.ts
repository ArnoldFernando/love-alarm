export interface Device {
  id: string
  user_id: string
  fcm_token: string
  platform: 'ios' | 'android' | 'web'
  device_model?: string
  os_version?: string
  app_version?: string
  last_active_at?: string
  created_at: string
  updated_at: string
}
