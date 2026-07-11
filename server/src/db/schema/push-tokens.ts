import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

export const pushTokens = sqliteTable('push_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  platform: text('platform', { enum: ['weapp', 'h5', 'expo'] as const }).notNull(),
  token: text('token'),
  reminderTime: text('reminder_time'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(false),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
}, (table) => ({
  enabledReminderIdx: index('idx_push_tokens_enabled_reminder').on(table.enabled, table.reminderTime),
}))

export type PushToken = typeof pushTokens.$inferSelect
export type NewPushToken = typeof pushTokens.$inferInsert