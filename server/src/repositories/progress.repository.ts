import { Injectable } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { BaseRepository } from './base.repository'
import { progress, type Progress, type NewProgress } from '@/db/schema/progress'

@Injectable()
export class ProgressRepository {
  constructor(protected readonly db: any) {}

  async findByUserAndCourse(userId: string, courseId: string): Promise<Progress | null> {
    const [record] = await this.db.select().from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.courseId, courseId)))
      .limit(1)
      .all()
    return record || null
  }

  async findByUser(userId: string) {
    return this.db.select().from(progress)
      .where(eq(progress.userId, userId))
      .all()
  }

  async upsert(userId: string, courseId: string, data: { position?: number; completed?: boolean }) {
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
    return this.upsert(userId, courseId, { completed: true })
  }
}
