import { Injectable } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import { DRIZZLE } from '@/modules/db/db.module'
import { orders, type Order } from '@/db/schema/orders'
import { memberships } from '@/db/schema/memberships'
import { progress } from '@/db/schema/progress'
import * as crypto from 'crypto'

@Injectable()
export class PaymentsService {
  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<any>) {}

  async createOrder(userId: string, type: 'course' | 'membership', itemId: string): Promise<Order> {
    const amount = await this.calculateAmount(type, itemId)
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const [order] = await this.db.insert(orders).values({
      id,
      userId,
      type,
      itemId,
      amount,
      status: 'pending',
      createdAt: now,
    }).returning()

    return order
  }

  async getOrders(userId: string): Promise<Order[]> {
    return this.db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(orders.createdAt)
      .all()
  }

  async handlePaymentCallback(orderId: string, paymentId: string): Promise<Order | null> {
    const now = new Date().toISOString()

    const [updated] = await this.db.update(orders)
      .set({ status: 'paid', paymentId, paidAt: now })
      .where(eq(orders.id, orderId))
      .returning()

    if (!updated) return null

    // Unlock content
    await this.unlockContent(updated)

    return updated
  }

  private async unlockContent(order: Order) {
    if (order.type === 'course' && order.itemId) {
      // Create progress record to grant access
      const now = new Date().toISOString()
      await this.db.insert(progress).values({
        userId: order.userId,
        courseId: order.itemId,
        position: 0,
        completed: false,
        updatedAt: now,
      }).onConflictDoNothing().run()
    } else if (order.type === 'membership') {
      const duration: Record<string, number> = { premium: 30, vip: 90 }
      const days = duration[order.itemId || 'premium'] || 30
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

      await this.db.insert(memberships).values({
        userId: order.userId,
        level: (order.itemId as any) || 'premium',
        expiresAt,
        createdAt: new Date().toISOString(),
      }).onConflictDoUpdate({
        target: [memberships.userId],
        set: { level: (order.itemId as any) || 'premium', expiresAt },
      }).run()
    }
  }

  private async calculateAmount(type: string, itemId: string): Promise<number> {
    // 价格硬编码，生产环境应从数据库或配置读取
    if (type === 'course') return 2999 // ¥29.99
    if (type === 'membership') {
      if (itemId === 'vip') return 8999 // ¥89.99
      return 2999 // ¥29.99 premium
    }
    return 0
  }
}