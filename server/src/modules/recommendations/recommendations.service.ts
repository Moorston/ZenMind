import { Injectable, Logger } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { eq, and, desc, not, inArray, count } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import { DRIZZLE } from '@/modules/db/db.module'
import { courses } from '@/db/schema/courses'
import { progress } from '@/db/schema/progress'
import { CoursesRepository } from '@/repositories/courses.repository'

export interface RecommendedCourse {
  id: string
  title: string
  description: string
  category: string
  level: string
  duration: number
  coverUrl: string
  audioUrl: string
  tags: string[]
  instructorId: string | null
  seriesId: string | null
  reason: string
  reasonType: 'collaborative' | 'time-based' | 'preference' | 'trending' | 'similar' | 'fallback'
}

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name)
  private recommendationCache = new Map<string, { data: RecommendedCourse[]; expiresAt: number }>()
  private cacheDebounceTimers = new Map<string, ReturnType<typeof setTimeout>>()
  private static readonly CACHE_TTL = 5 * 60 * 1000
  private static readonly DEBOUNCE_DELAY = 30 * 1000 // 30秒防抖
  private static readonly MAX_CACHE_SIZE = 1000

  // 用户偏好 → 推荐课程分类映射
  private static readonly PREFERENCE_CATEGORY_MAP: Record<string, { category: string; reason: string }> = {
    sleep: { category: 'body-scan', reason: '根据你的偏好·助眠冥想' },
    anxiety: { category: 'loving-kindness', reason: '根据你的偏好·减压冥想' },
    focus: { category: 'mindfulness', reason: '根据你的偏好·专注冥想' },
  }

  constructor(
    @Inject(DRIZZLE) private db: BetterSQLite3Database<any>,
    private readonly coursesRepo: CoursesRepository,
  ) {}

  async getPersonalized(userId: string, preference?: string): Promise<RecommendedCourse[]> {
    const cacheKey = preference ? `${userId}:${preference}` : userId
    const cached = this.recommendationCache.get(cacheKey)
    if (cached && Date.now() < cached.expiresAt) return cached.data

    const userProgressCount = this.db.select({ count: count() })
      .from(progress)
      .where(eq(progress.userId, userId))
      .all()[0]?.count || 0

    const collaborative = userProgressCount >= 2
      ? await this.collaborativeFilter(userId)
      : []

    if (collaborative.length >= 3) {
      this.setCache(cacheKey, collaborative)
      return collaborative
    }

    const completedCourseIds = new Set(this.db.select().from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.completed, true)))
      .all().map(p => p.courseId))

    const catalog = await this.coursesRepo.findAll()
    let result: RecommendedCourse[] = []

    // 策略2：用户偏好优先（最高优先级）
    if (preference && RecommendationsService.PREFERENCE_CATEGORY_MAP[preference]) {
      const prefConfig = RecommendationsService.PREFERENCE_CATEGORY_MAP[preference]
      result = catalog
        .filter(c => c.category === prefConfig.category && !completedCourseIds.has(c.id))
        .slice(0, 5)
        .map(c => this.toRecommendedCourse(c, prefConfig.reason, 'preference'))
    }

    // 偏好无结果时降级到时间段推荐
    if (result.length === 0) {
      const hour = new Date().getHours()
      const timeConfig = hour >= 5 && hour < 12
        ? { category: 'mindfulness', reason: '清晨推荐·正念冥想' }
        : hour >= 12 && hour < 18
          ? { category: 'breathing', reason: '午后推荐·呼吸练习' }
          : { category: 'visualization', reason: '夜间推荐·引导想象' }

      result = catalog
        .filter(c => c.category === timeConfig.category && !completedCourseIds.has(c.id))
        .slice(0, 5)
        .map(c => this.toRecommendedCourse(c, timeConfig.reason, 'time-based'))
    }

    // 降级：排除已完成的课程
    if (result.length === 0) {
      result = catalog
        .filter(c => !completedCourseIds.has(c.id))
        .slice(0, 5)
        .map(c => this.toRecommendedCourse(c, '为你推荐', 'fallback'))
    }

    // 冷启动降级：全局热门课程（新用户 < 2 条进度记录时使用）
    if (result.length === 0 || userProgressCount < 2) {
      const trending = this.getGlobalTrending(catalog)
      if (trending.length > 0) {
        const existingIds = new Set(result.map(c => c.id))
        const extra = trending.filter(c => !existingIds.has(c.id))
        result = [...extra, ...result].slice(0, 5)
      }
    }

    if (result.length === 0) {
      result = catalog.slice(0, 5).map(c => this.toRecommendedCourse(c, '热门推荐', 'fallback'))
    }

    // 合并协同过滤结果（如果不足3个）
    if (collaborative.length > 0) {
      const existingIds = new Set(result.map(c => c.id))
      const extra = collaborative.filter(c => !existingIds.has(c.id))
      result = [...extra, ...result].slice(0, 5)
    }

    this.setCache(cacheKey, result)
    return result
  }

  private async collaborativeFilter(userId: string): Promise<RecommendedCourse[]> {
    const userProgress = this.db.select().from(progress).where(eq(progress.userId, userId)).all()
    if (userProgress.length < 2) return []

    const userCourseIds = userProgress.map(p => p.courseId)
    const catalog = await this.coursesRepo.findAll()

    // 找到相似用户（播放历史有重叠的用户）
    const similarUsers = this.db.select({
      otherUserId: progress.userId,
      matchCount: count(),
    })
      .from(progress)
      .where(inArray(progress.courseId, userCourseIds))
      .groupBy(progress.userId)
      .orderBy(desc(count()))
      .limit(10)
      .all()
      .filter(u => u.otherUserId !== userId)

    if (similarUsers.length === 0) return []

    const similarUserIds = similarUsers.map(u => u.otherUserId)
    const recommended = this.db.select({
      courseId: progress.courseId,
      popularity: count(),
    })
      .from(progress)
      .where(and(
        inArray(progress.userId, similarUserIds),
        not(inArray(progress.courseId, userCourseIds)),
      ))
      .groupBy(progress.courseId)
      .orderBy(desc(count()))
      .limit(5)
      .all()

    return catalog
      .filter(c => recommended.some(r => r.courseId === c.id))
      .map(c => this.toRecommendedCourse(c, '相似用户喜欢', 'collaborative'))
  }

  async getSimilar(courseId: string): Promise<RecommendedCourse[]> {
    const catalog = await this.coursesRepo.findAll()
    const course = catalog.find(c => c.id === courseId)
    if (!course) return []
    return catalog
      .filter(c => c.category === course.category && c.level === course.level && c.id !== courseId)
      .slice(0, 5)
      .map(c => this.toRecommendedCourse(c, `与"${course.title}"相似`, 'similar'))
  }

  async getTrending(): Promise<RecommendedCourse[]> {
    const topCourses = this.db.select({
      courseId: progress.courseId,
      playCount: count(),
    })
      .from(progress)
      .groupBy(progress.courseId)
      .orderBy(desc(count()))
      .limit(10)
      .all()

    const courseIds = topCourses.map(c => c.courseId)
    const catalog = await this.coursesRepo.findAll()

    if (courseIds.length === 0) {
      return catalog.slice(0, 10).map(c => this.toRecommendedCourse(c, '热门推荐', 'trending'))
    }

    // 保持播放次数排序
    const playCountMap = new Map(topCourses.map(t => [t.courseId, t.playCount]))
    return catalog
      .filter(c => courseIds.includes(c.id))
      .sort((a, b) => (playCountMap.get(b.id) || 0) - (playCountMap.get(a.id) || 0))
      .map(c => this.toRecommendedCourse(c, '热门课程', 'trending'))
  }

  /**
   * 获取全局热门课程（基于播放次数排序）
   * 用于新用户冷启动降级推荐
   */
  protected getGlobalTrending(catalog: any[]): any[] {
    const topCourses = this.db.select({
      courseId: progress.courseId,
      playCount: count(),
    })
      .from(progress)
      .groupBy(progress.courseId)
      .orderBy(desc(count()))
      .limit(5)
      .all()

    if (topCourses.length === 0) {
      return catalog.slice(0, 5).map(c => this.toRecommendedCourse(c, '热门推荐', 'trending'))
    }

    // 保持播放次数排序
    const playCountMap = new Map(topCourses.map(t => [t.courseId, t.playCount]))
    return catalog
      .filter(c => topCourses.some(t => t.courseId === c.id))
      .sort((a, b) => (playCountMap.get(b.id) || 0) - (playCountMap.get(a.id) || 0))
      .map(c => this.toRecommendedCourse(c, '大家都在听', 'trending'))
  }

  async recordPlay(userId: string, courseId: string, playedSeconds: number) {
    this.logger.log(`Play recorded: user=${userId} course=${courseId} played=${playedSeconds}s`)

    // 使用 upsert 避免并发问题，更简洁且面向未来
    this.db.insert(progress)
      .values({
        userId,
        courseId,
        position: playedSeconds,
        completed: false,
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: [progress.userId, progress.courseId],
        set: {
          position: playedSeconds,
          completed: false,
          completedAt: null,
          updatedAt: new Date().toISOString(),
        },
      })
      .run()

    // 防抖缓存失效：30秒内多次播放只触发一次缓存清除
    this.debounceCacheInvalidation(userId)
  }

  /**
   * 防抖缓存失效：避免短时间内多次播放导致缓存反复重建
   */
  private debounceCacheInvalidation(userId: string) {
    const existingTimer = this.cacheDebounceTimers.get(userId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const timer = setTimeout(() => {
      this.recommendationCache.delete(userId)
      this.cacheDebounceTimers.delete(userId)
      this.logger.debug(`Cache invalidated for user ${userId} (debounced)`)
    }, RecommendationsService.DEBOUNCE_DELAY)

    this.cacheDebounceTimers.set(userId, timer)
  }

  private setCache(key: string, data: RecommendedCourse[]) {
    // 缓存大小超限时清理过期条目
    if (this.recommendationCache.size >= RecommendationsService.MAX_CACHE_SIZE) {
      const now = Date.now()
      for (const [k, v] of this.recommendationCache) {
        if (now >= v.expiresAt) this.recommendationCache.delete(k)
      }
      // 如果清理后仍超限，删除最旧的条目
      if (this.recommendationCache.size >= RecommendationsService.MAX_CACHE_SIZE) {
        const firstKey = this.recommendationCache.keys().next().value
        if (firstKey) this.recommendationCache.delete(firstKey)
      }
    }
    this.recommendationCache.set(key, {
      data,
      expiresAt: Date.now() + RecommendationsService.CACHE_TTL,
    })
  }

  private toRecommendedCourse(course: any, reason: string, reasonType: RecommendedCourse['reasonType']): RecommendedCourse {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      coverUrl: course.coverUrl,
      audioUrl: course.audioUrl,
      tags: course.tags,
      instructorId: course.instructorId,
      seriesId: course.seriesId,
      reason,
      reasonType,
    }
  }
}