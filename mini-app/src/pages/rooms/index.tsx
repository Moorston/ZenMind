import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Network } from '@/network'
import { useAuthStore } from '@/store/auth'
import { Users, Play } from 'lucide-react-taro'

interface Room {
  id: string
  name: string
  hostId: string
  courseId: string | null
  status: string
  participantCount: number
  createdAt: string
}

export default function Rooms() {
  const { t } = useTranslation()
  const { isLoggedIn, user } = useAuthStore()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchRooms() }, [])

  const fetchRooms = async () => {
    try {
      const res = await Network.request<{ status: string; data: Room[] }>({
        url: '/api/rooms', method: 'GET',
      })
      if (res.data?.status === 'success') setRooms(res.data.data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleJoinRoom = (roomId: string) => {
    if (!isLoggedIn) { Taro.navigateTo({ url: '/pages/auth/index' }); return }
    Taro.navigateTo({ url: `/pages/player/index?roomId=${roomId}` })
  }

  const handleCreateRoom = () => {
    if (!isLoggedIn) { Taro.navigateTo({ url: '/pages/auth/index' }); return }
    Taro.showToast({ title: '创建房间功能开发中', icon: 'none' })
  }

  return (
    <View className="flex flex-col h-screen bg-background overflow-hidden">
      <View className="flex items-center justify-between px-4 pt-4 pb-2">
        <Text className="block text-xl font-bold text-foreground">{t('rooms.title', '多人冥想')}</Text>
        <Button size="sm" className="bg-primary text-white" onClick={handleCreateRoom}>
          <Text className="block text-xs">{t('rooms.create', '创建房间')}</Text>
        </Button>
      </View>

      <ScrollView scrollY className="flex-1 px-4 pb-8">
        {loading ? (
          <View className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</View>
        ) : rooms.length === 0 ? (
          <View className="py-20 flex flex-col items-center">
            <Text className="block text-6xl mb-4">🧘</Text>
            <Text className="block text-muted-foreground text-center mb-4">{t('rooms.empty', '暂无房间')}</Text>
            <Button className="bg-primary text-white" onClick={handleCreateRoom}>
              <Text className="block">{t('rooms.createFirst', '创建第一个房间')}</Text>
            </Button>
          </View>
        ) : (
          <View className="space-y-4">
            {rooms.filter(r => r.status !== 'ended').map(room => (
              <Card key={room.id} className="bg-card border-0">
                <CardContent className="p-4">
                  <View className="flex items-center justify-between mb-2">
                    <Text className="block text-base font-medium text-foreground">{room.name}</Text>
                    <Badge className={room.status === 'playing' ? 'bg-secondary text-white' : 'bg-primary-20 text-primary'}>
                      {room.status === 'playing' ? '冥想中' : '等待中'}
                    </Badge>
                  </View>
                  <View className="flex items-center justify-between">
                    <View className="flex items-center gap-1">
                      <Users size={14} color="#9090a0" />
                      <Text className="block text-xs text-muted-foreground">{room.participantCount} 人</Text>
                    </View>
                    <Button size="sm" className="bg-primary text-white" onClick={() => handleJoinRoom(room.id)}>
                      <Play size={14} color="#fff" className="mr-1" />
                      <Text className="block text-xs">{t('rooms.join', '加入')}</Text>
                    </Button>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}