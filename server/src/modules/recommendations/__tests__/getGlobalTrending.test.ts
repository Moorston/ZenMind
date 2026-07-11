import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestDb } from '../../../../test/setup'
import { RecommendationsService } from '../recommendations.service'
import { CoursesRepository } from '@/repositories/courses.repository'
import { courses } from '@/db/schema/courses'
import { instructors } from '@/db/schema/instructors'
import { progress } from '@/db/schema/progress'
import { users } from '@/db/schema/users'

/**
 * 测试子类：暴露 protected 方法 getGlobalTrending
 */
class TestableRecommendationsService extends RecommendationsService {
  public testGetGlobalTrending(catalog: any[]) {
    return this.getGlobalTrending(catalog)
  }
}

describe('RecommendationsService - getGlobalTrending (via subclass)', () => {
  let db: ReturnType<typeof createTestDb>['db']
  let sqlite: ReturnType<typeof createTestDb>['sqlite']
  let service: TestableRecommendationsService

  beforeAll(() => {
    const testDb = createTestDb()
    db = testDb.db
    sqlite = testDb.sqlite

    // 创建一个 Mock CoursesRepository
    const mockRepo = {
      findAll: async () => [],
      findById: async () => null,
    } as unknown as CoursesRepository

    service = new TestableRecommendationsService(db, mockRepo)

    // 插入测试数据
    db.insert(instructors).values({ id: 'instr-1', name: 'Test', avatarUrl: '', bio: '', voiceType: 'gentle' }).run()
    db.insert(users).values({ id: 'user-1', email: 'test@test.com', password: 'hashed', nickname: 'Test' }).run()

    const testCourses = [
      { id: 'c1', title: 'Course 1', description: '', category: 'breathing' as const, level: 'beginner' as const, duration: 5, coverUrl: '', audioUrl: '', tags: '[]', instructorId: 'instr-1' },
      { id: 'c2', title: 'Course 2', description: '', category: 'mindfulness' as const, level: 'beginner' as const, duration: 10, coverUrl: '', audioUrl: '', tags: '[]', instructorId: 'instr-1' },
      { id: 'c3', title: 'Course 3', description: '', category: 'visualization' as const, level: 'beginner' as const, duration: 15, coverUrl: '', audioUrl: '', tags: '[]', instructorId: 'instr-1' },
    ]
    for (const c of testCourses) {
      db.insert(courses).values(c).run()
    }

    // 给 user-1 添加播放记录：c1 有3次，c2 有1次
    db.insert(progress).values({ userId: 'user-1', courseId: 'c1', position: 100, completed: false }).run()
    // 用另一个用户模拟多次播放
    db.insert(users).values({ id: 'user-2', email: 'u2@test.com', password: 'hashed', nickname: 'U2' }).run()
    db.insert(users).values({ id: 'user-3', email: 'u3@test.com', password: 'hashed', nickname: 'U3' }).run()
    db.insert(progress).values({ userId: 'user-2', courseId: 'c1', position: 200, completed: true }).run()
    db.insert(progress).values({ userId: 'user-3', courseId: 'c1', position: 300, completed: false }).run()
    db.insert(progress).values({ userId: 'user-2', courseId: 'c2', position: 100, completed: false }).run()
  })

  afterAll(() => { sqlite.close() })

  it('should return trending courses based on play count', () => {
    const catalog = [
      { id: 'c1', title: 'Course 1', category: 'breathing', level: 'beginner', duration: 5, coverUrl: '', audioUrl: '', tags: '[]', instructorId: 'instr-1', seriesId: null },
      { id: 'c2', title: 'Course 2', category: 'mindfulness', level: 'beginner', duration: 10, coverUrl: '', audioUrl: '', tags: '[]', instructorId: 'instr-1', seriesId: null },
      { id: 'c3', title: 'Course 3', category: 'visualization', level: 'beginner', duration: 15, coverUrl: '', audioUrl: '', tags: '[]', instructorId: 'instr-1', seriesId: null },
    ]

    const result = service.testGetGlobalTrending(catalog)

    // c1 有3次播放，c2 有1次，c3 有0次
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].id).toBe('c1') // 最热门
    expect(result[0].reason).toBe('大家都在听')
    expect(result[0].reasonType).toBe('trending')
  })

  it('should fallback to first 5 courses when no progress data', () => {
    // 创建一个没有 progress 数据的空数据库
    const emptyDb = createTestDb()
    emptyDb.db.insert(instructors).values({ id: 'instr-1', name: 'Test', avatarUrl: '', bio: '', voiceType: 'gentle' }).run()
    for (let i = 1; i <= 7; i++) {
      emptyDb.db.insert(courses).values({
        id: `ec${i}`, title: `Empty Course ${i}`, description: '', category: 'breathing', level: 'beginner',
        duration: 5, coverUrl: '', audioUrl: '', tags: '[]', instructorId: 'instr-1',
      }).run()
    }

    const emptyRepo = { findAll: async () => [] } as unknown as CoursesRepository
    const emptyService = new TestableRecommendationsService(emptyDb.db, emptyRepo)

    const catalog = Array.from({ length: 7 }, (_, i) => ({
      id: `ec${i + 1}`, title: `Empty Course ${i + 1}`, category: 'breathing', level: 'beginner',
      duration: 5, coverUrl: '', audioUrl: '', tags: '[]', instructorId: 'instr-1', seriesId: null,
    }))

    const result = emptyService.testGetGlobalTrending(catalog)

    expect(result.length).toBe(5) // 默认返回前5个
    expect(result[0].reason).toBe('热门推荐')
    expect(result[0].reasonType).toBe('trending')

    emptyDb.sqlite.close()
  })
})
