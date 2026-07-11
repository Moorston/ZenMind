import { z } from 'zod'

export const updateCourseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  category: z.enum(['breathing', 'body-scan', 'visualization', 'loving-kindness', 'mindfulness']).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  duration: z.number().int().positive().optional(),
  coverUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  instructorId: z.string().nullable().optional(),
  seriesId: z.string().nullable().optional(),
  orderInSeries: z.number().int().min(0).optional(),
})

export type UpdateCourseDto = z.infer<typeof updateCourseSchema>