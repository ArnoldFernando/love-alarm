export type AlarmType = 'crush_nearby' | 'mutual_crush_nearby' | 'match_created' | 'system_notification'
export type AlarmStatus = 'detected' | 'triggered' | 'delivered' | 'acknowledged' | 'expired'

export interface Alarm {
  id: string
  user_id: string
  triggered_by_user_id: string
  type: AlarmType
  status: AlarmStatus
  triggered_at: string
  acknowledged_at?: string
  expires_at: string
  created_at: string
  updated_at: string
}
