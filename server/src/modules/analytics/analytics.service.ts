import { Injectable } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { eq, count, gte } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import { DRIZZLE } from '@/modules/db/db.module'
import { users } from '@/db/schema/users'
import { courses } from '@/db/schema/courses'
import { progress } from '@/db/schema/progress'
import { orders } from '@/db/schema/orders'
import { CoursesRepository } from '@/repositories/courses.repository'
import { ProgressRepository } from '@/repositories/progress.repository'

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(DRIZZLE) private db: BetterSQLite3Database<any>,
    private readonly coursesRepo: CoursesRepository,
  ) {}

  getUserGrowth() {
    const total = this.db.select({ total: count() }).from(users).all()[0]?.total || 0
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const newThisWeek = this.db.select({ total: count() }).from(users).where(gte(users.createdAt, lastWeek)).all()[0]?.total || 0
    return { total, newThisWeek, growthRate: total > 0 ? Math.round((newThisWeek / total) * 100) : 0 }
  }

  async getCourseStats() {
    const catalog = await this.coursesRepo.findAll()
    const totalSessions = this.db.select({ total: count() }).from(progress).all()[0]?.total || 0
    const completedSessions = this.db.select({ total: count() }).from(progress).where(eq(progress.completed, true)).all()[0]?.total || 0
    return {
      totalCourses: catalog.length,
      totalSessions,
      completedSessions,
      completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
    }
  }

  getRevenueStats() {
    const totalOrders = this.db.select({ total: count() }).from(orders).all()[0]?.total || 0
    return { totalOrders }
  }

  getRetentionRate() {
    const registeredUsers = this.db.select({ total: count() }).from(users).all()[0]?.total || 1
    const activeUsers = this.db.select({ total: count() }).from(progress).all()[0]?.total || 0
    return { registeredUsers, activeUsers, retentionRate: Math.round((activeUsers / registeredUsers) * 100) }
  }
}