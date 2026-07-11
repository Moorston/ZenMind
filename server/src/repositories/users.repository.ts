import { Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { users, type User } from '@/db/schema/users'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'

@Injectable()
export class UsersRepository {
  constructor(protected readonly db: any) {}

  async findById(id: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id)).limit(1).all()
    return user || null
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email)).limit(1).all()
    return user || null
  }

  findByEmailSync(email: string): User | null {
    const [user] = this.db.select().from(users).where(eq(users.email, email)).limit(1).all()
    return user || null
  }

  async findByToken(token: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.token, token)).limit(1).all()
    return user || null
  }

  async findByWechatOpenId(openId: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.wechatOpenId, openId)).limit(1).all()
    return user || null
  }

  findByWechatOpenIdSync(openId: string): User | null {
    const [user] = this.db.select().from(users).where(eq(users.wechatOpenId, openId)).limit(1).all()
    return user || null
  }

  async create(data: { email: string; password: string; nickname: string; role?: string; wechatOpenId?: string }): Promise<User> {
    const id = crypto.randomUUID()
    const token = 'token_' + crypto.randomUUID()
    const hashedPassword = bcrypt.hashSync(data.password, 10)

    const [user] = await this.db.insert(users).values({
      id,
      email: data.email,
      password: hashedPassword,
      nickname: data.nickname,
      token,
      role: data.role || 'user',
      wechatOpenId: data.wechatOpenId || null,
    }).returning()
    return user
  }

  async updateToken(userId: string): Promise<string> {
    const token = 'token_' + crypto.randomUUID()
    await this.db.update(users).set({ token }).where(eq(users.id, userId)).run()
    return token
  }
}
