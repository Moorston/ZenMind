import { Controller, Get, Post, Param, Body, HttpCode } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import { DRIZZLE } from '@/modules/db/db.module'
import { pushTokens } from '@/db/schema/push-tokens'
import { users } from '@/db/schema/users'
import { success, error } from '@/common/api-response'
import * as crypto from 'crypto'

class SavePreferencesDto {
  userId!: string
  platform!: 'weapp' | 'h5' | 'expo'
  token?: string
  reminderTime?: string
  enabled!: boolean
}

@ApiTags('push')
@Controller('push')
export class PushController {
  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<any>) {}

  @Post('preferences')
  async savePreferences(@Body() body: SavePreferencesDto) {
    if (!body.userId || body.enabled === undefined) {
      return error('userId and enabled are required')
    }

    const now = new Date().toISOString()
    const existing = this.db.select()
      .from(pushTokens)
      .where(eq(pushTokens.userId, body.userId))
      .limit(1)
      .all()

    if (existing.length > 0) {
      const updateData: any = { enabled: body.enabled, updatedAt: now }
      if (body.platform !== undefined) updateData.platform = body.platform
      if (body.token !== undefined) updateData.token = body.token
      if (body.reminderTime !== undefined) updateData.reminderTime = body.reminderTime

      this.db.update(pushTokens)
        .set(updateData)
        .where(eq(pushTokens.id, existing[0].id))
        .run()

      return success({ ...existing[0], ...updateData })
    }

    const id = crypto.randomUUID()
    this.db.insert(pushTokens).values({
      id,
      userId: body.userId,
      platform: body.platform,
      token: body.token || null,
      reminderTime: body.reminderTime || null,
      enabled: body.enabled,
      updatedAt: now,
    }).run()

    return success({ id, userId: body.userId, enabled: body.enabled })
  }

  @Get('preferences/:userId')
  async getPreferences(@Param('userId') userId: string) {
    const rows = this.db.select()
      .from(pushTokens)
      .where(eq(pushTokens.userId, userId))
      .limit(1)
      .all()

    return success(rows[0] || { userId, enabled: false })
  }
}