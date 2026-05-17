import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'
import { courses } from './courses'

export const series = sqliteTable('series', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  coverUrl: text('cover_url').notNull(),
  level: text('level', { enum: ['beginner', 'intermediate', 'advanced'] as const }).notNull().default('beginner'),
  estimatedDays: integer('estimated_days').notNull().default(7),
  isRecommended: integer('is_recommended', { mode: 'boolean' }).notNull().default(false),
  order: integer('order').notNull().default(0),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
})

export const seriesCourses = sqliteTable('series_courses', {
  seriesId: text('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  order: integer('order').default(0),
}, (table) => ({
  pk: primaryKey({ columns: [table.seriesId, table.courseId] }),
}))

export type Series = typeof series.$inferSelect
export type NewSeries = typeof series.$inferInsert
export type SeriesCourse = typeof seriesCourses.$inferSelect
export type NewSeriesCourse = typeof seriesCourses.$inferInsert
