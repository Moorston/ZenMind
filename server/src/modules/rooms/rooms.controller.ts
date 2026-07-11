import { Controller, Post, Get, Param, Body } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { eq, desc } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import { DRIZZLE } from '@/modules/db/db.module'
import { rooms, roomParticipants } from '@/db/schema/rooms'
import { success, error } from '@/common/api-response'
import * as crypto from 'crypto'

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<any>) {}

  @Post()
  async createRoom(@Body() body: { name: string; hostId: string; courseId?: string }) {
    if (!body.name || !body.hostId) return error('name and hostId are required')
    const id = crypto.randomUUID()
    this.db.insert(rooms).values({
      id, name: body.name, hostId: body.hostId,
      courseId: body.courseId || null,
    }).run()
    const [room] = this.db.select().from(rooms).where(eq(rooms.id, id)).limit(1).all()
    return success(room)
  }

  @Get()
  async getRooms() {
    const data = this.db.select().from(rooms).orderBy(desc(rooms.createdAt)).all()
    const enriched = data.map(room => {
      const participants = this.db.select().from(roomParticipants)
        .where(eq(roomParticipants.roomId, room.id)).all()
      return { ...room, participantCount: participants.length }
    })
    return success(enriched)
  }

  @Get(':id')
  async getRoom(@Param('id') id: string) {
    const [room] = this.db.select().from(rooms).where(eq(rooms.id, id)).limit(1).all()
    if (!room) return error('Room not found')
    const participants = this.db.select().from(roomParticipants)
      .where(eq(roomParticipants.roomId, id)).all()
    return success({ ...room, participants })
  }
}