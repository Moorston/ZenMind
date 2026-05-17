import { Inject, Injectable } from '@nestjs/common'
import { and, ilike, eq, inArray, asc, count } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import { DRIZZLE } from '@/modules/db/db.module'
import { courses, type Course } from '@/db/schema/courses'
import { instructors } from '@/db/schema/instructors'
import { series } from '@/db/schema/series'
import type { CourseQueryDto } from './dto/course-query.dto'

@Injectable()
export class CoursesService {
  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<any>) {}

  async findAll(query: CourseQueryDto) {
    const conditions: any[] = []

    if (query.category) conditions.push(eq(courses.category, query.category))
    if (query.level) conditions.push(eq(courses.level, query.level))
    if (query.seriesId) conditions.push(eq(courses.seriesId, query.seriesId))
    if (query.instructorId) conditions.push(eq(courses.instructorId, query.instructorId))
    if (query.search) conditions.push(
      ilike(courses.title, `%${query.search}%`),
    )

    const where = conditions.length > 0 ? and(...conditions) : undefined
    const offset = (query.page - 1) * query.pageSize

    const [data, countResult] = await Promise.all([
      this.db.select()
        .from(courses)
        .where(where)
        .limit(query.pageSize)
        .offset(offset)
        .orderBy(asc(courses.orderInSeries), asc(courses.createdAt)),
      this.db.select({ total: count() })
        .from(courses)
        .where(where),
    ])

    return {
      data: data.map(parseTags),
      total: countResult[0]?.total ?? 0,
      page: query.page,
      pageSize: query.pageSize,
    }
  }

  async findById(id: string) {
    const [course] = await this.db.select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1)

    if (!course) return null

    const [instructor] = course.instructorId
      ? await this.db.select().from(instructors).where(eq(instructors.id, course.instructorId)).limit(1)
      : []

    const [seriesInfo] = course.seriesId
      ? await this.db.select().from(series).where(eq(series.id, course.seriesId)).limit(1)
      : []

    return { ...parseTags(course), instructor: instructor || null, series: seriesInfo || null }
  }

  async findByIds(ids: string[]) {
    if (ids.length === 0) return []
    const rows = await this.db.select().from(courses).where(inArray(courses.id, ids))
    return rows.map(parseTags)
  }

  async findBySeries(seriesId: string) {
    const rows = await this.db.select()
      .from(courses)
      .where(eq(courses.seriesId, seriesId))
      .orderBy(asc(courses.orderInSeries))
    return rows.map(parseTags)
  }
}

function parseTags(c: any) {
  if (typeof c.tags === 'string') {
    try { c.tags = JSON.parse(c.tags) } catch { c.tags = [] }
  }
  return c
}
