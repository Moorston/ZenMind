import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  deviceInfo: text('device_info'),
  ipAddress: text('ip_address'),
  expiresAt: text('expires_at').notNull(),
  refreshExpiresAt: text('refresh_expires_at').notNull(),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  lastUsedAt: text('last_used_at'),
}, (table) => ({
  userIdx: index('idx_sessions_user').on(table.userId),
  accessTokenIdx: index('idx_sessions_access_token').on(table.accessToken),
  refreshTokenIdx: index('idx_sessions_refresh_token').on(table.refreshToken),
}))

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
