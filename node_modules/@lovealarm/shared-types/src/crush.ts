export interface Crush {
  id: string
  from_user_id: string
  to_user_id: string
  created_at: string
  updated_at: string
}

export interface Match {
  id: string
  user_one_id: string
  user_two_id: string
  matched_at: string
  created_at: string
  updated_at: string
}
