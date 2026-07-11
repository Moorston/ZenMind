import { describe, it, expect, beforeAll } from 'vitest'
import { createTestDb } from '../../../../test/setup'
import { eq } from 'drizzle-orm'
import * as crypto from 'crypto'
import { courses } from '@/db/schema/courses'
import { instructors } from '@/db/schema/instructors'
import { series } from '@/db/schema/series'
import { seriesCourses } from '@/db/schema/series'

describe('CoursesService', () => {
  let db: ReturnType<typeof createTestDb>['db']

  beforeAll(() => {
    const testDb = createTestDb()
    db = testDb.db

    // Seed instructor
    db.insert(instructors).values({
      id: 'instr-1',
      name: '静心',
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: '资深导师',
      voiceType: 'gentle',
      createdAt: new Date().toISOString(),
    }).run()

    // Seed series
    db.insert(series).values({
      id: 'series-1',
      title: '7天冥想入门',
      description: '从零开始',
      coverUrl: 'https://example.com/cover.jpg',
      level: 'beginner',
      estimatedDays: 7,
      isRecommended: true,
      order: 1,
      createdAt: new Date().toISOString(),
    }).run()

    // Seed courses
    const courseData = [
      { id: 'course-1', title: '呼吸基础', category: 'breathing' as const, duration: 5, order: 1 },
      { id: 'course-2', title: '身体扫描', category: 'body-scan' as const, duration: 10, order: 2 },
    ]

    for (const c of courseData) {
      db.insert(courses).values({
        id: c.id,
        title: c.title,
        description: `${c.title}的详细描述`,
        category: c.category,
        level: 'beginner',
        duration: c.duration,
        coverUrl: 'https://example.com/cover.jpg',
        audioUrl: 'https://example.com/audio.mp3',
        tags: JSON.stringify(['测试']),
        instructorId: 'instr-1',
        seriesId: 'series-1',
        orderInSeries: c.order,
        createdAt: new Date().toISOString(),
      }).run()
    }

    // Link courses to series
    db.insert(seriesCourses).values({
      seriesId: 'series-1',
      courseId: 'course-1',
      order: 1,
    }).run()
    db.insert(seriesCourses).values({
      seriesId: 'series-1',
      courseId: 'course-2',
      order: 2,
    }).run()
  })

  describe('findAll', () => {
    it('should return all courses with pagination', () => {
      const rows = db.select().from(courses).all()
      expect(rows.length).toBeGreaterThanOrEqual(2)
      expect(rows[0]).toHaveProperty('id')
      expect(rows[0]).toHaveProperty('title')
      expect(rows[0]).toHaveProperty('category')
      expect(rows[0]).toHaveProperty('tags')
    })

    it('should filter by category', () => {
      const rows = db.select().from(courses).where(eq(courses.category, 'breathing')).all()
      expect(rows.length).toBe(1)
      expect(rows[0].category).toBe('breathing')
    })
  })

  describe('findById', () => {
    it('should return course with instructor info', () => {
      const [course] = db.select().from(courses).where(eq(courses.id, 'course-1')).limit(1).all()
      expect(course).toBeTruthy()
      expect(course!.instructorId).toBe('instr-1')

      const [instructor] = db.select().from(instructors).where(eq(instructors.id, course!.instructorId)).limit(1).all()
      expect(instructor).toBeTruthy()
      expect(instructor!.name).toBe('静心')
    })

    it('should return null for non-existent course', () => {
      const rows = db.select().from(courses).where(eq(courses.id, 'non-existent')).limit(1).all()
      expect(rows.length).toBe(0)
    })
  })

  describe('findBySeries', () => {
    it('should return courses in a series ordered by orderInSeries', () => {
      const rows = db.select()
        .from(courses)
        .where(eq(courses.seriesId, 'series-1'))
        .all()

      expect(rows.length).toBe(2)
    })
  })

  describe('CRUD operations', () => {
    it('should create a new course', () => {
      db.insert(courses).values({
        id: 'course-new',
        title: '新课程',
        description: '新课程的描述',
        category: 'mindfulness',
        level: 'beginner',
        duration: 15,
        coverUrl: 'https://example.com/new-cover.jpg',
        audioUrl: 'https://example.com/new-audio.mp3',
        tags: JSON.stringify(['新']),
        createdAt: new Date().toISOString(),
      }).run()

      const [course] = db.select().from(courses).where(eq(courses.id, 'course-new')).limit(1).all()
      expect(course?.title).toBe('新课程')
      expect(course?.category).toBe('mindfulness')
    })

    it('should update a course', () => {
      db.update(courses).set({ title: '更新后的课程', duration: 20 })
        .where(eq(courses.id, 'course-new'))
        .run()

      const [course] = db.select().from(courses).where(eq(courses.id, 'course-new')).limit(1).all()
      expect(course?.title).toBe('更新后的课程')
      expect(course?.duration).toBe(20)
    })

    it('should delete a course', () => {
      db.delete(courses).where(eq(courses.id, 'course-new')).run()
      const rows = db.select().from(courses).where(eq(courses.id, 'course-new')).all()
      expect(rows.length).toBe(0)
    })
  })
})