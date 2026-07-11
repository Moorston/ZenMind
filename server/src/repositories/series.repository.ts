import { Injectable } from '@nestjs/common'
import { eq, asc, inArray } from 'drizzle-orm'
import { BaseRepository } from './base.repository'
import { series, seriesCourses, type Series } from '@/db/schema/series'
import { courses } from '@/db/schema/courses'

@Injectable()
export class SeriesRepository extends BaseRepository<Series> {
  async findById(id: string): Promise<Series | null> {
    const [item] = await this.db.select().from(series).where(eq(series.id, id)).limit(1)
    return item || null
  }

  async findAll() {
    return this.db.select().from(series).orderBy(asc(series.order)).all()
  }

  async findRecommended() {
    return this.db.select().from(series)
      .where(eq(series.isRecommended, true))
      .orderBy(asc(series.order))
      .all()
  }

  async create(data: Partial<Series>): Promise<Series> {
    const id = (data as any).id || crypto.randomUUID()
    const now = new Date().toISOString()
    const [item] = await this.db.insert(series).values({
      id,
      title: data.title!,
      description: data.description!,
      coverUrl: data.coverUrl!,
      level: data.level ?? 'beginner',
      estimatedDays: (data as any).estimatedDays ?? 7,
      isRecommended: (data as any).isRecommended ?? false,
      order: (data as any).order ?? 0,
      createdAt: now,
    }).returning()
    return item
  }

  async update(id: string, data: Partial<Series>): Promise<Series | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.coverUrl !== undefined) updateData.coverUrl = data.coverUrl
    if (data.level !== undefined) updateData.level = data.level
    if ((data as any).estimatedDays !== undefined) updateData.estimatedDays = (data as any).estimatedDays
    if ((data as any).isRecommended !== undefined) updateData.isRecommended = (data as any).isRecommended
    if ((data as any).order !== undefined) updateData.order = (data as any).order

    const [updated] = await this.db.update(series).set(updateData).where(eq(series.id, id)).returning()
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id)
    if (!existing) return false
    await this.db.delete(series).where(eq(series.id, id)).run()
    return true
  }

  async addCourses(seriesId: string, courseIds: string[]) {
    const existingRelations = await this.db.select().from(seriesCourses)
      .where(eq(seriesCourses.seriesId, seriesId))
      .orderBy(asc(seriesCourses.order))
      .all()

    const startOrder = existingRelations.length > 0
      ? Math.max(...existingRelations.map(r => r.order ?? 0)) + 1
      : 0

    const values = courseIds.map((courseId, idx) => ({
      seriesId,
      courseId,
      order: startOrder + idx,
    }))

    await this.db.insert(seriesCourses).values(values).onConflictDoNothing().run()
    return this.findById(seriesId)
  }
}
