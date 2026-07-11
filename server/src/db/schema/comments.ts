import { sqliteTable, text, integer, index, primaryKey } from 'drizzle-orm/sqlite-core'
import { users } from './users'
import { posts } from './posts'

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
}, (table) => ({
  postIdx: index('idx_comments_post').on(table.postId),
}))

export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert

export const likes = sqliteTable('likes', {
  userId: text('user_id').notNull().references(() => users.id),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.postId] }),
}))

export type Like = typeof likes.$inferSelect
export type NewLike = typeof likes.$inferInsert

export const follows = sqliteTable('follows', {
  followerId: text('follower_id').notNull().references(() => users.id),
  followingId: text('following_id').notNull().references(() => users.id),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
}, (table) => ({
  pk: primaryKey({ columns: [table.followerId, table.followingId] }),
}))

export type Follow = typeof follows.$inferSelect
export type NewFollow = typeof follows.$inferInsert