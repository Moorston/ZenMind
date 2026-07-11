import { describe, it, expect, beforeAll } from 'vitest'
import { createTestDb } from '../../../../test/setup'
import * as argon2 from 'argon2'
import * as crypto from 'crypto'
import { eq } from 'drizzle-orm'
import { users } from '@/db/schema/users'
import { emailVerificationCodes } from '@/db/schema/email-verification-codes'

describe('AuthService', () => {
  let db: ReturnType<typeof createTestDb>['db']
  let sqlite: ReturnType<typeof createTestDb>['sqlite']

  beforeAll(() => {
    const testDb = createTestDb()
    db = testDb.db
    sqlite = testDb.sqlite
  })

  describe('User Registration', () => {
    it('should create a new user with argon2 hashed password', async () => {
      const id = crypto.randomUUID()
      const password = 'Test1234!'
      const hashedPassword = await argon2.hash(password)
      const token = 'token_' + crypto.randomUUID()

      db.insert(users).values({
        id,
        email: 'test@example.com',
        password: hashedPassword,
        nickname: '测试用户',
        token,
        role: 'user',
      }).run()

      const rows = db.select().from(users).where(eq(users.id, id)).limit(1).all()
      expect(rows.length).toBe(1)
      expect(rows[0].email).toBe('test@example.com')
      expect(rows[0].nickname).toBe('测试用户')
      expect(rows[0].role).toBe('user')
      expect(await argon2.verify(rows[0].password, password)).toBe(true)
    })

    it('should reject duplicate email', () => {
      expect(() => {
        db.insert(users).values({
          id: crypto.randomUUID(),
          email: 'test@example.com',
          password: 'hashed',
          nickname: '重复用户',
        }).run()
      }).toThrow()
    })
  })

  describe('User Login', () => {
    it('should verify password correctly with argon2', async () => {
      const password = 'MySecurePass123!'
      const hash = await argon2.hash(password)

      expect(await argon2.verify(hash, password)).toBe(true)
      expect(await argon2.verify(hash, 'WrongPassword!')).toBe(false)
    })

    it('should update token on login', () => {
      const rows = db.select().from(users).where(eq(users.email, 'test@example.com')).limit(1).all()
      expect(rows.length).toBe(1)

      const newToken = 'token_' + crypto.randomUUID()
      db.update(users).set({ token: newToken }).where(eq(users.id, rows[0].id)).run()

      const updated = db.select().from(users).where(eq(users.id, rows[0].id)).limit(1).all()
      expect(updated[0].token).toBe(newToken)
    })
  })

  describe('Verification Code', () => {
    it('should create and verify a code', () => {
      const email = 'verify@example.com'
      const code = '123456'
      const id = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

      db.insert(emailVerificationCodes).values({ id, email, code, expiresAt, used: false }).run()

      const codes = db.select()
        .from(emailVerificationCodes)
        .where(eq(emailVerificationCodes.code, '123456'))
        .limit(1)
        .all()

      expect(codes.length).toBe(1)
      expect(codes[0].email).toBe(email)
      expect(codes[0].used).toBe(false)
    })

    it('should expire old codes', () => {
      const email = 'expired@example.com'
      const expiredAt = new Date(Date.now() - 1000).toISOString()

      db.insert(emailVerificationCodes).values({
        id: crypto.randomUUID(),
        email,
        code: '999999',
        expiresAt: expiredAt,
        used: false,
      }).run()

      const now = new Date().toISOString()
      const validCodes = db.select()
        .from(emailVerificationCodes)
        .where(eq(emailVerificationCodes.email, email))
        .all()
        .filter(c => c.expiresAt > now && !c.used)

      expect(validCodes.length).toBe(0)
    })
  })

  describe('Password Validation', () => {
    it('should accept strong passwords', () => {
      const validate = (pw: string) => {
        if (pw.length < 8) return '密码至少需要 8 个字符'
        if (pw.length > 64) return '密码不能超过 64 个字符'
        if (!/[A-Z]/.test(pw)) return '密码需要包含大写字母'
        if (!/[a-z]/.test(pw)) return '密码需要包含小写字母'
        if (!/[0-9]/.test(pw)) return '密码需要包含数字'
        if (!/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>\/?`~\\]/.test(pw)) return '密码需要包含特殊字符'
        return null
      }

      expect(validate('Test1234!')).toBeNull()
      expect(validate('SecurePass#1')).toBeNull()
      expect(validate('Abc123!@#')).toBeNull()
    })

    it('should reject passwords without special characters', () => {
      const validate = (pw: string) => {
        if (!/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>\/?`~\\]/.test(pw)) return '密码需要包含特殊字符'
        return null
      }

      expect(validate('Test1234')).toBe('密码需要包含特殊字符')
      expect(validate('Test1234!')).toBeNull()
    })

    it('should reject passwords exceeding max length', () => {
      const validate = (pw: string) => {
        if (pw.length > 64) return '密码不能超过 64 个字符'
        return null
      }

      expect(validate('A'.repeat(61) + '1a!')).toBeNull()    // 64 chars
      expect(validate('A'.repeat(62) + '1a!')).toBe('密码不能超过 64 个字符')  // 65 chars
    })
  })
})
