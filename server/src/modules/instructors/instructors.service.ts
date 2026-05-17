import { Inject, Injectable } from '@nestjs/common'
import { eq, asc } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import { DRIZZLE } from '@/modules/db/db.module'
import { instructors } from '@/db/schema/instructors'

@Injectable()
export class InstructorsService {
  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<any>) {}

  async findAll() {
    return this.db.select()
      .from(instructors)
      .orderBy(asc(instructors.name))
  }

  async findById(id: string) {
    const [instructor] = await this.db.select()
      .from(instructors)
      .where(eq(instructors.id, id))
      .limit(1)
    return instructor || null
  }
}
