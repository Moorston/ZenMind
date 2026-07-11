import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core'

export const tokenBlacklist = sqliteTable('token_blacklist', {
  id: text('id').primaryKey(),
  token: text('token').notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
}, (table) => ({
  tokenIdx: index('idx_blacklist_token').on(table.token),
  expiresIdx: index('idx_blacklist_expires').on(table.expiresAt),
}))

export type TokenBlacklist = typeof tokenBlacklist.$inferSelect
export type NewTokenBlacklist = typeof tokenBlacklist.$inferInsert
