import { z } from 'zod'

export const createSeriesSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  coverUrl: z.string().url('Cover URL must be a valid URL'),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  estimatedDays: z.number().int().positive().default(7),
  isRecommended: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
})

export type CreateSeriesDto = z.infer<typeof createSeriesSchema>

export const updateSeriesSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  coverUrl: z.string().url().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimatedDays: z.number().int().positive().optional(),
  isRecommended: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
})

export type UpdateSeriesDto = z.infer<typeof updateSeriesSchema>

export const addCoursesSchema = z.object({
  courseIds: z.array(z.string()).min(1, 'At least one courseId is required'),
})

export type AddCoursesDto = z.infer<typeof addCoursesSchema>