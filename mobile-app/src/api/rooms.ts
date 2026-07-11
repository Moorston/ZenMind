import { Network } from './network'

export namespace RoomsAPI {
  export interface Room {
    id: string
    name: string
    hostId: string
    courseId: string | null
    status: 'waiting' | 'playing' | 'ended'
    participantCount: number
    createdAt: string
  }

  export interface RoomDetail extends Room {
    participants: Array<{
      roomId: string
      userId: string
      role: string
      joinedAt: string
    }>
  }

  export async function getRooms() {
    return Network.request<{ data: Room[] }>({
      url: '/api/rooms',
    })
  }

  export async function getRoom(roomId: string) {
    return Network.request<{ data: RoomDetail }>({
      url: `/api/rooms/${roomId}`,
    })
  }

  export async function createRoom(params: { name: string; hostId: string; courseId?: string }) {
    return Network.request<{ data: Room }>({
      url: '/api/rooms',
      method: 'POST',
      data: params,
    })
  }
}
