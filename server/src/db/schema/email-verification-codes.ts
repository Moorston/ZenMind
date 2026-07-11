import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

export const emailVerificationCodes = sqliteTable('email_verification_codes', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  code: text('code').notNull(),
  expiresAt: text('expires_at').notNull(),
  used: integer('used', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
}, (table) => ({
  emailCodeIdx: index('idx_email_codes_email').on(table.email, table.code, table.used),
}))

export type EmailVerificationCode = typeof emailVerificationCodes.$inferSelect
export type NewEmailVerificationCode = typeof emailVerificationCodes.$inferInsert
