import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket,
} from '@nestjs/websockets'
import { Inject } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import { DRIZZLE } from '@/modules/db/db.module'
import { roomParticipants } from '@/db/schema/rooms'

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/ws/rooms',
})
export class RoomsGateway {
  @WebSocketServer()
  server: any

  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<any>) {}

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: any,
    @MessageBody() data: { roomId: string; userId: string },
  ) {
    client.join(data.roomId)

    this.db.insert(roomParticipants).values({
      roomId: data.roomId,
      userId: data.userId,
      role: 'participant',
    }).onConflictDoNothing().run()

    this.server.to(data.roomId).emit('userJoined', {
      userId: data.userId,
      timestamp: Date.now(),
    })
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: any,
    @MessageBody() data: { roomId: string; userId: string },
  ) {
    client.leave(data.roomId)

    this.db.delete(roomParticipants)
      .where(eq(roomParticipants.userId, data.userId))
      .run()

    this.server.to(data.roomId).emit('userLeft', {
      userId: data.userId,
      timestamp: Date.now(),
    })
  }

  @SubscribeMessage('playbackSync')
  handlePlaybackSync(
    @ConnectedSocket() client: any,
    @MessageBody() data: { roomId: string; currentTime: number; isPlaying: boolean },
  ) {
    client.to(data.roomId).emit('playbackUpdate', {
      currentTime: data.currentTime,
      isPlaying: data.isPlaying,
      timestamp: Date.now(),
    })
  }
}