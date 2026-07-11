import { Injectable, ConflictException, Inject } from '@nestjs/common'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import { DRIZZLE } from '@/modules/db/db.module'
import { adminAuditLogs } from '@/db/schema/admin-audit-logs'
import { CoursesRepository } from '@/repositories/courses.repository'
import type { CourseQueryDto } from './dto/course-query.dto'
import type { CreateCourseDto } from './dto/create-course.dto'
import type { UpdateCourseDto } from './dto/update-course.dto'

@Injectable()
export class CoursesService {
  constructor(
    private readonly coursesRepo: CoursesRepository,
    @Inject(DRIZZLE) private db: BetterSQLite3Database<any>,
  ) {}

  async findAll(query: CourseQueryDto) {
    return this.coursesRepo.findPaginated(query)
  }

  async findById(id: string) {
    const course = await this.coursesRepo.findById(id)
    if (!course) return null

    // Join instructor and series manually (repo doesn't handle relations)
    return course
  }

  async findByIds(ids: string[]) {
    if (ids.length === 0) return []
    // Use findAll with an array-based query approach
    const allCourses = await this.coursesRepo.findAll()
    return allCourses.filter(c => ids.includes(c.id))
  }

  async findBySeries(seriesId: string) {
    return this.coursesRepo.findBySeries(seriesId)
  }

  async create(data: CreateCourseDto) {
    return this.coursesRepo.create(data as any)
  }

  async update(id: string, data: UpdateCourseDto) {
    return this.coursesRepo.update(id, data as any)
  }

  async restore(id: string, adminId?: string) {
    const course = await this.coursesRepo.findById(id, true) // includeDeleted
    if (!course || !course.isDeleted) return null

    const restored = await this.coursesRepo.restore(id)
    if (!restored) return null

    // 审计日志
    if (adminId) {
      this.db.insert(adminAuditLogs).values({
        id: crypto.randomUUID(),
        adminId,
        action: 'course_restore',
        targetType: 'course',
        targetId: id,
        oldValue: 'archived',
        newValue: course.title,
        createdAt: new Date().toISOString(),
      }).run()
    }

    return { id, restored: true }
  }

  async delete(id: string, adminId?: string) {
    const course = await this.coursesRepo.findById(id, true) // includeDeleted
    if (!course) return null

    const hasData = await this.coursesRepo.hasProgressData(id)

    // 软删除
    const softDeleted = await this.coursesRepo.delete(id)
    if (!softDeleted) return null

    // 审计日志
    if (adminId) {
      this.db.insert(adminAuditLogs).values({
        id: crypto.randomUUID(),
        adminId,
        action: 'course_archive',
        targetType: 'course',
        targetId: id,
        oldValue: course.title,
        newValue: hasData ? 'archived_with_data' : 'archived',
        createdAt: new Date().toISOString(),
      }).run()
    }

    return {
      id,
      softDeleted: true,
      message: hasData ? '课程已归档（存在用户数据，未物理删除）' : '课程已归档',
    }
  }
}