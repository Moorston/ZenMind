import { z } from 'zod'
import { ApiProperty } from '@nestjs/swagger'

export const courseQuerySchema = z.object({
  category: z.enum(['breathing', 'body-scan', 'visualization', 'loving-kindness', 'mindfulness']).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  seriesId: z.string().optional(),
  instructorId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
  includeDeleted: z.coerce.boolean().optional().default(false),
})

export class CourseQueryDto {
  @ApiProperty({ enum: ['breathing', 'body-scan', 'visualization', 'loving-kindness', 'mindfulness'], required: false }) category?: string
  @ApiProperty({ enum: ['beginner', 'intermediate', 'advanced'], required: false }) level?: string
  @ApiProperty({ required: false }) seriesId?: string
  @ApiProperty({ required: false }) instructorId?: string
  @ApiProperty({ required: false }) search?: string
  @ApiProperty({ required: false, default: 1 }) page?: number
  @ApiProperty({ required: false, default: 20 }) pageSize?: number
  @ApiProperty({ required: false, default: false, description: '是否包含已归档课程（仅管理员）' }) includeDeleted?: boolean
}
