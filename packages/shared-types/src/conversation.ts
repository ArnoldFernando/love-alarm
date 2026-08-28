export interface Conversation {
  id: string
  match_id: string
  last_message_at?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read_at?: string
  deleted_at?: string
  created_at: string
  updated_at: string
}
