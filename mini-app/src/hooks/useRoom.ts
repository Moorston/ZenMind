import { useState, useEffect, useRef, useCallback } from 'react'
import Taro from '@tarojs/taro'

interface RoomState {
  participants: string[]
  playbackState: {
    currentTime: number
    isPlaying: boolean
  }
}

/**
 * mini-app 专用 useRoom hook（raw WebSocket）
 * 微信小程序环境不兼容 socket.io-client，保留原生 WebSocket 方案
 * mobile-app 使用 socket.io-client 版本（见 mobile-app/src/hooks/useRoom.ts）
 */
export function useRoom(roomId: string | null) {
  const [state, setState] = useState<RoomState>({
    participants: [],
    playbackState: { currentTime: 0, isPlaying: false },
  })
  const wsRef = useRef<WebSocket | null>(null)
  const roomIdRef = useRef<string | null>(roomId)
  const userIdRef = useRef<string | null>(null)
  roomIdRef.current = roomId

  const wsUrl = 'ws://localhost:3000/ws/rooms'

  const connect = useCallback((userId: string) => {
    if (!roomId || !userId) return
    userIdRef.current = userId

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ event: 'joinRoom', data: { roomId, userId } }))
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.event === 'userJoined') {
          setState(prev => ({
            ...prev,
            participants: [...new Set([...prev.participants, msg.data.userId])],
          }))
        } else if (msg.event === 'userLeft') {
          setState(prev => ({
            ...prev,
            participants: prev.participants.filter(id => id !== msg.data.userId),
          }))
        } else if (msg.event === 'playbackUpdate') {
          setState(prev => ({
            ...prev,
            playbackState: { currentTime: msg.data.currentTime, isPlaying: msg.data.isPlaying },
          }))
        }
      } catch {}
    }

    ws.onerror = () => {
      console.log('[useRoom] WebSocket error')
    }

    ws.onclose = () => {
      console.log('[useRoom] WebSocket closed')
    }
  }, [roomId, wsUrl])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      // 修复：先发送 leaveRoom，再关闭连接
      if (roomIdRef.current && userIdRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          event: 'leaveRoom',
          data: { roomId: roomIdRef.current, userId: userIdRef.current },
        }))
      }
      wsRef.current.close()
      wsRef.current = null
    }
    setState({ participants: [], playbackState: { currentTime: 0, isPlaying: false } })
  }, [])

  const sendPlaybackSync = useCallback((currentTime: number, isPlaying: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && roomId) {
      wsRef.current.send(JSON.stringify({
        event: 'playbackSync',
        data: { roomId, currentTime, isPlaying },
      }))
    }
  }, [roomId])

  useEffect(() => {
    return () => { disconnect() }
  }, [disconnect])

  return { ...state, connect, disconnect, sendPlaybackSync }
}
