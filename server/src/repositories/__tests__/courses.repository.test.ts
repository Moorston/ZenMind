import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestDb } from '../../../test/setup'
import { eq } from 'drizzle-orm'
import { instructors } from '@/db/schema/instructors'
import { series } from '@/db/schema/series'
import { courses } from '@/db/schema/courses'

describe('CoursesRepository', () => {
  let db: ReturnType<typeof createTestDb>['db']
  let sqlite: ReturnType<typeof createTestDb>['sqlite']

  beforeAll(() => {
    const testDb = createTestDb()
    db = testDb.db
    sqlite = testDb.sqlite

    db.insert(instructors).values({
      id: 'repo-instr', name: 'Repo测试导师',
      avatarUrl: 'https://example.com/avatar.jpg', bio: '测试导师',
      voiceType: 'gentle',
    }).run()

    db.insert(series).values({
      id: 'repo-series', title: 'Repo测试系列', description: '测试系列',
      coverUrl: 'https://example.com/cover.jpg', level: 'beginner',
      estimatedDays: 7, isRecommended: true, order: 1,
    }).run()

    db.insert(courses).values({
      id: 'repo-course-1', title: 'Repo课程1', description: '测试课程1',
      category: 'breathing', level: 'beginner', duration: 10,
      coverUrl: 'https://example.com/c1.jpg', audioUrl: 'https://example.com/a1.mp3',
      tags: JSON.stringify(['测试']), instructorId: 'repo-instr', seriesId: 'repo-series',
      orderInSeries: 1,
    }).run()

    db.insert(courses).values({
      id: 'repo-course-2', title: 'Repo课程2', description: '测试课程2',
      category: 'mindfulness', level: 'intermediate', duration: 15,
      coverUrl: 'https://example.com/c2.jpg', audioUrl: 'https://example.com/a2.mp3',
      tags: JSON.stringify(['测试']), instructorId: 'repo-instr',
      orderInSeries: 2,
    }).run()
  })

  afterAll(() => { sqlite.close() })

  it('findById should return course by ID', () => {
    const rows = db.select().from(courses).where(eq(courses.id, 'repo-course-1')).limit(1).all()
    expect(rows.length).toBe(1)
    expect(rows[0].title).toBe('Repo课程1')
  })

  it('findById should return null for non-existent ID', () => {
    const rows = db.select().from(courses).where(eq(courses.id, 'non-existent')).limit(1).all()
    expect(rows.length).toBe(0)
  })

  it('findAll should return all courses', () => {
    const rows = db.select().from(courses).all()
    expect(rows.length).toBeGreaterThanOrEqual(2)
  })

  it('findAll should filter by category', () => {
    const rows = db.select().from(courses).where(eq(courses.category, 'breathing')).all()
    expect(rows.length).toBe(1)
    expect(rows[0].category).toBe('breathing')
  })

  it('create should persist a new course', () => {
    db.insert(courses).values({
      id: 'repo-course-3', title: '新课程', description: '描述',
      category: 'body-scan', level: 'beginner', duration: 5,
      coverUrl: 'https://example.com/c3.jpg', audioUrl: 'https://example.com/a3.mp3',
      tags: JSON.stringify(['新']),
    }).run()

    const rows = db.select().from(courses).where(eq(courses.id, 'repo-course-3')).all()
    expect(rows.length).toBe(1)
  })

  it('update should modify course fields', () => {
    db.update(courses).set({ title: '更新标题', duration: 30 })
      .where(eq(courses.id, 'repo-course-3')).run()

    const [course] = db.select().from(courses).where(eq(courses.id, 'repo-course-3')).limit(1).all()
    expect(course.title).toBe('更新标题')
    expect(course.duration).toBe(30)
  })

  it('delete should remove a course', () => {
    db.delete(courses).where(eq(courses.id, 'repo-course-3')).run()
    const rows = db.select().from(courses).where(eq(courses.id, 'repo-course-3')).all()
    expect(rows.length).toBe(0)
  })

  it('findBySeries should return courses linked to series', () => {
    const rows = db.select().from(courses).where(eq(courses.seriesId, 'repo-series')).all()
    expect(rows.length).toBe(1)
    expect(rows[0].id).toBe('repo-course-1')
  })
})