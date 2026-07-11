import { Injectable } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import { DRIZZLE } from '@/modules/db/db.module'
import { pushTokens, type PushToken } from '@/db/schema/push-tokens'

@Injectable()
export class PushTokensRepository {
  constructor(@Inject(DRIZZLE) protected readonly db: BetterSQLite3Database<any>) {}

  findEnabledByTime(platform: string, time: string): PushToken[] {
    return this.db.select().from(pushTokens)
      .where(and(
        eq(pushTokens.enabled, true),
        eq(pushTokens.reminderTime, time),
        eq(pushTokens.platform, platform as any),
      ))
      .all()
  }

  findAllEnabled(): PushToken[] {
    return this.db.select().from(pushTokens)
      .where(eq(pushTokens.enabled, true))
      .all()
  }
}