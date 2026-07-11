import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
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
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
}, (table) => ({
  categoryIdx: index('idx_courses_category').on(table.category),
  levelIdx: index('idx_courses_level').on(table.level),
  instructorIdx: index('idx_courses_instructor').on(table.instructorId),
  deletedIdx: index('idx_courses_deleted').on(table.isDeleted),
}))

export type Course = typeof courses.$inferSelect
export type NewCourse = typeof courses.$inferInsert
