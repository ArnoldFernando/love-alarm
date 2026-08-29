import { z } from "zod"

export const crushCreateSchema = z.object({
  to_user_id: z.string().uuid("Invalid user ID"),
})

export type CrushCreateInput = z.infer<typeof crushCreateSchema>
