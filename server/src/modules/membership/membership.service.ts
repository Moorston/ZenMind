import { Injectable } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import { DRIZZLE } from '@/modules/db/db.module'
import { memberships } from '@/db/schema/memberships'

@Injectable()
export class MembershipService {
  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<any>) {}

  async getMembership(userId: string) {
    const [membership] = await this.db.select()
      .from(memberships)
      .where(eq(memberships.userId, userId))
      .limit(1)
      .all()

    if (!membership) return { userId, level: 'free', expiresAt: null }

    if (membership.expiresAt && new Date(membership.expiresAt) < new Date()) {
      return { userId, level: 'free', expiresAt: membership.expiresAt, expired: true }
    }

    return membership
  }

  async getLevel(userId: string): Promise<'free' | 'premium' | 'vip'> {
    const membership = await this.getMembership(userId)
    return (membership as any).level || 'free'
  }

  async hasAccess(userId: string, courseId: string): Promise<boolean> {
    const level = await this.getLevel(userId)
    if (level === 'vip') return true
    if (level === 'premium') return true
    return false // free users need individual purchase
  }
}