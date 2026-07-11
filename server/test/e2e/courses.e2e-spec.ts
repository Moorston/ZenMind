import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestDb } from '../setup'
import { eq } from 'drizzle-orm'
import * as crypto from 'crypto'
import { courses } from '@/db/schema/courses'
import { instructors } from '@/db/schema/instructors'
import { series } from '@/db/schema/series'
import { seriesCourses } from '@/db/schema/series'

describe('Courses API (Integration)', () => {
  let db: ReturnType<typeof createTestDb>['db']
  let sqlite: ReturnType<typeof createTestDb>['sqlite']

  beforeAll(() => {
    const testDb = createTestDb()
    db = testDb.db
    sqlite = testDb.sqlite

    // Seed test data
    db.insert(instructors).values({
      id: 'instr-test-1', name: '测试导师',
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: '测试导师简介', voiceType: 'gentle',
    }).run()

    db.insert(series).values({
      id: 'series-test-1', title: '测试系列',
      description: '测试系列描述',
      coverUrl: 'https://example.com/cover.jpg',
      level: 'beginner', estimatedDays: 7,
      isRecommended: true, order: 1,
    }).run()

    const courseData = [
      { id: 'course-1', title: '呼吸基础', category: 'breathing' as const, duration: 5, order: 1 },
      { id: 'course-2', title: '身体扫描', category: 'body-scan' as const, duration: 10, order: 2 },
    ]

    for (const c of courseData) {
      db.insert(courses).values({
        id: c.id, title: c.title, description: `${c.title}的描述`,
        category: c.category, level: 'beginner', duration: c.duration,
        coverUrl: 'https://example.com/cover.jpg',
        audioUrl: 'https://example.com/audio.mp3',
        tags: JSON.stringify(['测试']),
        instructorId: 'instr-test-1', seriesId: 'series-test-1',
        orderInSeries: c.order,
      }).run()
    }

    db.insert(seriesCourses).values([
      { seriesId: 'series-test-1', courseId: 'course-1', order: 1 },
      { seriesId: 'series-test-1', courseId: 'course-2', order: 2 },
    ]).run()
  })

  afterAll(() => {
    sqlite.close()
  })

  describe('Course Queries', () => {
    it('should list all courses', () => {
      const result = db.select().from(courses).all()
      expect(result.length).toBeGreaterThanOrEqual(2)
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('title')
    })

    it('should filter courses by category', () => {
      const result = db.select().from(courses).where(eq(courses.category, 'breathing')).all()
      expect(result.length).toBe(1)
      expect(result[0].category).toBe('breathing')
    })

    it('should get course by ID', () => {
      const [course] = db.select().from(courses).where(eq(courses.id, 'course-1')).limit(1).all()
      expect(course).toBeTruthy()
      expect(course.title).toBe('呼吸基础')
    })

    it('should return courses in a series', () => {
      const result = db.select().from(courses).where(eq(courses.seriesId, 'series-test-1')).all()
      expect(result.length).toBe(2)
    })
  })

  describe('Course CRUD', () => {
    it('should create a new course', () => {
      db.insert(courses).values({
        id: 'course-new', title: '新课程', description: '新课程描述',
        category: 'mindfulness', level: 'beginner', duration: 15,
        coverUrl: 'https://example.com/new-cover.jpg',
        audioUrl: 'https://example.com/new-audio.mp3',
        tags: JSON.stringify(['新']),
      }).run()

      const [course] = db.select().from(courses).where(eq(courses.id, 'course-new')).limit(1).all()
      expect(course.title).toBe('新课程')
      expect(course.duration).toBe(15)
    })

    it('should update a course', () => {
      db.update(courses).set({ title: '更新后的课程', duration: 20 })
        .where(eq(courses.id, 'course-new')).run()

      const [course] = db.select().from(courses).where(eq(courses.id, 'course-new')).limit(1).all()
      expect(course.title).toBe('更新后的课程')
      expect(course.duration).toBe(20)
    })

    it('should delete a course', () => {
      db.delete(courses).where(eq(courses.id, 'course-new')).run()
      const result = db.select().from(courses).where(eq(courses.id, 'course-new')).all()
      expect(result.length).toBe(0)
    })
  })

  describe('Instructors', () => {
    it('should list all instructors', () => {
      const result = db.select().from(instructors).all()
      expect(result.length).toBeGreaterThanOrEqual(1)
      expect(result[0].name).toBe('测试导师')
    })
  })

  describe('Series', () => {
    it('should list all series', () => {
      const result = db.select().from(series).all()
      expect(result.length).toBeGreaterThanOrEqual(1)
      expect(result[0].title).toBe('测试系列')
    })

    it('should show recommended series', () => {
      const result = db.select().from(series).where(eq(series.isRecommended, true)).all()
      expect(result.length).toBeGreaterThanOrEqual(1)
    })
  })
})