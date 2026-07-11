import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestDb } from '../setup'
import { eq } from 'drizzle-orm'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'
import { users } from '@/db/schema/users'
import { emailVerificationCodes } from '@/db/schema/email-verification-codes'
import { courses } from '@/db/schema/courses'
import { instructors } from '@/db/schema/instructors'
import { series } from '@/db/schema/series'
import { seriesCourses } from '@/db/schema/series'
import { progress } from '@/db/schema/progress'

describe('Auth API (Integration)', () => {
  let db: ReturnType<typeof createTestDb>['db']
  let sqlite: ReturnType<typeof createTestDb>['sqlite']

  beforeAll(() => {
    const testDb = createTestDb()
    db = testDb.db
    sqlite = testDb.sqlite
  })

  afterAll(() => {
    sqlite.close()
  })

  describe('Verification Code', () => {
    it('should create a verification code', () => {
      const email = 'test@example.com'
      const code = '123456'
      const id = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

      db.insert(emailVerificationCodes).values({ id, email, code, expiresAt, used: false }).run()

      const [record] = db.select()
        .from(emailVerificationCodes)
        .where(eq(emailVerificationCodes.email, email))
        .limit(1)
        .all()

      expect(record).toBeTruthy()
      expect(record.code).toBe(code)
      expect(record.used).toBe(false)
    })

    it('should expire old codes correctly', () => {
      const expiredAt = new Date(Date.now() - 1000).toISOString()
      const validAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

      db.insert(emailVerificationCodes).values({
        id: crypto.randomUUID(), email: 'expiry@test.com', code: '111111',
        expiresAt: expiredAt, used: false,
      }).run()
      db.insert(emailVerificationCodes).values({
        id: crypto.randomUUID(), email: 'expiry@test.com', code: '222222',
        expiresAt: validAt, used: false,
      }).run()

      const now = new Date().toISOString()
      const validCodes = db.select()
        .from(emailVerificationCodes)
        .where(eq(emailVerificationCodes.email, 'expiry@test.com'))
        .all()
        .filter(c => c.expiresAt > now && !c.used)

      expect(validCodes.length).toBe(1)
      expect(validCodes[0].code).toBe('222222')
    })
  })

  describe('User Registration', () => {
    it('should create user with hashed password', () => {
      const id = crypto.randomUUID()
      const password = 'Test1234!'
      const hashedPassword = bcrypt.hashSync(password, 10)

      db.insert(users).values({
        id, email: 'register@test.com', password: hashedPassword,
        nickname: 'Test User', token: `token-${crypto.randomUUID()}`,
        role: 'user',
      }).run()

      const [user] = db.select().from(users).where(eq(users.id, id)).limit(1).all()
      expect(user.email).toBe('register@test.com')
      expect(bcrypt.compareSync(password, user.password)).toBe(true)
    })

    it('should reject duplicate email', () => {
      expect(() => {
        db.insert(users).values({
          id: crypto.randomUUID(), email: 'register@test.com',
          password: 'hash', nickname: 'Duplicate',
        }).run()
      }).toThrow()
    })
  })

  describe('User Login', () => {
    it('should verify password correctly', () => {
      const password = 'MyPass123!'
      const hash = bcrypt.hashSync(password, 10)

      expect(bcrypt.compareSync(password, hash)).toBe(true)
      expect(bcrypt.compareSync('WrongPass!', hash)).toBe(false)
    })

    it('should update token on login', () => {
      const [user] = db.select().from(users).where(eq(users.email, 'register@test.com')).limit(1).all()
      expect(user).toBeTruthy()

      const newToken = `token-${crypto.randomUUID()}`
      db.update(users).set({ token: newToken }).where(eq(users.id, user.id)).run()

      const [updated] = db.select().from(users).where(eq(users.id, user.id)).limit(1).all()
      expect(updated.token).toBe(newToken)
    })
  })

  describe('WeChat Login', () => {
    it('should handle wechat user creation', () => {
      const openId = `openid-${crypto.randomUUID()}`
      const id = crypto.randomUUID()

      db.insert(users).values({
        id, email: `wechat_${openId}@test.com`, password: '',
        nickname: `WeChatUser`, token: `token-${crypto.randomUUID()}`,
        role: 'user', wechatOpenId: openId,
      }).run()

      const [user] = db.select().from(users).where(eq(users.wechatOpenId, openId)).limit(1).all()
      expect(user).toBeTruthy()
      expect(user.nickname).toBe('WeChatUser')
    })
  })
})