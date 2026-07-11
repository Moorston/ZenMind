import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core'
import { courses } from './courses'

export const progress = sqliteTable('progress', {
  userId: text('user_id').notNull(),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  position: integer('position').notNull().default(0),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  completedAt: text('completed_at'),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.courseId] }),
  userIdx: index('idx_progress_user').on(table.userId),
}))

export type Progress = typeof progress.$inferSelect
export type NewProgress = typeof progress.$inferInsert
