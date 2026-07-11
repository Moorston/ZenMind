import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'
import { users } from './users'
import { courses } from './courses'

export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  hostId: text('host_id').notNull().references(() => users.id),
  courseId: text('course_id').references(() => courses.id),
  status: text('status', { enum: ['waiting', 'playing', 'ended'] as const }).notNull().default('waiting'),
  maxParticipants: integer('max_participants').notNull().default(10),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
})

export type Room = typeof rooms.$inferSelect
export type NewRoom = typeof rooms.$inferInsert

export const roomParticipants = sqliteTable('room_participants', {
  roomId: text('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role', { enum: ['host', 'participant'] as const }).notNull().default('participant'),
  joinedAt: text('joined_at').notNull().default(new Date().toISOString()),
}, (table) => ({
  pk: primaryKey({ columns: [table.roomId, table.userId] }),
}))

export type RoomParticipant = typeof roomParticipants.$inferSelect
export type NewRoomParticipant = typeof roomParticipants.$inferInsert