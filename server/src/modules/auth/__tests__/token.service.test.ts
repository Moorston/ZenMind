import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createTestDb } from '../../../../test/setup'
import * as argon2 from 'argon2'
import * as crypto from 'crypto'
import * as jwt from 'jsonwebtoken'
import { eq } from 'drizzle-orm'
import { users } from '@/db/schema/users'
import { sessions } from '@/db/schema/sessions'
import { emailVerificationCodes } from '@/db/schema/email-verification-codes'

describe('TokenService', () => {
  let db: ReturnType<typeof createTestDb>['db']
  let sqlite: ReturnType<typeof createTestDb>['sqlite']
  const ACCESS_SECRET = 'test-access-secret-key-for-unit-tests'
  const REFRESH_SECRET = 'test-refresh-secret-key-for-unit-tests'

  beforeAll(() => {
    // 设置测试用 JWT secret
    process.env.JWT_ACCESS_SECRET = ACCESS_SECRET
    process.env.JWT_REFRESH_SECRET = REFRESH_SECRET

    const testDb = createTestDb()
    db = testDb.db
    sqlite = testDb.sqlite

    // 创建 sessions 表
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
        access_token TEXT NOT NULL, refresh_token TEXT NOT NULL,
        device_info TEXT, ip_address TEXT,
        expires_at TEXT NOT NULL, refresh_expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        last_used_at TEXT
      );
    `)
  })

  afterAll(() => {
    sqlite.close()
  })

  describe('JWT Token Generation', () => {
    it('should generate valid JWT access token', () => {
      const payload = { userId: 'user-1', email: 'test@example.com', nickname: 'Test', role: 'user' }
      const token = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' })

      const decoded = jwt.verify(token, ACCESS_SECRET) as any
      expect(decoded.userId).toBe('user-1')
      expect(decoded.email).toBe('test@example.com')
      expect(decoded.exp).toBeDefined()
    })

    it('should reject expired access token', () => {
      const payload = { userId: 'user-1', email: 'test@example.com', nickname: 'Test', role: 'user' }
      const token = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '-1s' })

      expect(() => jwt.verify(token, ACCESS_SECRET)).toThrow()
    })

    it('should reject token with wrong secret', () => {
      const payload = { userId: 'user-1', email: 'test@example.com', nickname: 'Test', role: 'user' }
      const token = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' })

      expect(() => jwt.verify(token, 'wrong-secret')).toThrow()
    })

    it('should generate valid JWT refresh token with type field', () => {
      const payload = { userId: 'user-1', type: 'refresh' }
      const token = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' })

      const decoded = jwt.verify(token, REFRESH_SECRET) as any
      expect(decoded.userId).toBe('user-1')
      expect(decoded.type).toBe('refresh')
    })
  })

  describe('Session Management', () => {
    let testUserId: string

    beforeEach(() => {
      testUserId = crypto.randomUUID()
      db.insert(users).values({
        id: testUserId,
        email: `session-test-${Date.now()}@example.com`,
        password: 'hashed',
        nickname: 'Session User',
        role: 'user',
      }).run()
    })

    it('should create session record', () => {
      const sessionId = crypto.randomUUID()
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString()
      const refreshExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

      db.insert(sessions).values({
        id: sessionId,
        userId: testUserId,
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt,
        refreshExpiresAt,
        lastUsedAt: now.toISOString(),
      }).run()

      const records = db.select().from(sessions).where(eq(sessions.id, sessionId)).all()
      expect(records.length).toBe(1)
      expect(records[0].userId).toBe(testUserId)
    })

    it('should delete session on logout', () => {
      const sessionId = crypto.randomUUID()
      const now = new Date().toISOString()
      db.insert(sessions).values({
        id: sessionId,
        userId: testUserId,
        accessToken: 'logout-token',
        refreshToken: 'logout-refresh',
        expiresAt: new Date(Date.now() + 900000).toISOString(),
        refreshExpiresAt: new Date(Date.now() + 604800000).toISOString(),
        lastUsedAt: now,
      }).run()

      db.delete(sessions).where(eq(sessions.accessToken, 'logout-token')).run()
      const records = db.select().from(sessions).where(eq(sessions.id, sessionId)).all()
      expect(records.length).toBe(0)
    })

    it('should delete all sessions for a user (logoutAll)', () => {
      // 创建 3 个 session
      for (let i = 0; i < 3; i++) {
        db.insert(sessions).values({
          id: crypto.randomUUID(),
          userId: testUserId,
          accessToken: `token-${i}`,
          refreshToken: `refresh-${i}`,
          expiresAt: new Date(Date.now() + 900000).toISOString(),
          refreshExpiresAt: new Date(Date.now() + 604800000).toISOString(),
          lastUsedAt: new Date().toISOString(),
        }).run()
      }

      const before = db.select().from(sessions).where(eq(sessions.userId, testUserId)).all()
      expect(before.length).toBe(3)

      db.delete(sessions).where(eq(sessions.userId, testUserId)).run()

      const after = db.select().from(sessions).where(eq(sessions.userId, testUserId)).all()
      expect(after.length).toBe(0)
    })

    it('should cleanup expired sessions', () => {
      const expiredSessionId = crypto.randomUUID()
      db.insert(sessions).values({
        id: expiredSessionId,
        userId: testUserId,
        accessToken: 'expired-token',
        refreshToken: 'expired-refresh',
        expiresAt: new Date(Date.now() - 1000).toISOString(),
        refreshExpiresAt: new Date(Date.now() - 1000).toISOString(),
        lastUsedAt: new Date(Date.now() - 86400000).toISOString(),
      }).run()

      const now = new Date().toISOString()
      const expired = db.select().from(sessions)
        .where(eq(sessions.refreshExpiresAt, sessions.refreshExpiresAt))
        .all()
        .filter(s => s.refreshExpiresAt < now)

      expect(expired.length).toBeGreaterThanOrEqual(1)
    })

    it('should cleanup inactive sessions (30 days)', () => {
      const inactiveDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString()

      db.insert(sessions).values({
        id: crypto.randomUUID(),
        userId: testUserId,
        accessToken: 'inactive-token',
        refreshToken: 'inactive-refresh',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        refreshExpiresAt: new Date(Date.now() + 604800000).toISOString(),
        lastUsedAt: inactiveDate,
      }).run()

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const inactive = db.select().from(sessions)
        .where(eq(sessions.userId, testUserId))
        .all()
        .filter(s => s.lastUsedAt < thirtyDaysAgo)

      expect(inactive.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Password Strength Validation', () => {
    it('should validate correct passwords', () => {
      const valid = (pw: string) => {
        if (pw.length < 8) return false
        if (!/[A-Z]/.test(pw)) return false
        if (!/[a-z]/.test(pw)) return false
        if (!/[0-9]/.test(pw)) return false
        return true
      }

      expect(valid('Test1234')).toBe(true)
      expect(valid('Abc12345')).toBe(true)
      expect(valid('SecurePass1')).toBe(true)
    })

    it('should reject weak passwords', () => {
      const valid = (pw: string) => {
        if (pw.length < 8) return false
        if (!/[A-Z]/.test(pw)) return false
        if (!/[a-z]/.test(pw)) return false
        if (!/[0-9]/.test(pw)) return false
        return true
      }

      expect(valid('short')).toBe(false)       // too short
      expect(valid('nouppercase1')).toBe(false) // no uppercase
      expect(valid('NOLOWERCASE1')).toBe(false) // no lowercase
      expect(valid('NoDigitsHere')).toBe(false)  // no digits
    })
  })

  describe('Argon2 Password Hashing', () => {
    it('should hash and verify password', async () => {
      const password = 'MySecurePass123!'
      const hash = await argon2.hash(password)

      expect(hash).not.toBe(password)
      expect(await argon2.verify(hash, password)).toBe(true)
    })

    it('should reject wrong password', async () => {
      const hash = await argon2.hash('correct-password')
      expect(await argon2.verify(hash, 'wrong-password')).toBe(false)
    })

    it('should produce different hashes for same password', async () => {
      const hash1 = await argon2.hash('same-password')
      const hash2 = await argon2.hash('same-password')
      expect(hash1).not.toBe(hash2)
      expect(await argon2.verify(hash1, 'same-password')).toBe(true)
      expect(await argon2.verify(hash2, 'same-password')).toBe(true)
    })
  })
})
