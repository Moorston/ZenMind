import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  nickname: text('nickname').notNull(),
  token: text('token'),
  tokenExpiresAt: text('token_expires_at'),
  role: text('role', { enum: ['admin', 'editor', 'user'] as const }).notNull().default('user'),
  wechatOpenId: text('wechat_openid'),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
}, (table) => ({
  tokenIdx: index('idx_users_token').on(table.token),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
