import { Inject, Injectable } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import { DRIZZLE } from '@/modules/db/db.module'
import { progress, type NewProgress } from '@/db/schema/progress'

@Injectable()
export class ProgressService {
  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<any>) {}

  async getProgress(userId: string, courseId: string) {
    const [record] = await this.db.select()
      .from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.courseId, courseId)))
      .limit(1)
    return record || null
  }

  async getAllProgress(userId: string) {
    return this.db.select()
      .from(progress)
      .where(eq(progress.userId, userId))
  }

  async updateProgress(userId: string, courseId: string, data: Partial<Pick<NewProgress, 'position' | 'completed'>>) {
    const now = new Date().toISOString()
    const updateData: any = { ...data, updatedAt: now }
    if (data.completed) {
      updateData.completedAt = now
    }

    const [result] = await this.db.insert(progress)
      .values({ userId, courseId, position: data.position ?? 0, completed: data.completed ?? false, ...updateData })
      .onConflictDoUpdate({
        target: [progress.userId, progress.courseId],
        set: updateData,
      })
      .returning()
    return result
  }

  async markCompleted(userId: string, courseId: string) {
    return this.updateProgress(userId, courseId, { completed: true })
  }
}
