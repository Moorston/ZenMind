import { Injectable } from '@nestjs/common'
import { eq, asc } from 'drizzle-orm'
import { BaseRepository } from './base.repository'
import { instructors, type Instructor } from '@/db/schema/instructors'
import { courses } from '@/db/schema/courses'

@Injectable()
export class InstructorsRepository extends BaseRepository<Instructor> {
  async findById(id: string): Promise<Instructor | null> {
    const [item] = await this.db.select().from(instructors).where(eq(instructors.id, id)).limit(1)
    return item || null
  }

  async findAll() {
    return this.db.select().from(instructors).orderBy(asc(instructors.name)).all()
  }

  async create(data: Partial<Instructor>): Promise<Instructor> {
    const id = (data as any).id || crypto.randomUUID()
    const now = new Date().toISOString()
    const [item] = await this.db.insert(instructors).values({
      id,
      name: data.name!,
      avatarUrl: data.avatarUrl!,
      bio: data.bio!,
      voiceType: (data as any).voiceType || 'gentle',
      createdAt: now,
    }).returning()
    return item
  }

  async update(id: string, data: Partial<Instructor>): Promise<Instructor | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl
    if (data.bio !== undefined) updateData.bio = data.bio
    if ((data as any).voiceType !== undefined) updateData.voiceType = (data as any).voiceType

    const [updated] = await this.db.update(instructors).set(updateData).where(eq(instructors.id, id)).returning()
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id)
    if (!existing) return false

    // Set instructor_id to NULL for associated courses
    await this.db.update(courses).set({ instructorId: null }).where(eq(courses.instructorId, id)).run()
    await this.db.delete(instructors).where(eq(instructors.id, id)).run()
    return true
  }
}
