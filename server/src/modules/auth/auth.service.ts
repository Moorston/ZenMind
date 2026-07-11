import { Injectable, Logger } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { eq, and, gt } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import * as argon2 from 'argon2'
import * as crypto from 'crypto'
import { DRIZZLE } from '@/modules/db/db.module'
import { emailVerificationCodes } from '@/db/schema/email-verification-codes'
import { users } from '@/db/schema/users'
import { UsersRepository } from '@/repositories/users.repository'
import { TokenService, type JwtPayload } from './token.service'
import { EmailService } from './email.service'
import { validatePasswordStrength } from './password.validator'
import { encrypt as encryptOpenId, tryDecrypt as decryptOpenId } from './crypto.utils'

const MAX_DAILY_VERIFICATION_CODES = 10

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @Inject(DRIZZLE) private db: BetterSQLite3Database<any>,
    private readonly usersRepo: UsersRepository,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
  ) {}

  sendVerificationCode(email: string): { success: boolean; message: string } {
    const rateLimitError = this.checkEmailRateLimit(email)
    if (rateLimitError) return { success: false, message: rateLimitError }

    this.db.update(emailVerificationCodes)
      .set({ used: true })
      .where(and(eq(emailVerificationCodes.email, email), eq(emailVerificationCodes.used, false)))
      .run()

    const code = crypto.randomInt(100000, 999999).toString()
    const id = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    this.db.insert(emailVerificationCodes).values({ id, email, code, expiresAt, used: false }).run()

    const emailSent = this.emailService.sendVerificationCode(email, code)
    if (!emailSent) this.logger.warn(`SMTP not configured, returning code for dev: ${code}`)

    return { success: true, message: '验证码已发送' }
  }

  private checkEmailRateLimit(email: string): string | null {
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

    const recentCodes = this.db.select().from(emailVerificationCodes)
      .where(and(eq(emailVerificationCodes.email, email), gt(emailVerificationCodes.createdAt, oneMinuteAgo)))
      .all()
    if (recentCodes.length > 0) return '请等待 1 分钟后再试'

    const todayCodes = this.db.select().from(emailVerificationCodes)
      .where(and(eq(emailVerificationCodes.email, email), gt(emailVerificationCodes.createdAt, todayStart)))
      .all()
    if (todayCodes.length >= MAX_DAILY_VERIFICATION_CODES) return '今日验证码发送次数已达上限'

    return null
  }

  async register(email: string, password: string, nickname: string, code: string) {
    const passwordError = validatePasswordStrength(password)
    if (passwordError) return { error: passwordError }

    const now = new Date().toISOString()
    const codes = this.db.select().from(emailVerificationCodes)
      .where(and(eq(emailVerificationCodes.email, email), eq(emailVerificationCodes.code, code), eq(emailVerificationCodes.used, false), gt(emailVerificationCodes.expiresAt, now)))
      .limit(1).all()
    const validCode = codes[0]
    if (!validCode) return null

    this.db.update(emailVerificationCodes).set({ used: true }).where(eq(emailVerificationCodes.id, validCode.id)).run()
    const existingUser = this.usersRepo.findByEmailSync(email)
    if (existingUser) return null

    const hashedPassword = await argon2.hash(password, { memoryCost: 65536, timeCost: 3, parallelism: 1 })
    const id = crypto.randomUUID()
    this.db.insert(users).values({ id, email, password: hashedPassword, nickname, role: 'user' }).run()

    const payload: JwtPayload = { userId: id, email, nickname, role: 'user' }
    const tokens = this.tokenService.generateTokenPair(payload)
    return { ...tokens, user: { id, email, nickname } }
  }

  async login(email: string, password: string) {
    const user = this.usersRepo.findByEmailSync(email)
    if (!user) return null
    if (!(await argon2.verify(user.password, password))) return null

    const payload: JwtPayload = { userId: user.id, email: user.email, nickname: user.nickname, role: user.role }
    const tokens = this.tokenService.generateTokenPair(payload)
    return { ...tokens, user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role } }
  }

  private findByEncryptedOpenId(openId: string) {
    const allUsers = this.db.select().from(users).all()
    for (const user of allUsers) {
      if (user.wechatOpenId && decryptOpenId(user.wechatOpenId) === openId) return user
    }
    return null
  }

  async wechatLogin(code: string) {
    const appid = process.env.WECHAT_APPID
    const secret = process.env.WECHAT_SECRET
    if (!appid || !secret) { this.logger.error('[Auth] WeChat login not configured'); return null }

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`
    let openid: string
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
      const data = await res.json() as any
      if (data.errcode) { this.logger.error(`[Auth] WeChat error: ${data.errmsg}`); return null }
      openid = data.openid
    } catch (err) { this.logger.error('[Auth] WeChat request failed:', err); return null }

    const existing = this.findByEncryptedOpenId(openid)
    if (existing) {
      const payload: JwtPayload = { userId: existing.id, email: existing.email, nickname: existing.nickname, role: existing.role }
      const tokens = this.tokenService.generateTokenPair(payload)
      return { ...tokens, user: { id: existing.id, nickname: existing.nickname } }
    }

    const id = crypto.randomUUID()
    const nickname = '微信用户_' + openid.slice(-6)
    const randomPassword = await argon2.hash(crypto.randomUUID(), { memoryCost: 65536, timeCost: 3, parallelism: 1 })
    this.db.insert(users).values({
      id, email: `wechat_${openid}@zenmind.app`, password: randomPassword,
      nickname, role: 'user', wechatOpenId: encryptOpenId(openid),
    }).run()

    const payload: JwtPayload = { userId: id, email: `wechat_${openid}@zenmind.app`, nickname, role: 'user' }
    const tokens = this.tokenService.generateTokenPair(payload)
    return { ...tokens, user: { id, nickname } }
  }

  refreshToken(refreshToken: string) { return this.tokenService.refreshToken(refreshToken) }
  logout(accessToken: string) { return this.tokenService.logout(accessToken) }
  logoutAll(userId: string) { return this.tokenService.logoutAll(userId) }

  cleanupSessions() {
    const expired = this.tokenService.cleanupExpiredSessions()
    const inactive = this.tokenService.cleanupInactiveSessions()
    const blacklistCleaned = this.tokenService.cleanupBlacklist()
    if (expired > 0 || inactive > 0 || blacklistCleaned > 0) {
      this.logger.log(`Cleaned up ${expired} expired sessions, ${inactive} inactive sessions, ${blacklistCleaned} blacklist entries`)
    }
  }
}