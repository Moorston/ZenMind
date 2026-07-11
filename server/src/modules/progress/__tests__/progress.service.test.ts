import { describe, it, expect, beforeAll } from 'vitest'
import { createTestDb } from '../../../../test/setup'
import { eq, and } from 'drizzle-orm'
import * as crypto from 'crypto'
import { courses } from '@/db/schema/courses'
import { progress } from '@/db/schema/progress'

describe('ProgressService', () => {
  let db: ReturnType<typeof createTestDb>['db']

  beforeAll(() => {
    const testDb = createTestDb()
    db = testDb.db

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
      createdAt: new Date().toISOString(),
    }).run()
  })

  describe('updateProgress (upsert)', () => {
    it('should create a new progress record', () => {
      const userId = 'user-1'
      const courseId = 'course-prog-1'
      const now = new Date().toISOString()

      db.insert(progress).values({
        userId,
        courseId,
        position: 30,
        completed: false,
        updatedAt: now,
      }).run()

      const records = db.select()
        .from(progress)
        .where(and(eq(progress.userId, userId), eq(progress.courseId, courseId)))
        .all()

      expect(records.length).toBe(1)
      expect(records[0].position).toBe(30)
      expect(records[0].completed).toBe(false)
    })

    it('should update an existing progress record (upsert)', () => {
      const userId = 'user-1'
      const courseId = 'course-prog-1'
      const now = new Date().toISOString()

      // Update with onConflictDoUpdate
      db.insert(progress).values({
        userId,
        courseId,
        position: 60,
        completed: false,
        updatedAt: now,
      }).onConflictDoUpdate({
        target: [progress.userId, progress.courseId],
        set: { position: 60, updatedAt: now },
      }).run()

      const records = db.select()
        .from(progress)
        .where(and(eq(progress.userId, userId), eq(progress.courseId, courseId)))
        .all()

      expect(records.length).toBe(1)
      expect(records[0].position).toBe(60)
    })
  })

  describe('markCompleted', () => {
    it('should mark a course as completed', () => {
      const userId = 'user-2'
      const courseId = 'course-prog-1'
      const now = new Date().toISOString()

      db.insert(progress).values({
        userId,
        courseId,
        position: 100,
        completed: true,
        completedAt: now,
        updatedAt: now,
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

  describe('getProgress', () => {
    it('should return progress for a user+course pair', () => {
      const [record] = db.select()
        .from(progress)
        .where(and(eq(progress.userId, 'user-1'), eq(progress.courseId, 'course-prog-1')))
        .limit(1)
        .all()

      expect(record).toBeTruthy()
      expect(record.position).toBeGreaterThanOrEqual(0)
    })

    it('should return empty for non-existent pair', () => {
      const records = db.select()
        .from(progress)
        .where(and(eq(progress.userId, 'ghost-user'), eq(progress.courseId, 'ghost-course')))
        .all()

      expect(records.length).toBe(0)
    })
  })
})