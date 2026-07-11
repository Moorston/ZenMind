import { z } from 'zod'

export const createInstructorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(100),
  avatarUrl: z.string().url('Avatar URL must be a valid URL'),
  bio: z.string().min(1, 'Bio is required'),
  voiceType: z.string().default('gentle'),
})

export type CreateInstructorDto = z.infer<typeof createInstructorSchema>

export const updateInstructorSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().min(1).optional(),
  voiceType: z.string().optional(),
})

export type UpdateInstructorDto = z.infer<typeof updateInstructorSchema>