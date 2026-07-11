import { z } from 'zod'
import { ApiProperty } from '@nestjs/swagger'

export const createCourseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['breathing', 'body-scan', 'visualization', 'loving-kindness', 'mindfulness']),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  duration: z.number().int().positive('Duration must be positive'),
  coverUrl: z.string().url('Cover URL must be a valid URL'),
  audioUrl: z.string().url('Audio URL must be a valid URL'),
  tags: z.array(z.string()).default([]),
  instructorId: z.string().nullable().optional(),
  seriesId: z.string().nullable().optional(),
  orderInSeries: z.number().int().min(0).optional(),
})

export class CreateCourseDto {
  @ApiProperty({ required: false, description: '课程 ID（可选）' }) id?: string
  @ApiProperty({ description: '课程标题' }) title!: string
  @ApiProperty({ description: '课程描述' }) description!: string
  @ApiProperty({ enum: ['breathing', 'body-scan', 'visualization', 'loving-kindness', 'mindfulness'] }) category!: string
  @ApiProperty({ enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' }) level!: string
  @ApiProperty({ description: '课程时长（分钟）' }) duration!: number
  @ApiProperty() coverUrl!: string
  @ApiProperty() audioUrl!: string
  @ApiProperty({ default: [] }) tags?: string[]
  @ApiProperty({ required: false }) instructorId?: string | null
  @ApiProperty({ required: false }) seriesId?: string | null
  @ApiProperty({ required: false }) orderInSeries?: number
}