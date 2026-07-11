import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { users } from './users'
import { courses } from './courses'

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  courseId: text('course_id').references(() => courses.id),
  content: text('content').notNull(),
  type: text('type', { enum: ['reflection', 'checkin', 'share'] as const }).notNull().default('reflection'),
  likesCount: integer('likes_count').notNull().default(0),
  commentsCount: integer('comments_count').notNull().default(0),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
}, (table) => ({
  userIdx: index('idx_posts_user').on(table.userId),
  createdAtIdx: index('idx_posts_created').on(table.createdAt),
}))

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert