import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestDb } from '../setup'
import { eq, and } from 'drizzle-orm'
import * as crypto from 'crypto'
import { courses } from '@/db/schema/courses'
import { progress } from '@/db/schema/progress'

describe('Progress API (Integration)', () => {
  let db: ReturnType<typeof createTestDb>['db']
  let sqlite: ReturnType<typeof createTestDb>['sqlite']

  beforeAll(() => {
    const testDb = createTestDb()
    db = testDb.db
    sqlite = testDb.sqlite

    // Seed a course for progress tracking
    db.insert(courses).values({
      id: 'course-prog-1',
      title: '进度测试课程',
      description: '用于测试进度追踪',
      category: 'breathing',
      level: 'beginner',
      duration: 10,
      coverUrl: 'https://example.com/cover.jpg',
      audioUrl: 'https://example.com/audio.mp3',
      tags: JSON.stringify(['测试']),
    }).run()
  })

  afterAll(() => {
    sqlite.close()
  })

  describe('Progress Upsert', () => {
    it('should create a new progress record', () => {
      const userId = 'user-test-1'
      const courseId = 'course-prog-1'
      const now = new Date().toISOString()

      db.insert(progress).values({
        userId, courseId, position: 30, completed: false, updatedAt: now,
      }).run()

      const [record] = db.select()
        .from(progress)
        .where(and(eq(progress.userId, userId), eq(progress.courseId, courseId)))
        .limit(1)
        .all()

      expect(record).toBeTruthy()
      expect(record.position).toBe(30)
      expect(record.completed).toBe(false)
    })

    it('should update an existing progress record', () => {
      const userId = 'user-test-1'
      const courseId = 'course-prog-1'
      const now = new Date().toISOString()

      db.insert(progress).values({
        userId, courseId, position: 60, completed: false, updatedAt: now,
      }).onConflictDoUpdate({
        target: [progress.userId, progress.courseId],
        set: { position: 60, updatedAt: now },
      }).run()

      const [record] = db.select()
        .from(progress)
        .where(and(eq(progress.userId, userId), eq(progress.courseId, courseId)))
        .limit(1)
        .all()

      expect(record.position).toBe(60)
    })
  })

  describe('Mark Complete', () => {
    it('should mark a course as completed', () => {
      const userId = 'user-test-2'
      const courseId = 'course-prog-1'
      const now = new Date().toISOString()

      db.insert(progress).values({
        userId, courseId, position: 100, completed: true,
        completedAt: now, updatedAt: now,
      }).run()

      const [record] = db.select()
        .from(progress)
        .where(and(eq(progress.userId, userId), eq(progress.courseId, courseId)))
        .limit(1)
        .all()

      expect(record.completed).toBe(true)
      expect(record.completedAt).toBeTruthy()
    })
  })

  describe('Get Progress', () => {
    it('should return progress for a user and course', () => {
      const records = db.select()
        .from(progress)
        .where(eq(progress.userId, 'user-test-1'))
        .all()

      expect(records.length).toBeGreaterThanOrEqual(1)
    })

    it('should return empty for non-existent user', () => {
      const records = db.select()
        .from(progress)
        .where(eq(progress.userId, 'non-existent-user'))
        .all()

      expect(records.length).toBe(0)
    })
  })
})