import { Inject } from '@nestjs/common'
import { DRIZZLE } from '@/modules/db/db.module'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'

/**
 * Repository 抽象基类
 * 提供通用的数据库操作方法，子类只需实现特定查询
 */
export abstract class BaseRepository<T> {
  constructor(
    @Inject(DRIZZLE) protected readonly db: BetterSQLite3Database<any>
  ) {}

  /**
   * 根据 ID 查找单条记录
   */
  abstract findById(id: string): Promise<T | null>

  /**
   * 查找所有记录（可选过滤）
   */
  abstract findAll(query?: Record<string, unknown>): Promise<T[]>

  /**
   * 创建记录
   */
  abstract create(data: Partial<T>): Promise<T>

  /**
   * 更新记录
   */
  abstract update(id: string, data: Partial<T>): Promise<T | null>

  /**
   * 删除记录
   */
  abstract delete(id: string): Promise<boolean>
}
