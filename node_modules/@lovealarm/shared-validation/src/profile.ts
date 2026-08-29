import { z } from "zod"

export const profileUpdateSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  gender: z.enum(["male", "female", "non_binary", "prefer_not_to_say"]).optional(),
  school: z.string().max(200).optional(),
  course: z.string().max(200).optional(),
  year_level: z.enum(["1st", "2nd", "3rd", "4th", "5th"]).optional(),
  date_of_birth: z.string().datetime().optional(),
  interests: z.array(z.string().uuid()).optional(),
})

export const usernameSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
