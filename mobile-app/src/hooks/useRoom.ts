import { useState, useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { AppState, AppStateStatus } from 'react-native'

interface RoomState {
  participants: string[]
  playbackState: {
    currentTime: number
    isPlaying: boolean
  }
}

const SOCKET_URL = 'http://localhost:3000'

export function useRoom(roomId: string | null) {
  const [state, setState] = useState<RoomState>({
    participants: [],
    playbackState: { currentTime: 0, isPlaying: false },
  })
  const socketRef = useRef<Socket | null>(null)
  const roomIdRef = useRef<string | null>(roomId)
  const userIdRef = useRef<string | null>(null)
  roomIdRef.current = roomId

  const connect = useCallback((userId: string) => {
    if (!roomId || !userId) return
    userIdRef.current = userId

    // 防止重复连接
    if (socketRef.current?.connected) return

    const socket = io(`${SOCKET_URL}/ws/rooms`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[useRoom] connected')
      socket.emit('joinRoom', { roomId, userId })
    })

    socket.on('userJoined', (data: { userId: string; timestamp: string }) => {
      setState(prev => ({
        ...prev,
        participants: [...new Set([...prev.participants, data.userId])],
      }))
    })

    socket.on('userLeft', (data: { userId: string; timestamp: string }) => {
      setState(prev => ({
        ...prev,
        participants: prev.participants.filter(id => id !== data.userId),
      }))
    })

    socket.on('playbackUpdate', (data: { currentTime: number; isPlaying: boolean; timestamp: string }) => {
      setState(prev => ({
        ...prev,
        playbackState: { currentTime: data.currentTime, isPlaying: data.isPlaying },
      }))
    })

    socket.on('disconnect', (reason: string) => {
      console.log('[useRoom] disconnected:', reason)
    })

    socket.on('connect_error', (err: Error) => {
      console.error('[useRoom] connection error:', err.message)
    })
  }, [roomId])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      // 先发送 leaveRoom，再断开连接
      if (roomIdRef.current && userIdRef.current) {
        socketRef.current.emit('leaveRoom', {
          roomId: roomIdRef.current,
          userId: userIdRef.current,
        })
      }
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setState({ participants: [], playbackState: { currentTime: 0, isPlaying: false } })
  }, [])

  const sendPlaybackSync = useCallback((currentTime: number, isPlaying: boolean) => {
    if (socketRef.current?.connected && roomId) {
      socketRef.current.emit('playbackSync', { roomId, currentTime, isPlaying })
    }
  }, [roomId])

  // 处理 AppState 变化：后台时断开，前台时重连
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        // 进入后台时断开
        if (socketRef.current?.connected) {
          if (roomIdRef.current && userIdRef.current) {
            socketRef.current.emit('leaveRoom', {
              roomId: roomIdRef.current,
              userId: userIdRef.current,
            })
          }
          socketRef.current.disconnect()
        }
      } else if (nextState === 'active') {
        // 回到前台时重连
        if (roomIdRef.current && userIdRef.current && !socketRef.current?.connected) {
          connect(userIdRef.current)
        }
      }
    }

    const subscription = AppState.addEventListener('change', handleAppState)
    return () => { subscription.remove() }
  }, [connect])

  useEffect(() => {
    return () => { disconnect() }
  }, [disconnect])

  return { ...state, connect, disconnect, sendPlaybackSync }
}
