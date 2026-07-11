import { Injectable } from '@nestjs/common'
import { eq, and, asc, ilike, inArray, count } from 'drizzle-orm'
import { BaseRepository } from './base.repository'
import { courses, type Course } from '@/db/schema/courses'
import { instructors } from '@/db/schema/instructors'
import { series } from '@/db/schema/series'
import { progress } from '@/db/schema/progress'

@Injectable()
export class CoursesRepository extends BaseRepository<Course> {
  async findById(id: string, includeDeleted = false): Promise<Course | null> {
    const conditions = [eq(courses.id, id)]
    if (!includeDeleted) conditions.push(eq(courses.isDeleted, false))

    const [course] = await this.db.select()
      .from(courses)
      .where(and(...conditions))
      .limit(1)
    return course ? this.parseTags(course) : null
  }

  async findAll(query?: any, includeDeleted = false): Promise<Course[]> {
    const conditions: any[] = []
    if (!includeDeleted) conditions.push(eq(courses.isDeleted, false))
    if (query?.category) conditions.push(eq(courses.category, query.category))
    if (query?.level) conditions.push(eq(courses.level, query.level))
    if (query?.seriesId) conditions.push(eq(courses.seriesId, query.seriesId))
    if (query?.search) conditions.push(ilike(courses.title, `%${query.search}%`))

    const where = conditions.length > 0 ? and(...conditions) : undefined

    return this.db.select().from(courses).where(where)
      .orderBy(asc(courses.orderInSeries), asc(courses.createdAt))
      .all()
      .map(this.parseTags)
  }

  async findPaginated(query?: { category?: string; level?: string; seriesId?: string; search?: string; page?: number; pageSize?: number; includeDeleted?: boolean }) {
    const includeDeleted = query?.includeDeleted || false
    const conditions: any[] = []
    if (!includeDeleted) conditions.push(eq(courses.isDeleted, false))
    if (query?.category) conditions.push(eq(courses.category, query.category as typeof courses.$inferSelect.category))
    if (query?.level) conditions.push(eq(courses.level, query.level as typeof courses.$inferSelect.level))
    if (query?.seriesId) conditions.push(eq(courses.seriesId, query.seriesId))
    if (query?.search) conditions.push(ilike(courses.title, `%${query.search}%`))

    const where = conditions.length > 0 ? and(...conditions) : undefined
    const page = query?.page || 1
    const pageSize = query?.pageSize || 20
    const offset = (page - 1) * pageSize

    const [data, countResult] = await Promise.all([
      this.db.select().from(courses).where(where).limit(pageSize).offset(offset)
        .orderBy(asc(courses.orderInSeries), asc(courses.createdAt)),
      this.db.select({ total: count() }).from(courses).where(where),
    ])

    return {
      data: data.map(this.parseTags),
      total: countResult[0]?.total ?? 0,
      page,
      pageSize,
    }
  }

  async findBySeries(seriesId: string, includeDeleted = false) {
    const conditions = [eq(courses.seriesId, seriesId)]
    if (!includeDeleted) conditions.push(eq(courses.isDeleted, false))

    return this.db.select().from(courses)
      .where(and(...conditions))
      .orderBy(asc(courses.orderInSeries))
      .all()
      .map(this.parseTags)
  }

  async findByCategory(category: string, includeDeleted = false) {
    const conditions = [eq(courses.category, category as typeof courses.$inferSelect.category)]
    if (!includeDeleted) conditions.push(eq(courses.isDeleted, false))

    return this.db.select().from(courses)
      .where(and(...conditions))
      .all()
      .map(this.parseTags)
  }

  async create(data: Partial<Course>): Promise<Course> {
    const id = (data as any).id || crypto.randomUUID()
    const now = new Date().toISOString()
    const [course] = await this.db.insert(courses)
      .values({
        id,
        title: data.title!,
        description: data.description!,
        category: data.category!,
        level: data.level ?? 'beginner',
        duration: data.duration!,
        coverUrl: data.coverUrl!,
        audioUrl: data.audioUrl!,
        tags: data.tags ?? '[]',
        instructorId: (data as any).instructorId ?? null,
        seriesId: (data as any).seriesId ?? null,
        orderInSeries: (data as any).orderInSeries ?? 0,
        createdAt: now,
      })
      .returning()
    return this.parseTags(course)
  }

  async update(id: string, data: Partial<Course>): Promise<Course | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.category !== undefined) updateData.category = data.category
    if (data.level !== undefined) updateData.level = data.level
    if (data.duration !== undefined) updateData.duration = data.duration
    if (data.coverUrl !== undefined) updateData.coverUrl = data.coverUrl
    if (data.audioUrl !== undefined) updateData.audioUrl = data.audioUrl
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.instructorId !== undefined) updateData.instructorId = (data as any).instructorId
    if (data.seriesId !== undefined) updateData.seriesId = (data as any).seriesId

    const [updated] = await this.db.update(courses).set(updateData)
      .where(and(eq(courses.id, id), eq(courses.isDeleted, false)))
      .returning()
    return updated ? this.parseTags(updated) : null
  }

  /**
   * 软删除：标记 isDeleted = true，保留数据不丢失
   */
  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id)
    if (!existing) return false
    await this.db.update(courses)
      .set({ isDeleted: true })
      .where(and(eq(courses.id, id), eq(courses.isDeleted, false)))
      .run()
    return true
  }

  /**
   * 恢复软删除的课程
   */
  async restore(id: string): Promise<boolean> {
    const [existing] = await this.db.select().from(courses)
      .where(and(eq(courses.id, id), eq(courses.isDeleted, true)))
      .limit(1)
      .all()
    if (!existing) return false
    await this.db.update(courses)
      .set({ isDeleted: false })
      .where(eq(courses.id, id))
      .run()
    return true
  }

  /**
   * 检查课程是否有用户进度数据
   */
  async hasProgressData(id: string): Promise<boolean> {
    const [result] = await this.db.select({ total: count() })
      .from(progress)
      .where(eq(progress.courseId, id))
      .all()
    return (result?.total ?? 0) > 0
  }

  private parseTags(c: any) {
    if (c && typeof c.tags === 'string') {
      try { c.tags = JSON.parse(c.tags) } catch { c.tags = [] }
    }
    return c
  }
}
