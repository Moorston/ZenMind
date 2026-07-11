import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Network } from '@/network'
import { useAuthStore } from '@/store/auth'
import { Save, ArrowLeft } from 'lucide-react-taro'

interface CourseForm {
  title: string
  description: string
  category: string
  level: string
  duration: string
  coverUrl: string
  audioUrl: string
  instructorId: string
}

const CATEGORIES = [
  { value: 'breathing', label: '呼吸' },
  { value: 'body-scan', label: '身体扫描' },
  { value: 'visualization', label: '引导想象' },
  { value: 'loving-kindness', label: '慈心' },
  { value: 'mindfulness', label: '正念' },
]

const LEVELS = [
  { value: 'beginner', label: '入门' },
  { value: 'intermediate', label: '进阶' },
  { value: 'advanced', label: '高级' },
]

const INITIAL_FORM: CourseForm = {
  title: '',
  description: '',
  category: 'mindfulness',
  level: 'beginner',
  duration: '10',
  coverUrl: '',
  audioUrl: '',
  instructorId: '',
}

export default function AdminCourseEdit() {
  const { t } = useTranslation()
  const router = useRouter()
  const { isLoggedIn, user } = useAuthStore()
  const [form, setForm] = useState<CourseForm>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [instructors, setInstructors] = useState<Array<{ id: string; name: string }>>([])

  const courseId = router.params.id
  const isEdit = !!courseId

  useEffect(() => {
    if (!isLoggedIn || !['admin', 'editor'].includes(user?.role || '')) {
      Taro.navigateBack()
      return
    }
    loadInstructors()
    if (isEdit) loadCourse()
  }, [isLoggedIn, user])

  const loadInstructors = async () => {
    try {
      const res = await Network.request<{ status: string; data: Array<{ id: string; name: string }> }>({
        url: '/api/instructors',
        method: 'GET',
      })
      if (res.data?.status === 'success') {
        setInstructors(res.data.data)
      }
    } catch {}
  }

  const loadCourse = async () => {
    setLoading(true)
    try {
      const res = await Network.request<{ status: string; data: any }>({
        url: `/api/courses/${courseId}`,
        method: 'GET',
      })
      if (res.data?.status === 'success' && res.data.data) {
        const c = res.data.data
        setForm({
          title: c.title || '',
          description: c.description || '',
          category: c.category || 'mindfulness',
          level: c.level || 'beginner',
          duration: String(c.duration || 10),
          coverUrl: c.coverUrl || '',
          audioUrl: c.audioUrl || '',
          instructorId: c.instructorId || '',
        })
      }
    } catch (err) {
      console.error('[CourseEdit] load failed:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const updateField = (key: keyof CourseForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleCategoryPicker = () => {
    const names = CATEGORIES.map(c => c.label)
    Taro.showActionSheet({
      itemList: names,
      success: (res) => {
        updateField('category', CATEGORIES[res.tapIndex].value)
      },
    })
  }

  const handleLevelPicker = () => {
    const names = LEVELS.map(l => l.label)
    Taro.showActionSheet({
      itemList: names,
      success: (res) => {
        updateField('level', LEVELS[res.tapIndex].value)
      },
    })
  }

  const handleInstructorPicker = () => {
    if (instructors.length === 0) return
    const names = ['无', ...instructors.map(i => i.name)]
    Taro.showActionSheet({
      itemList: names,
      success: (res) => {
        updateField('instructorId', res.tapIndex === 0 ? '' : instructors[res.tapIndex - 1].id)
      },
    })
  }

  const validate = (): string | null => {
    if (!form.title.trim()) return '请输入课程标题'
    if (!form.description.trim()) return '请输入课程描述'
    const dur = parseInt(form.duration)
    if (isNaN(dur) || dur <= 0) return '请输入有效的时长'
    return null
  }

  const handleSave = async () => {
    const err = validate()
    if (err) {
      Taro.showToast({ title: err, icon: 'none' })
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        level: form.level,
        duration: parseInt(form.duration),
        coverUrl: form.coverUrl.trim() || undefined,
        audioUrl: form.audioUrl.trim() || undefined,
        instructorId: form.instructorId || null,
      }

      const url = isEdit ? `/api/admin/courses/${courseId}` : '/api/admin/courses'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await Network.request<{ status: string }>({
        url,
        method,
        data: payload,
      })

      if (res.data?.status === 'success') {
        Taro.showToast({ title: isEdit ? '已更新' : '已创建', icon: 'success' })
        setTimeout(() => Taro.navigateBack(), 1500)
      }
    } catch (error) {
      console.error('[CourseEdit] save failed:', error)
      Taro.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Skeleton className="h-screen w-full" />

  const getCategoryLabel = () => CATEGORIES.find(c => c.value === form.category)?.label || form.category
  const getLevelLabel = () => LEVELS.find(l => l.value === form.level)?.label || form.level
  const getInstructorLabel = () => {
    if (!form.instructorId) return '无'
    return instructors.find(i => i.id === form.instructorId)?.name || '未知'
  }

  return (
    <View className="flex flex-col h-screen bg-background overflow-hidden">
      <View className="flex items-center justify-between px-4 pt-4 pb-2">
        <View className="flex items-center gap-2" onClick={() => Taro.navigateBack()}>
          <ArrowLeft size={20} color="#9090a0" />
          <Text className="block text-xl font-bold text-foreground">
            {isEdit ? '编辑课程' : '新增课程'}
          </Text>
        </View>
        <Button
          className="bg-primary text-white px-4 py-1"
          disabled={saving}
          onClick={handleSave}
        >
          <Save size={16} color="#fff" className="mr-1" />
          <Text className="block text-white text-sm">{saving ? '保存中...' : '保存'}</Text>
        </Button>
      </View>

      <ScrollView scrollY className="flex-1 px-4 pb-8">
        <Card className="bg-card border-0 mb-4">
          <CardContent className="p-4">
            <Text className="block text-sm font-medium text-foreground mb-2">课程标题 *</Text>
            <Input
              className="bg-background rounded-xl px-4 py-3 text-foreground"
              placeholder="输入课程标题"
              value={form.title}
              onInput={(e) => updateField('title', e.detail.value)}
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-0 mb-4">
          <CardContent className="p-4">
            <Text className="block text-sm font-medium text-foreground mb-2">课程描述 *</Text>
            <Input
              className="bg-background rounded-xl px-4 py-3 text-foreground"
              placeholder="输入课程描述"
              value={form.description}
              onInput={(e) => updateField('description', e.detail.value)}
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-0 mb-4">
          <CardContent className="p-4">
            <Text className="block text-sm font-medium text-foreground mb-3">分类 & 等级</Text>
            <View className="flex gap-3">
              <View className="flex-1" onClick={handleCategoryPicker}>
                <Text className="block text-xs text-muted-foreground mb-1">分类</Text>
                <View className="bg-background rounded-xl px-4 py-3 flex items-center justify-between">
                  <Text className="block text-foreground">{getCategoryLabel()}</Text>
                  <Text className="block text-muted-foreground">▼</Text>
                </View>
              </View>
              <View className="flex-1" onClick={handleLevelPicker}>
                <Text className="block text-xs text-muted-foreground mb-1">等级</Text>
                <View className="bg-background rounded-xl px-4 py-3 flex items-center justify-between">
                  <Text className="block text-foreground">{getLevelLabel()}</Text>
                  <Text className="block text-muted-foreground">▼</Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 mb-4">
          <CardContent className="p-4">
            <Text className="block text-sm font-medium text-foreground mb-2">时长 (分钟) *</Text>
            <Input
              className="bg-background rounded-xl px-4 py-3 text-foreground"
              placeholder="输入时长，单位分钟"
              type="number"
              value={form.duration}
              onInput={(e) => updateField('duration', e.detail.value)}
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-0 mb-4">
          <CardContent className="p-4">
            <Text className="block text-sm font-medium text-foreground mb-2">讲师</Text>
            <View onClick={handleInstructorPicker}>
              <View className="bg-background rounded-xl px-4 py-3 flex items-center justify-between">
                <Text className="block text-foreground">{getInstructorLabel()}</Text>
                <Text className="block text-muted-foreground">▼</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 mb-4">
          <CardContent className="p-4">
            <Text className="block text-sm font-medium text-foreground mb-2">封面图 URL</Text>
            <Input
              className="bg-background rounded-xl px-4 py-3 text-foreground"
              placeholder="https://..."
              value={form.coverUrl}
              onInput={(e) => updateField('coverUrl', e.detail.value)}
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-0 mb-4">
          <CardContent className="p-4">
            <Text className="block text-sm font-medium text-foreground mb-2">音频 URL</Text>
            <Input
              className="bg-background rounded-xl px-4 py-3 text-foreground"
              placeholder="https://..."
              value={form.audioUrl}
              onInput={(e) => updateField('audioUrl', e.detail.value)}
            />
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  )
}
