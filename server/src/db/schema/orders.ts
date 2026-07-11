import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type', { enum: ['course', 'membership'] as const }).notNull(),
  itemId: text('item_id'),
  amount: integer('amount').notNull(),
  status: text('status', { enum: ['pending', 'paid', 'refunded', 'cancelled'] as const }).notNull().default('pending'),
  paymentId: text('payment_id'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  paidAt: text('paid_at'),
})

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert