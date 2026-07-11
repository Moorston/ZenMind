import { View, Text, ScrollView, Textarea, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Network } from '@/network'
import { useAuthStore } from '@/store/auth'

const POST_TYPES = ['reflection', 'checkin', 'share']
const POST_TYPE_LABELS: Record<string, string> = { reflection: '冥想心得', checkin: '打卡记录', share: '分享' }

export default function CreatePost() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [content, setContent] = useState('')
  const [type, setType] = useState('reflection')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await Network.request({
        url: '/api/community/posts', method: 'POST',
        data: { userId: user?.id, content: content.trim(), type },
      })
      if (res.data?.status === 'success') {
        Taro.showToast({ title: '发布成功', icon: 'success' })
        setTimeout(() => Taro.navigateBack(), 1000)
      }
    } catch (err) {
      Taro.showToast({ title: '发布失败', icon: 'none' })
    } finally { setSubmitting(false) }
  }

  return (
    <View className="min-h-screen bg-background px-4 pt-4">
      <Text className="block text-xl font-bold text-foreground mb-4">{t('community.create', '发布帖子')}</Text>

      <Card className="bg-card border-0 mb-4">
        <CardContent className="p-4">
          <View className="bg-muted rounded-2xl p-4 mb-4">
            <Textarea
              style={{ width: '100%', minHeight: '120px', color: '#fff', fontSize: '15px', backgroundColor: 'transparent' }}
              placeholder={t('community.contentPlaceholder', '分享你的冥想心得...')}
              value={content}
              onInput={(e) => setContent(e.detail.value)}
              maxlength={500}
            />
          </View>

          <Text className="block text-sm text-muted-foreground mb-2">{t('community.postType', '帖子类型')}</Text>
          <View className="flex flex-wrap gap-2 mb-4">
            {POST_TYPES.map(pt => (
              <View
                key={pt}
                onClick={() => setType(pt)}
                className={`px-4 py-2 rounded-full text-sm ${type === pt ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
              >
                <Text className="block">{POST_TYPE_LABELS[pt]}</Text>
              </View>
            ))}
          </View>

          <Button
            className="w-full bg-primary text-white"
            disabled={!content.trim() || submitting}
            onClick={handleSubmit}
          >
            {submitting ? t('common.submitting', '提交中...') : t('community.submit', '发布')}
          </Button>
        </CardContent>
      </Card>
    </View>
  )
}