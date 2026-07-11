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
import { ChevronLeft, ChevronRight, Shield, User } from 'lucide-react-taro'

interface UserItem {
  id: string
  email: string
  nickname: string
  role: string
  createdAt: string
}

const ROLE_OPTIONS = [
  { value: 'user', label: '普通用户', color: '#9090a0' },
  { value: 'editor', label: '编辑', color: '#2dd4bf' },
  { value: 'admin', label: '管理员', color: '#7c6aef' },
]

export default function AdminUsers() {
  const { t } = useTranslation()
  const { isLoggedIn, user } = useAuthStore()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 20

  useEffect(() => {
    if (!isLoggedIn || !['admin', 'editor'].includes(user?.role || '')) {
      Taro.navigateBack()
      return
    }
    fetchUsers()
  }, [isLoggedIn, user, page])

  // 下拉刷新
  usePullDownRefresh(() => {
    fetchUsers().finally(() => Taro.stopPullDownRefresh())
  })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await Network.request<{ status: string; data: UserItem[]; meta?: { total: number } }>({
        url: `/api/admin/users?page=${page}&pageSize=${pageSize}`,
        method: 'GET',
      })
      if (res.data?.status === 'success') {
        setUsers(res.data.data)
        setTotal(res.data.meta?.total || 0)
      }
    } catch (err) {
      console.error('[AdminUsers] fetchUsers failed:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await Network.request<{ status: string }>({
        url: `/api/admin/users/${userId}/role`,
        method: 'PUT',
        data: { role: newRole },
      })
      if (res.data?.status === 'success') {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
        Taro.showToast({ title: '角色已更新', icon: 'success' })
      }
    } catch (err) {
      console.error('[AdminUsers] updateRole failed:', err)
      Taro.showToast({ title: '更新失败', icon: 'none' })
    }
  }

  const showRolePicker = (userId: string, currentRole: string) => {
    const names = ROLE_OPTIONS.map(r => r.label)
    Taro.showActionSheet({
      itemList: names,
      success: (res) => {
        const selected = ROLE_OPTIONS[res.tapIndex]
        if (selected.value !== currentRole) {
          handleRoleChange(userId, selected.value)
        }
      },
    })
  }

  const getRoleBadge = (role: string) => {
    const opt = ROLE_OPTIONS.find(r => r.value === role) || ROLE_OPTIONS[0]
    return (
      <Badge style={{ backgroundColor: opt.color + '20', color: opt.color }}>
        {opt.label}
      </Badge>
    )
  }

  const totalPages = Math.ceil(total / pageSize)

  if (loading) return <Skeleton className="h-screen w-full" />

  return (
    <View className="flex flex-col h-screen bg-background overflow-hidden">
      <View className="flex items-center justify-between px-4 pt-4 pb-2">
        <Text className="block text-xl font-bold text-foreground">{t('admin.users.title', '用户管理')}</Text>
        <Badge className="bg-primary text-white">{t('admin.users.total', { total })}共 {total} 人</Badge>
      </View>

      <ScrollView scrollY className="flex-1 px-4 pb-8">
        <View className="flex flex-col gap-3 mb-6">
          {users.map(u => (
            <Card key={u.id} className="bg-card border-0">
              <CardContent className="p-4">
                <View className="flex items-center justify-between">
                  <View className="flex items-center gap-3 flex-1">
                    <View className="w-10 h-10 rounded-full bg-primary-20 flex items-center justify-center">
                      <User size={20} color="#7c6aef" />
                    </View>
                    <View className="flex-1">
                      <Text className="block text-foreground font-medium">{u.nickname || u.email}</Text>
                      <Text className="block text-xs text-muted-foreground">{u.email}</Text>
                    </View>
                  </View>
                  <View
                    className="flex items-center gap-2"
                    onClick={() => showRolePicker(u.id, u.role)}
                  >
                    {getRoleBadge(u.role)}
                    <Text className="block text-xs text-muted-foreground">▼</Text>
                  </View>
                </View>
                <View className="flex items-center justify-between mt-2">
                  <Text className="block text-xs text-muted-foreground">
                    注册: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                  </Text>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>

        {totalPages > 1 && (
          <View className="flex items-center justify-center gap-4 pb-4">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </Button>
            <Text className="block text-foreground">
              {page} / {totalPages}
            </Text>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
