import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { instructors } from './instructors'
import { series } from './series'

export const courses = sqliteTable('courses', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category', {
    enum: ['breathing', 'body-scan', 'visualization', 'loving-kindness', 'mindfulness'] as const,
  }).notNull(),
  level: text('level', { enum: ['beginner', 'intermediate', 'advanced'] as const }).notNull().default('beginner'),
  duration: integer('duration').notNull(),
  coverUrl: text('cover_url').notNull(),
  audioUrl: text('audio_url').notNull(),
  tags: text('tags').notNull().default('[]'),
  instructorId: text('instructor_id').references(() => instructors.id, { onDelete: 'set null' }),
  seriesId: text('series_id').references(() => series.id, { onDelete: 'cascade' }),
  orderInSeries: integer('order_in_series').default(0),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
})

export type Course = typeof courses.$inferSelect
export type NewCourse = typeof courses.$inferInsert
