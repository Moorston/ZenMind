import { Injectable } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { eq, and, lt } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import { DRIZZLE } from '@/modules/db/db.module'
import { sessions, type NewSession, type Session } from '@/db/schema/sessions'
import * as crypto from 'crypto'

@Injectable()
export class SessionsRepository {
  constructor(@Inject(DRIZZLE) protected readonly db: BetterSQLite3Database<any>) {}

  create(data: NewSession): void {
    this.db.insert(sessions).values(data).run()
  }

  findByAccessToken(token: string): Session | null {
    const [row] = this.db.select().from(sessions).where(eq(sessions.accessToken, token)).limit(1).all()
    return row || null
  }

  findByRefreshToken(token: string, userId: string): Session | null {
    const [row] = this.db.select().from(sessions)
      .where(and(eq(sessions.refreshToken, token), eq(sessions.userId, userId)))
      .limit(1).all()
    return row || null
  }

  findByUser(userId: string) {
    return this.db.select({
      id: sessions.id,
      accessToken: sessions.accessToken,
      expiresAt: sessions.expiresAt,
      deviceInfo: sessions.deviceInfo,
      ipAddress: sessions.ipAddress,
      createdAt: sessions.createdAt,
      lastUsedAt: sessions.lastUsedAt,
    })
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .all()
  }

  delete(id: string): boolean {
    const result = this.db.delete(sessions).where(eq(sessions.id, id)).run()
    return result.changes > 0
  }

  deleteByUserId(userId: string): number {
    const result = this.db.delete(sessions).where(eq(sessions.userId, userId)).run()
    return result.changes
  }

  deleteByAccessToken(accessToken: string): boolean {
    const result = this.db.delete(sessions).where(eq(sessions.accessToken, accessToken)).run()
    return result.changes > 0
  }

  cleanupExpired(): number {
    const now = new Date().toISOString()
    const result = this.db.delete(sessions).where(lt(sessions.refreshExpiresAt, now)).run()
    return result.changes
  }

  cleanupInactive(): number {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const result = this.db.delete(sessions).where(lt(sessions.lastUsedAt, thirtyDaysAgo)).run()
    return result.changes
  }

  generateId(): string {
    return crypto.randomUUID()
  }
}