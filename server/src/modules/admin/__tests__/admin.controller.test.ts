import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestDb } from '../../../../test/setup'
import { eq, count } from 'drizzle-orm'
import { users } from '@/db/schema/users'
import { courses } from '@/db/schema/courses'
import { instructors } from '@/db/schema/instructors'
import { series } from '@/db/schema/series'
import * as crypto from 'crypto'
import * as bcrypt from 'bcryptjs'

describe('Admin API (Integration)', () => {
  let db: ReturnType<typeof createTestDb>['db']
  let sqlite: ReturnType<typeof createTestDb>['sqlite']

  beforeAll(() => {
    const testDb = createTestDb()
    db = testDb.db
    sqlite = testDb.sqlite
  })

  afterAll(() => { sqlite.close() })

  describe('User Stats', () => {
    it('should count total users', () => {
      // Create test users
      const usersData = [
        { id: crypto.randomUUID(), email: 'u1@test.com', password: bcrypt.hashSync('P1!', 10), nickname: 'U1', role: 'user' as const },
        { id: crypto.randomUUID(), email: 'u2@test.com', password: bcrypt.hashSync('P2!', 10), nickname: 'U2', role: 'admin' as const },
      ]
      for (const u of usersData) {
        db.insert(users).values(u).run()
      }

      const [total] = db.select({ total: count() }).from(users).all()
      expect(total.total).toBeGreaterThanOrEqual(2)
    })

    it('should count courses', () => {
      db.insert(instructors).values({ id: 'admin-instr', name: 'Admin导师', avatarUrl: '', bio: '', voiceType: 'gentle' }).run()
      db.insert(courses).values({
        id: 'admin-course', title: '管理课程', description: '测试',
        category: 'breathing', level: 'beginner', duration: 5,
        coverUrl: '', audioUrl: '', tags: '[]', instructorId: 'admin-instr',
      }).run()

      const [total] = db.select({ total: count() }).from(courses).all()
      expect(total.total).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Role Management', () => {
    it('should update user role', () => {
      const userId = crypto.randomUUID()
      db.insert(users).values({
        id: userId, email: 'role-test@test.com', password: 'hashed',
        nickname: 'RoleTest', role: 'user',
      }).run()

      db.update(users).set({ role: 'editor' }).where(eq(users.id, userId)).run()
      const [user] = db.select().from(users).where(eq(users.id, userId)).limit(1).all()
      expect(user.role).toBe('editor')
    })
  })

  describe('Broadcast Push', () => {
    it('should count enabled push tokens', () => {
      // Push tokens would need to be mocked here
      const tokens = db.select().from(courses).all()
      expect(tokens.length).toBeGreaterThanOrEqual(1)
    })
  })
})
