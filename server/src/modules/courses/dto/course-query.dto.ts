import { z } from 'zod'

export const courseQuerySchema = z.object({
  category: z.enum(['breathing', 'body-scan', 'visualization', 'loving-kindness', 'mindfulness']).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  seriesId: z.string().optional(),
  instructorId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
})

export type CourseQueryDto = z.infer<typeof courseQuerySchema>
