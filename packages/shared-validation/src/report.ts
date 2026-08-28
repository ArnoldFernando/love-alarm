import { z } from "zod"

export const reportCreateSchema = z.object({
  reported_user_id: z.string().uuid("Invalid user ID"),
  reason: z.enum([
    "spam",
    "harassment",
    "fake_account",
    "impersonation",
    "inappropriate_behavior",
    "inappropriate_profile",
    "other",
  ]),
  description: z.string().max(2000).optional(),
})

export type ReportCreateInput = z.infer<typeof reportCreateSchema>
