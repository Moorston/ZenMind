import { View, Text, ScrollView } from '@tarojs/components'
import { SafeImage } from '@/components/ui/safe-image'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePullDownRefresh } from '@tarojs/taro'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Network } from '@/network'
import { useAuthStore } from '@/store/auth'
import {
  Plus, Search, Edit2, Trash2,
  ChevronLeft, ChevronRight, Clock, Archive, RotateCcw
} from 'lucide-react-taro'

interface CourseItem {
  id: string
  title: string
  description: string
  category: string
  level: string
  duration: number
  coverUrl: string
  audioUrl: string
  instructorId: string | null
  isDeleted?: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  breathing: '呼吸',
  'body-scan': '身体扫描',
  visualization: '引导想象',
  'loving-kindness': '慈心',
  mindfulness: '正念',
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
}

export default function AdminCourses() {
  const { t } = useTranslation()
  const { isLoggedIn, user } = useAuthStore()
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [showArchived, setShowArchived] = useState(false)
  const pageSize = 20

  useEffect(() => {
    if (!isLoggedIn || !['admin', 'editor'].includes(user?.role || '')) {
      Taro.navigateBack()
      return
    }
    fetchCourses()
  }, [isLoggedIn, user, page, showArchived])

  // 下拉刷新
  usePullDownRefresh(() => {
    fetchCourses().finally(() => Taro.stopPullDownRefresh())
  })

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (searchQuery) params.set('search', searchQuery)
      if (showArchived) params.set('includeDeleted', 'true')
      const res = await Network.request<{ status: string; data: CourseItem[]; meta?: { total: number } }>({
        url: `/api/courses?${params.toString()}`,
        method: 'GET',
      })
      if (res.data?.status === 'success') {
        setCourses(res.data.data)
        setTotal(res.data.meta?.total || res.data.data.length)
      }
    } catch (err) {
      console.error('[AdminCourses] fetchCourses failed:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchCourses()
  }

  const handleCreate = () => {
    Taro.navigateTo({ url: '/pages/admin/courses/edit' })
  }

  const handleEdit = (courseId: string) => {
    Taro.navigateTo({ url: `/pages/admin/courses/edit?id=${courseId}` })
  }

  const handleDelete = (courseId: string, title: string) => {
    Taro.showModal({
      title: '归档课程',
      content: `确定要归档课程"${title}"吗？归档后用户将无法看到此课程。`,
      confirmColor: '#f59e0b',
      success: async (res) => {
        if (res.confirm) {
          try {
            const response = await Network.request<{ status: string; data?: { message?: string } }>({
              url: `/api/admin/courses/${courseId}`,
              method: 'DELETE',
            })
            if (response.data?.status === 'success') {
              setCourses(prev => prev.filter(c => c.id !== courseId))
              const msg = response.data.data?.message || '已归档'
              Taro.showToast({ title: msg, icon: 'success', duration: 2000 })
            }
          } catch (err) {
            console.error('[AdminCourses] delete failed:', err)
            Taro.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      },
    })
  }

  const handleRestore = async (courseId: string, title: string) => {
    try {
      const res = await Network.request<{ status: string }>({
        url: `/api/courses/${courseId}/restore`,
        method: 'POST',
      })
      if (res.data?.status === 'success') {
        // 刷新列表
        fetchCourses()
        Taro.showToast({ title: `"${title}"已恢复`, icon: 'success' })
      }
    } catch (err) {
      console.error('[AdminCourses] restore failed:', err)
      Taro.showToast({ title: '恢复失败', icon: 'none' })
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  if (loading) return <Skeleton className="h-screen w-full" />

  return (
    <View className="flex flex-col h-screen bg-background overflow-hidden">
      <View className="flex items-center justify-between px-4 pt-4 pb-2">
        <Text className="block text-xl font-bold text-foreground">{t('admin.courses.title', '课程管理')}</Text>
        <Button className="bg-primary text-white px-3 py-1" onClick={handleCreate}>
          <Plus size={16} color="#fff" className="mr-1" />
          <Text className="block text-white text-sm">新增</Text>
        </Button>
      </View>

      <View className="px-4 py-2">
        <View className="bg-card rounded-2xl px-4 py-2 flex items-center gap-3">
          <Search size={20} color="#9090a0" />
          <Input
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground"
            placeholder="搜索课程..."
            value={searchQuery}
            onInput={(e) => setSearchQuery(e.detail.value)}
            onConfirm={handleSearch}
          />
        </View>
        <View
          className="flex items-center gap-2 mt-2 px-1"
          onClick={() => setShowArchived(!showArchived)}
        >
          <View className={`w-5 h-5 rounded border flex items-center justify-center ${
            showArchived ? 'bg-primary border-primary' : 'border-muted-foreground'
          }`}>
            {showArchived && <Text className="block text-white text-xs">✓</Text>}
          </View>
          <Text className="block text-sm text-muted-foreground">
            {t('admin.courses.showArchived', '显示已归档课程')}
          </Text>
        </View>
      </View>

      <ScrollView scrollY className="flex-1 px-4 pb-8">
        <View className="flex flex-col gap-3 mb-6">
          {courses.map(course => (
            <Card key={course.id} className="bg-card border-0 overflow-hidden">
              <View className="flex">
                <SafeImage
                  src={course.coverUrl}
                  className="w-24 h-24"
                  mode="aspectFill"
                />
                <CardContent className="flex-1 p-3 flex flex-col justify-between">
                  <View>
                    <View className="flex items-center gap-2 mb-1">
                      <Text className={`block text-base font-medium ${course.isDeleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {course.title}
                      </Text>
                      {course.isDeleted && (
                        <Badge className="bg-warning-20 text-warning text-xs">已归档</Badge>
                      )}
                    </View>
                    <Text className="block text-xs text-muted-foreground line-clamp-1">
                      {course.description}
                    </Text>
                  </View>
                  <View className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className="bg-primary-20 text-primary text-xs">
                      {CATEGORY_LABELS[course.category] || course.category}
                    </Badge>
                    <Badge className="bg-secondary-20 text-secondary text-xs">
                      {LEVEL_LABELS[course.level] || course.level}
                    </Badge>
                    <Text className="block text-xs text-muted-foreground">
                      <Clock size={10} /> {course.duration}分钟
                    </Text>
                  </View>
                </CardContent>
              </View>
              <View className="flex border-t border-border">
                <View
                  className="flex-1 flex items-center justify-center py-2 border-r border-border"
                  onClick={() => handleEdit(course.id)}
                >
                  <Edit2 size={14} color="#7c6aef" className="mr-1" />
                  <Text className="block text-sm text-primary">编辑</Text>
                </View>
                {course.isDeleted ? (
                  <View
                    className="flex-1 flex items-center justify-center py-2"
                    onClick={() => handleRestore(course.id, course.title)}
                  >
                    <RotateCcw size={14} color="#2dd4bf" className="mr-1" />
                    <Text className="block text-sm text-secondary">恢复</Text>
                  </View>
                ) : (
                  <View
                    className="flex-1 flex items-center justify-center py-2"
                    onClick={() => handleDelete(course.id, course.title)}
                  >
                    <Trash2 size={14} color="#ef4444" className="mr-1" />
                    <Text className="block text-sm text-destructive">归档</Text>
                  </View>
                )}
              </View>
            </Card>
          ))}
        </View>

        {courses.length === 0 && (
          <View className="py-12 flex flex-col items-center">
            <Text className="block text-4xl mb-4">📚</Text>
            <Text className="block text-muted-foreground">暂无课程</Text>
          </View>
        )}

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
