import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const memberships = sqliteTable('memberships', {
  userId: text('user_id').notNull().references(() => users.id),
  level: text('level', { enum: ['free', 'premium', 'vip'] as const }).notNull().default('free'),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId] }),
}))

export type Membership = typeof memberships.$inferSelect
export type NewMembership = typeof memberships.$inferInsert