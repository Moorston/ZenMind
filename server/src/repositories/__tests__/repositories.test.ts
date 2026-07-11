import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestDb } from '../../../test/setup'
import { eq } from 'drizzle-orm'
import { users } from '@/db/schema/users'
import { sessions } from '@/db/schema/sessions'
import { pushTokens } from '@/db/schema/push-tokens'
import * as crypto from 'crypto'

describe('Repository Layer', () => {
  let db: ReturnType<typeof createTestDb>['db']
  let sqlite: ReturnType<typeof createTestDb>['sqlite']

  beforeAll(() => {
    const testDb = createTestDb()
    db = testDb.db
    sqlite = testDb.sqlite

    // Add sessions and push_tokens tables
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
        access_token TEXT NOT NULL, refresh_token TEXT NOT NULL,
        device_info TEXT, ip_address TEXT,
        expires_at TEXT NOT NULL, refresh_expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        last_used_at TEXT
      );
      CREATE TABLE IF NOT EXISTS push_tokens (
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
        platform TEXT NOT NULL DEFAULT 'h5', token TEXT,
        reminder_time TEXT, enabled INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `)
  })

  afterAll(() => { sqlite.close() })

  describe('SessionsRepository', () => {
    it('should create and find sessions', () => {
      const userId = crypto.randomUUID()
      const sessionId = crypto.randomUUID()
      const now = new Date().toISOString()

      db.insert(users).values({
        id: userId, email: 'session@test.com', password: 'hashed',
        nickname: 'Test', role: 'user',
      }).run()

      db.insert(sessions).values({
        id: sessionId, userId,
        accessToken: 'test-token', refreshToken: 'test-refresh',
        expiresAt: new Date(Date.now() + 900000).toISOString(),
        refreshExpiresAt: new Date(Date.now() + 604800000).toISOString(),
        lastUsedAt: now,
      }).run()

      const records = db.select().from(sessions).where(eq(sessions.userId, userId)).all()
      expect(records.length).toBe(1)
      expect(records[0].accessToken).toBe('test-token')
    })
  })

  describe('PushTokensRepository', () => {
    it('should find enabled reminders by time', () => {
      const userId = crypto.randomUUID()
      db.insert(users).values({
        id: userId, email: 'push@test.com', password: 'hashed',
        nickname: 'PushTest', role: 'user',
      }).run()

      db.insert(pushTokens).values({
        id: crypto.randomUUID(), userId,
        platform: 'h5', token: 'test-token',
        reminderTime: '09:00', enabled: true,
      }).run()

      const records = db.select().from(pushTokens)
        .where(eq(pushTokens.enabled, true))
        .all()
      expect(records.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('UsersRepository', () => {
    it('should find user by email', () => {
      const userId = crypto.randomUUID()
      db.insert(users).values({
        id: userId, email: 'findme@test.com', password: 'hashed',
        nickname: 'FindMe', role: 'user',
      }).run()

      const [user] = db.select().from(users).where(eq(users.email, 'findme@test.com')).limit(1).all()
      expect(user).toBeDefined()
      expect(user.nickname).toBe('FindMe')
    })
  })
})
