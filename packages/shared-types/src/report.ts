export type ReportReason = 'spam' | 'harassment' | 'fake_account' | 'impersonation' | 'inappropriate_behavior' | 'inappropriate_profile' | 'other'
export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed'

export interface Report {
  id: string
  reporter_id: string
  reported_user_id: string
  reason: ReportReason
  description?: string
  status: ReportStatus
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
}
