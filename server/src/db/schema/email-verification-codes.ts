import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const emailVerificationCodes = sqliteTable('email_verification_codes', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  code: text('code').notNull(),
  expiresAt: text('expires_at').notNull(),
  used: integer('used', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
})

export type EmailVerificationCode = typeof emailVerificationCodes.$inferSelect
export type NewEmailVerificationCode = typeof emailVerificationCodes.$inferInsert
