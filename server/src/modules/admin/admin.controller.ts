import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, NotFoundException, Req } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { eq, count, and, gte } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import { DRIZZLE } from '@/modules/db/db.module'
import { users } from '@/db/schema/users'
import { courses } from '@/db/schema/courses'
import { progress } from '@/db/schema/progress'
import { pushTokens } from '@/db/schema/push-tokens'
import { adminAuditLogs } from '@/db/schema/admin-audit-logs'
import { AuthGuard } from '@/modules/auth/auth.guard'
import { AdminGuard, Admin } from '@/modules/auth/auth-admin.guard'
import { success, error } from '@/common/api-response'

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(AuthGuard, AdminGuard)
@Admin()
export class AdminController {
  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<any>) {}

  private logAudit(adminId: string, action: string, targetType: string, targetId?: string, oldValue?: string, newValue?: string) {
    this.db.insert(adminAuditLogs).values({
      id: crypto.randomUUID(),
      adminId,
      action,
      targetType,
      targetId: targetId || null,
      oldValue: oldValue || null,
      newValue: newValue || null,
      createdAt: new Date().toISOString(),
    }).run()
  }

  @Get('stats')
  async getStats() {
    const [userCount] = this.db.select({ total: count() }).from(users).all()
    const [courseCount] = this.db.select({ total: count() }).from(courses).all()

    // 统计已完成的冥想次数（completed = true 的记录数）
    const [completedCount] = this.db.select({ total: count() })
      .from(progress)
      .where(eq(progress.completed, true))
      .all()

    // 统计总冥想时长（所有 progress.position 之和，单位秒，转为分钟）
    const allProgress = this.db.select({ position: progress.position })
      .from(progress)
      .all()
    const totalMeditationMinutes = Math.floor(
      allProgress.reduce((sum, p) => sum + (p.position || 0), 0) / 60
    )

    const today = new Date().toISOString().split('T')[0]
    const activeUsers = this.db.select()
      .from(progress)
      .where(gte(progress.updatedAt, today))
      .all()

    return success({
      totalUsers: userCount?.total || 0,
      totalCourses: courseCount?.total || 0,
      totalSessions: completedCount?.total || 0,
      totalMeditationMinutes,
      activeUsersToday: new Set(activeUsers.map(p => p.userId)).size,
    })
  }

  @Get('users')
  async getUsers(@Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    const p = parseInt(page)
    const ps = Math.min(parseInt(pageSize), 100)

    const data = this.db.select()
      .from(users)
      .limit(ps)
      .offset((p - 1) * ps)
      .all()

    const [totalResult] = this.db.select({ total: count() }).from(users).all()

    return success(data.map(u => ({
      id: u.id,
      email: u.email,
      nickname: u.nickname,
      role: u.role,
      createdAt: u.createdAt,
    })), { page: p, pageSize: ps, total: totalResult?.total || 0 })
  }

  @Put('users/:id/role')
  async updateUserRole(@Req() req: any, @Param('id') id: string, @Body() body: { role: string }) {
    if (!['user', 'editor', 'admin'].includes(body.role)) {
      return error('Invalid role. Must be user, editor, or admin')
    }

    const [existing] = this.db.select().from(users).where(eq(users.id, id)).limit(1).all()
    if (!existing) throw new NotFoundException('User not found')

    const oldRole = existing.role
    this.db.update(users).set({ role: body.role as any }).where(eq(users.id, id)).run()

    // 审计日志
    this.logAudit(req.user.id, 'role_change', 'user', id, oldRole, body.role)

    return success({ id, role: body.role })
  }

  @Post('push/broadcast')
  async broadcastPush(@Req() req: any, @Body() body: { title: string; body: string }) {
    if (!body.title || !body.body) {
      return error('title and body are required')
    }

    const tokens = this.db.select()
      .from(pushTokens)
      .where(eq(pushTokens.enabled, true))
      .all()

    // 审计日志
    this.logAudit(req.user.id, 'push_broadcast', 'push', undefined, undefined, `${body.title}: ${body.body}`)

    return success({
      message: 'Broadcast queued',
      recipients: tokens.length,
    })
  }

  @Get('audit-logs')
  async getAuditLogs(@Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    const p = parseInt(page)
    const ps = Math.min(parseInt(pageSize), 100)

    const data = this.db.select()
      .from(adminAuditLogs)
      .limit(ps)
      .offset((p - 1) * ps)
      .all()

    const [totalResult] = this.db.select({ total: count() }).from(adminAuditLogs).all()

    return success(data, { page: p, pageSize: ps, total: totalResult?.total || 0 })
  }
}