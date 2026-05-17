import { Inject, Injectable } from '@nestjs/common'
import { eq, asc, inArray } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import { DRIZZLE } from '@/modules/db/db.module'
import { series, seriesCourses } from '@/db/schema/series'
import { courses } from '@/db/schema/courses'

@Injectable()
export class SeriesService {
  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<any>) {}

  async findAll() {
    const seriesList = await this.db.select()
      .from(series)
      .orderBy(asc(series.order))

    return this.populateCourses(seriesList)
  }

  async findById(id: string) {
    const [item] = await this.db.select()
      .from(series)
      .where(eq(series.id, id))
      .limit(1)

    if (!item) return null

    const [populated] = await this.populateCourses([item])
    return populated
  }

  async findRecommended() {
    const seriesList = await this.db.select()
      .from(series)
      .where(eq(series.isRecommended, true))
      .orderBy(asc(series.order))

    return this.populateCourses(seriesList)
  }

  private async populateCourses(seriesList: any[]) {
    if (seriesList.length === 0) return []

    const seriesIds = seriesList.map(s => s.id)
    const relations = await this.db.select()
      .from(seriesCourses)
      .where(inArray(seriesCourses.seriesId, seriesIds))
      .orderBy(asc(seriesCourses.order))

    const courseIds = relations.map(r => r.courseId)
    const courseList = courseIds.length > 0
      ? await this.db.select().from(courses).where(inArray(courses.id, courseIds))
      : []

    const courseMap = new Map(courseList.map(c => [c.id, c]))
    const seriesCourseMap = new Map<string, any[]>()
    for (const r of relations) {
      if (!seriesCourseMap.has(r.seriesId)) seriesCourseMap.set(r.seriesId, [])
      const course = courseMap.get(r.courseId)
      if (course) seriesCourseMap.get(r.seriesId)!.push(course)
    }

    return seriesList.map(s => ({
      ...s,
      courseList: seriesCourseMap.get(s.id) || [],
      courseIds: (seriesCourseMap.get(s.id) || []).map((c: any) => c.id),
    }))
  }
}
