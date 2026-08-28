import { z } from "zod"

export const blockCreateSchema = z.object({
  blocked_user_id: z.string().uuid("Invalid user ID"),
})

export type BlockCreateInput = z.infer<typeof blockCreateSchema>
