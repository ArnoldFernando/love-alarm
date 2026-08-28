import { z } from "zod"

export const messageCreateSchema = z.object({
  content: z.string().min(1).max(2000),
  conversation_id: z.string().uuid(),
})

export type MessageCreateInput = z.infer<typeof messageCreateSchema>
