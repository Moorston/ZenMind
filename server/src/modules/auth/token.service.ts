import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { eq, lt } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import * as jwt from 'jsonwebtoken'
import * as crypto from 'crypto'
import { DRIZZLE } from '@/modules/db/db.module'
import { tokenBlacklist } from '@/db/schema/token-blacklist'
import { users } from '@/db/schema/users'
import { SessionsRepository } from '@/repositories/sessions.repository'

const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY_DAYS = 7

export interface JwtPayload {
  userId: string
  email: string
  nickname: string
  role: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresAt: string
  refreshExpiresAt: string
}

@Injectable()
export class TokenService implements OnModuleInit {
  private readonly logger = new Logger(TokenService.name)
  private accessSecret: string = ''
  private refreshSecret: string = ''
  private blacklistCache: Map<string, number> = new Map() // token -> expiresAt timestamp

  constructor(
    @Inject(DRIZZLE) private db: BetterSQLite3Database<any>,
    private readonly sessionsRepo: SessionsRepository,
  ) {}

  onModuleInit() {
    this.accessSecret = process.env.JWT_ACCESS_SECRET || ''
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || ''
    if (!this.accessSecret) throw new Error('JWT_ACCESS_SECRET environment variable must be set')
    if (!this.refreshSecret) throw new Error('JWT_REFRESH_SECRET environment variable must be set')
    this.loadBlacklistCache()
  }

  generateTokenPair(payload: JwtPayload, deviceInfo?: string, ipAddress?: string): TokenPair {
    const now = new Date()
    const accessExpiresAt = new Date(now.getTime() + 15 * 60 * 1000)
    const refreshExpiresAt = new Date(now.getTime() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

    const accessToken = jwt.sign(payload, this.accessSecret, { expiresIn: ACCESS_TOKEN_EXPIRY })
    const refreshToken = jwt.sign({ userId: payload.userId, type: 'refresh' }, this.refreshSecret, { expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` })

    this.sessionsRepo.create({
      id: crypto.randomUUID(),
      userId: payload.userId,
      accessToken,
      refreshToken,
      deviceInfo: deviceInfo || null,
      ipAddress: ipAddress || null,
      expiresAt: accessExpiresAt.toISOString(),
      refreshExpiresAt: refreshExpiresAt.toISOString(),
      lastUsedAt: now.toISOString(),
    })

    return {
      accessToken, refreshToken,
      expiresAt: accessExpiresAt.toISOString(),
      refreshExpiresAt: refreshExpiresAt.toISOString(),
    }
  }

  verifyAccessToken(token: string): JwtPayload | null {
    try { return jwt.verify(token, this.accessSecret) as JwtPayload }
    catch { return null }
  }

  verifyRefreshToken(token: string): { userId: string } | null {
    try {
      const payload = jwt.verify(token, this.refreshSecret) as { userId: string; type: string }
      if (payload.type !== 'refresh') return null
      return { userId: payload.userId }
    } catch { return null }
  }

  refreshToken(refreshToken: string, deviceInfo?: string, ipAddress?: string): TokenPair | null {
    const refreshPayload = this.verifyRefreshToken(refreshToken)
    if (!refreshPayload) return null

    const now = new Date().toISOString()
    const session = this.sessionsRepo.findByRefreshToken(refreshToken, refreshPayload.userId)
    if (!session || session.refreshExpiresAt < now) return null

    const [user] = this.db.select().from(users).where(eq(users.id, session.userId)).limit(1).all()
    if (!user) return null

    // 先创建新 session，成功后再删旧 session
    const newTokens = this.generateTokenPair(
      { userId: user.id, email: user.email, nickname: user.nickname, role: user.role },
      deviceInfo, ipAddress,
    )

    this.sessionsRepo.delete(session.id)
    return newTokens
  }

  logout(accessToken: string): boolean {
    const session = this.sessionsRepo.findByAccessToken(accessToken)
    if (!session) return false
    this.blacklistToken(accessToken, session.expiresAt)
    return this.sessionsRepo.deleteByAccessToken(accessToken)
  }

  logoutAll(userId: string): number {
    // 先将所有 session 的 access token 加入黑名单
    const sessions = this.sessionsRepo.findByUser(userId)
    for (const session of sessions) {
      if (session.accessToken && session.expiresAt) {
        this.blacklistToken(session.accessToken, session.expiresAt)
      }
    }
    return this.sessionsRepo.deleteByUserId(userId)
  }

  cleanupExpiredSessions(): number { return this.sessionsRepo.cleanupExpired() }
  cleanupInactiveSessions(): number { return this.sessionsRepo.cleanupInactive() }

  getUserSessions(userId: string) { return this.sessionsRepo.findByUser(userId) }

  blacklistToken(token: string, expiresAt: string): void {
    this.db.insert(tokenBlacklist).values({
      id: crypto.randomUUID(), token, expiresAt, createdAt: new Date().toISOString(),
    }).run()
    this.blacklistCache.set(token, new Date(expiresAt).getTime())
  }

  isTokenBlacklisted(token: string): boolean {
    const expiresAt = this.blacklistCache.get(token)
    if (expiresAt !== undefined) {
      return Date.now() < expiresAt
    }
    return false
  }

  /** 启动时加载黑名单到内存缓存 */
  private loadBlacklistCache(): void {
    const now = new Date().toISOString()
    const records = this.db.select().from(tokenBlacklist).all()
    this.blacklistCache.clear()
    for (const record of records) {
      if (record.expiresAt > now) {
        this.blacklistCache.set(record.token, new Date(record.expiresAt).getTime())
      }
    }
    this.logger.log(`Blacklist cache loaded: ${this.blacklistCache.size} active entries`)
  }

  cleanupBlacklist(): number {
    const now = new Date().toISOString()
    const result = this.db.delete(tokenBlacklist).where(lt(tokenBlacklist.expiresAt, now)).run()
    // 刷新缓存
    this.loadBlacklistCache()
    return result.changes
  }
}