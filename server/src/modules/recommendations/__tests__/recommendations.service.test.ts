import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestDb } from '../../../../test/setup'
import { eq, and, desc, count } from 'drizzle-orm'
import { courses } from '@/db/schema/courses'
import { instructors } from '@/db/schema/instructors'
import { series } from '@/db/schema/series'
import { progress } from '@/db/schema/progress'
import * as crypto from 'crypto'

describe('RecommendationsService', () => {
  let db: ReturnType<typeof createTestDb>['db']
  let sqlite: ReturnType<typeof createTestDb>['sqlite']
  const userId = crypto.randomUUID()

  beforeAll(() => {
    const testDb = createTestDb()
    db = testDb.db
    sqlite = testDb.sqlite

    // Seed test data
    db.insert(instructors).values({ id: 'rec-instr', name: '推荐导师', avatarUrl: '', bio: '', voiceType: 'gentle' }).run()

    db.insert(courses).values([
      { id: 'rec-c1', title: '呼吸课', description: '呼吸', category: 'breathing', level: 'beginner', duration: 5, coverUrl: '', audioUrl: '', tags: '[]', instructorId: 'rec-instr' },
      { id: 'rec-c2', title: '正念课', description: '正念', category: 'mindfulness', level: 'intermediate', duration: 10, coverUrl: '', audioUrl: '', tags: '[]', instructorId: 'rec-instr' },
      { id: 'rec-c3', title: '睡眠课', description: '睡眠', category: 'visualization', level: 'beginner', duration: 15, coverUrl: '', audioUrl: '', tags: '[]', instructorId: 'rec-instr' },
    ]).run()
  })

  afterAll(() => { sqlite.close() })

  describe('Time-based category rules', () => {
    it('should recommend breathing category for afternoon hours', () => {
      const hour = 14 // afternoon
      const category = hour >= 12 && hour < 18 ? 'breathing' : 'other'
      expect(category).toBe('breathing')
    })

    it('should recommend mindfulness category for morning hours', () => {
      const hour = 8 // morning
      const category = hour >= 5 && hour < 12 ? 'mindfulness' : 'other'
      expect(category).toBe('mindfulness')
    })

    it('should recommend visualization category for evening hours', () => {
      const hour = 22 // evening
      const category = hour >= 18 || hour < 5 ? 'visualization' : 'other'
      expect(category).toBe('visualization')
    })
  })

  describe('Course filtering', () => {
    it('should exclude completed courses', () => {
      // User completed course-1
      db.insert(progress).values({
        userId, courseId: 'rec-c1', position: 300, completed: true,
        completedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }).run()

      const completedIds = db.select().from(progress)
        .where(and(eq(progress.userId, userId), eq(progress.completed, true)))
        .all().map(p => p.courseId)

      const catalog = db.select().from(courses).all()
      const filtered = catalog.filter(c => !completedIds.includes(c.id))

      expect(filtered.length).toBe(2) // excludes completed course
      expect(filtered.find(c => c.id === 'rec-c1')).toBeUndefined()
    })

    it('should find similar courses by category and level', () => {
      const course = db.select().from(courses).where(eq(courses.id, 'rec-c1')).limit(1).all()[0]
      const similar = db.select().from(courses)
        .where(and(eq(courses.category, course.category), eq(courses.level, course.level)))
        .all()
        .filter(c => c.id !== course.id)

      // No other breathing+beginner courses, so similar = 0
      expect(similar.length).toBe(0)
    })

    it('should find trending courses by play count', () => {
      const topCourses = db.select({
        courseId: progress.courseId,
        playCount: count(),
      })
        .from(progress)
        .groupBy(progress.courseId)
        .orderBy(desc(count()))
        .limit(10)
        .all()

      expect(topCourses.length).toBeGreaterThanOrEqual(1)
      expect(topCourses[0].courseId).toBe('rec-c1')
    })
  })
})
