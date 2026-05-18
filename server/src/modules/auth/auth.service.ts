import { Inject, Injectable } from '@nestjs/common'
import { eq, and, gt } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import { DRIZZLE } from '@/modules/db/db.module'
import { users } from '@/db/schema/users'
import { emailVerificationCodes } from '@/db/schema/email-verification-codes'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'

@Injectable()
export class AuthService {
  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<any>) {}

  sendVerificationCode(email: string) {
    this.db.update(emailVerificationCodes)
      .set({ used: true })
      .where(and(
        eq(emailVerificationCodes.email, email),
        eq(emailVerificationCodes.used, false),
      ))
      .run()

    const code = crypto.randomInt(100000, 999999).toString()
    const id = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    this.db.insert(emailVerificationCodes).values({
      id,
      email,
      code,
      expiresAt,
      used: false,
    }).run()

    console.log(`[Auth] Verification code for ${email}: ${code}`)

    try {
      this.sendEmail(email, code)
    } catch {
      console.log(`[Auth] Email sending failed (SMTP not configured)`)
    }

    return { message: 'Verification code sent' }
  }

  register(email: string, password: string, nickname: string, code: string) {
    const now = new Date().toISOString()
    const codes = this.db.select()
      .from(emailVerificationCodes)
      .where(and(
        eq(emailVerificationCodes.email, email),
        eq(emailVerificationCodes.code, code),
        eq(emailVerificationCodes.used, false),
        gt(emailVerificationCodes.expiresAt, now),
      ))
      .limit(1)
      .all()

    const validCode = codes[0]
    if (!validCode) return null

    this.db.update(emailVerificationCodes)
      .set({ used: true })
      .where(eq(emailVerificationCodes.id, validCode.id))
      .run()

    const existingUsers = this.db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .all()

    if (existingUsers.length > 0) return null

    const hashedPassword = bcrypt.hashSync(password, 10)
    const id = crypto.randomUUID()
    const token = 'token_' + crypto.randomUUID()

    this.db.insert(users).values({
      id,
      email,
      password: hashedPassword,
      nickname,
    }).run()

    return {
      token,
      user: { id, email, nickname },
    }
  }

  login(email: string, password: string) {
    const rows = this.db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .all()

    const user = rows[0]
    if (!user) return null

    const valid = bcrypt.compareSync(password, user.password)
    if (!valid) return null

    const token = 'token_' + crypto.randomUUID()
    return {
      token,
      user: { id: user.id, email: user.email, nickname: user.nickname },
    }
  }

  private sendEmail(email: string, code: string) {
    const host = process.env.SMTP_HOST
    const port = parseInt(process.env.SMTP_PORT || '587', 10)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    if (!host || !user || !pass) {
      console.log(`[Auth] SMTP not configured. Would send code ${code} to ${email}`)
      return
    }

    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })

    transporter.sendMail({
      from: user,
      to: email,
      subject: 'Your ZenMind Verification Code',
      text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`,
    })
  }
}
