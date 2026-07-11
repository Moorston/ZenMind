import { Injectable, Logger } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import { DRIZZLE } from '@/modules/db/db.module'
import { users } from '@/db/schema/users'
import { PushTokensRepository } from '@/repositories/push-tokens.repository'

interface CachedReminder {
  id: string
  userId: string
  reminderTime: string
  platform: string
}

@Injectable()
export class PushSchedulerService {
  private readonly logger = new Logger(PushSchedulerService.name)
  private accessToken: string | null = null
  private tokenExpiresAt = 0
  private reminderCache: Map<string, CachedReminder[]> = new Map()
  private lastCacheRefresh = 0
  private static readonly CACHE_REFRESH_INTERVAL = 5 * 60 * 1000 // 5 分钟

  constructor(
    @Inject(DRIZZLE) private db: BetterSQLite3Database<any>,
    private readonly pushTokensRepo: PushTokensRepository,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleReminderPush() {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    // 每 5 分钟刷新缓存
    if (Date.now() - this.lastCacheRefresh > PushSchedulerService.CACHE_REFRESH_INTERVAL) {
      await this.refreshCache()
    }

    const dueReminders = this.reminderCache.get(currentTime) || []
    if (dueReminders.length === 0) return

    this.logger.log(`Found ${dueReminders.length} WeChat reminders at ${currentTime}`)

    for (const reminder of dueReminders) {
      try {
        await this.sendWechatTemplateMessage(reminder)
      } catch (error) {
        this.logger.error(`Failed to send reminder to user ${reminder.userId}:`, error)
      }
    }
  }

  private async refreshCache() {
    const allReminders = this.pushTokensRepo.findAllEnabled()

    this.reminderCache.clear()
    for (const reminder of allReminders) {
      const time = reminder.reminderTime
      if (!time) continue
      if (!this.reminderCache.has(time)) {
        this.reminderCache.set(time, [])
      }
      this.reminderCache.get(time)!.push({
        id: reminder.id,
        userId: reminder.userId,
        reminderTime: reminder.reminderTime!,
        platform: reminder.platform,
      })
    }
    this.lastCacheRefresh = Date.now()
    this.logger.log(`Reminder cache refreshed: ${allReminders.length} active reminders`)
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    const appId = process.env.WECHAT_APPID
    const appSecret = process.env.WECHAT_APPSECRET

    if (!appId || !appSecret) {
      throw new Error('WECHAT_APPID or WECHAT_APPSECRET not configured')
    }

    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
    const response = await fetch(url)
    const data = await response.json() as any

    if (data.errcode) {
      throw new Error(`WeChat access_token error: ${data.errmsg}`)
    }

    this.accessToken = data.access_token
    this.tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000
    return this.accessToken!
  }

  private async sendWechatTemplateMessage(reminder: CachedReminder) {
    const token = await this.getAccessToken()

    const user = this.db.select()
      .from(users)
      .where(eq(users.id, reminder.userId))
      .limit(1)
      .all()[0]

    if (!user?.wechatOpenId) {
      this.logger.warn(`User ${reminder.userId} has no wechatOpenId, skipping`)
      return
    }

    const templateUrl = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`

    const body = {
      touser: user.wechatOpenId,
      template_id: process.env.WECHAT_TEMPLATE_ID || '',
      page: 'pages/index/index',
      data: {
        thing1: { value: '冥想提醒' },
        time2: { value: reminder.reminderTime },
        thing3: { value: '是时候开始今天的冥想练习了，静心片刻，感受内心的平和。' },
      },
    }

    const response = await fetch(templateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const result = await response.json() as any

    if (result.errcode === 0) {
      this.logger.log(`Template message sent to ${user.wechatOpenId}`)
    } else {
      this.logger.error(`Template message failed: ${result.errmsg}`)
    }
  }
}
