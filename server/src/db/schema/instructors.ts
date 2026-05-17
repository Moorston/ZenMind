import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const instructors = sqliteTable('instructors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url').notNull(),
  bio: text('bio').notNull(),
  voiceType: text('voice_type').notNull().default('gentle'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
})

export type Instructor = typeof instructors.$inferSelect
export type NewInstructor = typeof instructors.$inferInsert
