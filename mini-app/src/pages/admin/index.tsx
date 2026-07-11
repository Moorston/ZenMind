import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePullDownRefresh } from '@tarojs/taro'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Network } from '@/network'
import { useAuthStore } from '@/store/auth'
import {
  Users, BookOpen, TrendingUp, Activity,
  UserCheck, Layers, Mic, BarChart3, Send
} from 'lucide-react-taro'

interface AdminStats {
  totalUsers: number
  totalCourses: number
  totalSessions: number
  totalMeditationMinutes: number
  activeUsersToday: number
}

export default function AdminDashboard() {
  const { t } = useTranslation()
  const { isLoggedIn, user } = useAuthStore()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn || !['admin', 'editor'].includes(user?.role || '')) {
      Taro.navigateBack()
      return
    }
    fetchStats()
  }, [isLoggedIn, user])

  // 下拉刷新
  usePullDownRefresh(() => {
    fetchStats().finally(() => Taro.stopPullDownRefresh())
  })

  const fetchStats = async () => {
    try {
      const res = await Network.request<{ status: string; data: AdminStats }>({
        url: '/api/admin/stats',
        method: 'GET',
      })
      if (res.data?.status === 'success') setStats(res.data.data)
    } catch (err) {
      console.error('[Admin] fetchStats failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBroadcast = () => {
    Taro.showModal({
      title: '广播推送',
      content: '确定要向所有用户发送推送通知吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const response = await Network.request<{ status: string; data?: { recipients: number } }>({
              url: '/api/admin/push/broadcast',
              method: 'POST',
              data: { title: '尘间静', body: '新内容上线，快来体验吧！' },
            })
            if (response.data?.status === 'success') {
              Taro.showToast({
                title: `已推送至 ${response.data.data?.recipients || 0} 人`,
                icon: 'success',
              })
            }
          } catch {
            Taro.showToast({ title: '推送失败', icon: 'none' })
          }
        }
      },
    })
  }

  if (loading) return <Skeleton className="h-screen w-full" />
  if (!stats) return null

  const menuItems = [
    {
      icon: Users,
      iconColor: '#7c6aef',
      title: t('admin.manageUsers', '用户管理'),
      subtitle: '查看和管理用户角色',
      url: '/pages/admin/users/index',
    },
    {
      icon: BookOpen,
      iconColor: '#2dd4bf',
      title: t('admin.manageCourses', '课程管理'),
      subtitle: '新增、编辑、删除课程',
      url: '/pages/admin/courses/index',
    },
    {
      icon: Send,
      iconColor: '#fbbf24',
      title: t('admin.pushBroadcast', '广播推送'),
      subtitle: '向所有用户发送通知',
      action: handleBroadcast,
    },
  ]

  return (
    <View className="flex flex-col h-screen bg-background overflow-hidden">
      <View className="flex items-center justify-between px-4 pt-4 pb-2">
        <Text className="block text-xl font-bold text-foreground">{t('admin.dashboard', '管理后台')}</Text>
        <Badge className="bg-primary text-white">Admin</Badge>
      </View>

      <ScrollView scrollY className="flex-1 px-4 pb-8">
        {/* 统计卡片 */}
        <View className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-card border-0">
            <CardContent className="p-4 text-center">
              <Users size={24} color="#7c6aef" />
              <Text className="block text-2xl font-bold text-primary mt-2">{stats.totalUsers}</Text>
              <Text className="block text-xs text-muted-foreground">{t('admin.totalUsers', '总用户')}</Text>
            </CardContent>
          </Card>

          <Card className="bg-card border-0">
            <CardContent className="p-4 text-center">
              <BookOpen size={24} color="#2dd4bf" />
              <Text className="block text-2xl font-bold text-secondary mt-2">{stats.totalCourses}</Text>
              <Text className="block text-xs text-muted-foreground">{t('admin.totalCourses', '总课程')}</Text>
            </CardContent>
          </Card>

          <Card className="bg-card border-0">
            <CardContent className="p-4 text-center">
              <Activity size={24} color="#fbbf24" />
              <Text className="block text-2xl font-bold text-warning mt-2">{stats.totalSessions}</Text>
              <Text className="block text-xs text-muted-foreground">{t('admin.totalSessions', '完成冥想')}</Text>
            </CardContent>
          </Card>

          <Card className="bg-card border-0">
            <CardContent className="p-4 text-center">
              <BarChart3 size={24} color="#8b5cf6" />
              <Text className="block text-2xl font-bold mt-2" style={{ color: '#8b5cf6' }}>{stats.totalMeditationMinutes}</Text>
              <Text className="block text-xs text-muted-foreground">{t('admin.totalMinutes', '总冥想分钟')}</Text>
            </CardContent>
          </Card>

          <Card className="bg-card border-0">
            <CardContent className="p-4 text-center">
              <TrendingUp size={24} color="#f472b6" />
              <Text className="block text-2xl font-bold text-destructive mt-2">{stats.activeUsersToday}</Text>
              <Text className="block text-xs text-muted-foreground">{t('admin.activeToday', '今日活跃')}</Text>
            </CardContent>
          </Card>
        </View>

        {/* 管理功能 */}
        <Text className="block text-base font-semibold text-foreground mb-3">
          {t('admin.quickActions', '管理功能')}
        </Text>
        <View className="flex flex-col gap-3 pb-8">
          {menuItems.map((item, index) => (
            <Card
              key={index}
              className="bg-card border-0"
              onClick={() => {
                if (item.action) {
                  item.action()
                } else if (item.url) {
                  Taro.navigateTo({ url: item.url })
                }
              }}
            >
              <CardContent className="p-4">
                <View className="flex items-center gap-4">
                  <View
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: item.iconColor + '20' }}
                  >
                    <item.icon size={24} color={item.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text className="block text-foreground font-medium">{item.title}</Text>
                    <Text className="block text-sm text-muted-foreground">{item.subtitle}</Text>
                  </View>
                  <Text className="block text-muted-foreground">›</Text>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}