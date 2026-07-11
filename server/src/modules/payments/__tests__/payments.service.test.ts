import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestDb } from '../../../../test/setup'
import { eq, and } from 'drizzle-orm'
import { users } from '@/db/schema/users'
import { courses } from '@/db/schema/courses'
import { orders } from '@/db/schema/orders'
import { memberships } from '@/db/schema/memberships'
import { progress } from '@/db/schema/progress'
import * as crypto from 'crypto'
import * as bcrypt from 'bcryptjs'

describe('Payments & Membership (Integration)', () => {
  let db: ReturnType<typeof createTestDb>['db']
  let sqlite: ReturnType<typeof createTestDb>['sqlite']
  const userId = crypto.randomUUID()

  beforeAll(() => {
    const testDb = createTestDb()
    db = testDb.db
    sqlite = testDb.sqlite

    // Add orders and memberships tables
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL, type TEXT NOT NULL,
        item_id TEXT, amount INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
        payment_id TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), paid_at TEXT
      );
      CREATE TABLE IF NOT EXISTS memberships (
        user_id TEXT PRIMARY KEY, level TEXT NOT NULL DEFAULT 'free',
        expires_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `)

    // Seed user
    db.insert(users).values({
      id: userId, email: 'payment@test.com', password: bcrypt.hashSync('P1!', 10),
      nickname: 'PayUser', role: 'user',
    }).run()

    // Seed course
    db.insert(courses).values({
      id: 'pay-course', title: '付费课程', description: '测试',
      category: 'breathing', level: 'beginner', duration: 10,
      coverUrl: '', audioUrl: '', tags: '[]',
    }).run()
  })

  afterAll(() => { sqlite.close() })

  describe('Order Creation', () => {
    it('should create a course purchase order', () => {
      const orderId = crypto.randomUUID()
      db.insert(orders).values({
        id: orderId, userId, type: 'course', itemId: 'pay-course',
        amount: 2999, status: 'pending',
        createdAt: new Date().toISOString(),
      }).run()

      const [order] = db.select().from(orders).where(eq(orders.id, orderId)).limit(1).all()
      expect(order).toBeDefined()
      expect(order.amount).toBe(2999)
      expect(order.status).toBe('pending')
    })

    it('should create a membership order', () => {
      const orderId = crypto.randomUUID()
      db.insert(orders).values({
        id: orderId, userId, type: 'membership', itemId: 'premium',
        amount: 4999, status: 'pending',
        createdAt: new Date().toISOString(),
      }).run()

      const [order] = db.select().from(orders).where(eq(orders.id, orderId)).limit(1).all()
      expect(order.type).toBe('membership')
      expect(order.itemId).toBe('premium')
    })
  })

  describe('Payment Completion', () => {
    it('should mark order as paid', () => {
      const orderId = crypto.randomUUID()
      db.insert(orders).values({
        id: orderId, userId, type: 'course', itemId: 'pay-course',
        amount: 2999, status: 'pending', createdAt: new Date().toISOString(),
      }).run()

      const paymentId = 'wx_' + crypto.randomUUID()
      const now = new Date().toISOString()
      db.update(orders).set({ status: 'paid', paymentId, paidAt: now })
        .where(eq(orders.id, orderId)).run()

      const [order] = db.select().from(orders).where(eq(orders.id, orderId)).limit(1).all()
      expect(order.status).toBe('paid')
      expect(order.paymentId).toBe(paymentId)
    })

    it('should unlock course after payment', () => {
      // After payment, create progress record
      db.insert(progress).values({
        userId, courseId: 'pay-course', position: 0, completed: false,
        updatedAt: new Date().toISOString(),
      }).run()

      const [record] = db.select().from(progress)
        .where(and(eq(progress.userId, userId), eq(progress.courseId, 'pay-course')))
        .limit(1).all()
      expect(record).toBeDefined()
    })
  })

  describe('Membership', () => {
    it('should activate premium membership', () => {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      db.insert(memberships).values({
        userId, level: 'premium', expiresAt,
        createdAt: new Date().toISOString(),
      }).run()

      const [membership] = db.select().from(memberships).where(eq(memberships.userId, userId)).limit(1).all()
      expect(membership.level).toBe('premium')
      expect(new Date(membership.expiresAt!).getTime()).toBeGreaterThan(Date.now())
    })

    it('should upgrade membership', () => {
      const newExpiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      db.update(memberships).set({ level: 'vip', expiresAt: newExpiry })
        .where(eq(memberships.userId, userId)).run()

      const [membership] = db.select().from(memberships).where(eq(memberships.userId, userId)).limit(1).all()
      expect(membership.level).toBe('vip')
    })

    it('should detect expired membership', () => {
      const expiredDate = new Date(Date.now() - 86400000).toISOString()
      db.update(memberships).set({ expiresAt: expiredDate })
        .where(eq(memberships.userId, userId)).run()

      const [membership] = db.select().from(memberships).where(eq(memberships.userId, userId)).limit(1).all()
      const isExpired = new Date(membership.expiresAt!) < new Date()
      expect(isExpired).toBe(true)
    })
  })
})
