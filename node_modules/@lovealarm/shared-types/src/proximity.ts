export interface ProximityUpdate {
  latitude: number
  longitude: number
  accuracy?: number
}

export interface ProximityCheckResult {
  nearby: boolean
  alarm_triggered?: boolean
  distance_meters?: number
}
