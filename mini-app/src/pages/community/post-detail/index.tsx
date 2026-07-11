import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Network } from '@/network'
import { useAuthStore } from '@/store/auth'
import { Heart, MessageCircle, Send } from 'lucide-react-taro'

interface PostDetail {
  id: string
  userId: string
  content: string
  type: string
  likesCount: number
  commentsCount: number
  createdAt: string
  authorNickname?: string
  authorAvatar?: string
}

interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  createdAt: string
  authorNickname?: string
  authorAvatar?: string
}

export default function PostDetail() {
  const { t } = useTranslation()
  const { isLoggedIn, user } = useAuthStore()
  const params = Taro.getCurrentInstance()?.router?.params || {}
  const postId = params.id as string

  const [post, setPost] = useState<PostDetail | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!postId) { Taro.navigateBack(); return }
    fetchPost()
    fetchComments()
  }, [postId])

  const fetchPost = async () => {
    try {
      const res = await Network.request<{ status: string; data: PostDetail }>({
        url: `/api/community/posts/${postId}`, method: 'GET',
      })
      if (res.data?.status === 'success') setPost(res.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const fetchComments = async () => {
    try {
      const res = await Network.request<{ status: string; data: Comment[] }>({
        url: `/api/community/posts/${postId}/comments`, method: 'GET',
      })
      if (res.data?.status === 'success') setComments(res.data.data || [])
    } catch (err) { console.error(err) }
  }

  const handleSubmitComment = async () => {
    if (!isLoggedIn || !commentText.trim() || submitting) return
    setSubmitting(true)
    try {
      await Network.request({
        url: `/api/community/posts/${postId}/comments`,
        method: 'POST',
        data: { userId: user?.id, content: commentText.trim() },
      })
      setCommentText('')
      fetchComments()
      fetchPost()
    } catch (err) { console.error(err) }
    finally { setSubmitting(false) }
  }

  const handleLike = async () => {
    if (!isLoggedIn || !user) { Taro.navigateTo({ url: '/pages/auth/index' }); return }
    try {
      await Network.request({
        url: `/api/community/posts/${postId}/like`,
        method: 'POST',
        data: { userId: user.id },
      })
      fetchPost()
    } catch (err) { console.error(err) }
  }

  const typeLabels: Record<string, string> = { reflection: '心得', checkin: '打卡', share: '分享' }

  return (
    <View className="flex flex-col h-screen bg-background">
      <ScrollView scrollY className="flex-1 px-4 pt-4">
        {loading ? (
          <Skeleton className="h-40 w-full rounded-2xl mb-4" />
        ) : post ? (
          <Card className="bg-card border-0 mb-4">
            <CardContent className="p-4">
              <View className="flex items-center justify-between mb-3">
                <Badge className="bg-primary-20 text-primary">{typeLabels[post.type] || '帖子'}</Badge>
                <Text className="block text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text className="block text-base text-foreground mb-4">{post.content}</Text>
              <View className="flex items-center gap-4">
                <View className="flex items-center gap-1" onClick={handleLike}>
                  <Heart size={18} color="#7c6aef" />
                  <Text className="block text-sm text-muted-foreground">{post.likesCount}</Text>
                </View>
                <View className="flex items-center gap-1">
                  <MessageCircle size={18} color="#9090a0" />
                  <Text className="block text-sm text-muted-foreground">{post.commentsCount}</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        ) : null}

        <Text className="block text-base font-semibold text-foreground mb-3">
          {t('community.comments', '评论')} ({comments.length})
        </Text>

        {comments.length === 0 ? (
          <Text className="block text-sm text-muted-foreground text-center py-8">
            {t('community.noComments', '暂无评论')}
          </Text>
        ) : (
          comments.map(comment => (
            <Card key={comment.id} className="bg-card border-0 mb-2">
              <CardContent className="p-3">
                <View className="flex items-center gap-2 mb-1">
                  <View className="w-6 h-6 rounded-full bg-primary-20 flex items-center justify-center">
                    <Text className="block text-xs">{comment.authorAvatar || '🧘'}</Text>
                  </View>
                  <Text className="block text-xs font-medium text-primary">
                    {comment.authorNickname || t('community.anonymous', '匿名用户')}
                  </Text>
                </View>
                <Text className="block text-sm text-foreground">{comment.content}</Text>
                <Text className="block text-xs text-muted-foreground mt-1">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </Text>
              </CardContent>
            </Card>
          ))
        )}
        <View className="h-20" />
      </ScrollView>

      <View style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#1a1a3e', padding: '12px', zIndex: 100 }}>
        <View style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
          <View style={{ flex: 1, backgroundColor: '#0a0a1a', borderRadius: '20px', padding: '8px 12px' }}>
            <Input
              style={{ width: '100%', fontSize: '14px', color: '#fff' }}
              placeholder={t('community.commentPlaceholder', '输入评论...')}
              value={commentText}
              onInput={(e) => setCommentText(e.detail.value)}
            />
          </View>
          <Button
            size="sm"
            className="bg-primary text-white"
            disabled={!commentText.trim() || submitting}
            onClick={handleSubmitComment}
          >
            <Send size={16} color="#fff" />
          </Button>
        </View>
      </View>
    </View>
  )
}