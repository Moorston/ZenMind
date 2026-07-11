import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PostCard } from '@/components/post-card'
import { Network } from '@/network'
import { useAuthStore } from '@/store/auth'
import { Plus, Users, Compass } from 'lucide-react-taro'

interface Post {
  id: string
  userId: string
  content: string
  type: 'reflection' | 'checkin' | 'share'
  likesCount: number
  commentsCount: number
  createdAt: string
  authorNickname?: string
  authorAvatar?: string
}

export default function Community() {
  const { t } = useTranslation()
  const { isLoggedIn, user } = useAuthStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'discover' | 'following'>('discover')

  useEffect(() => { fetchPosts() }, [activeTab])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      if (activeTab === 'following' && isLoggedIn && user?.id) {
        const res = await Network.request<{ status: string; data: Post[] }>({
          url: `/api/community/feed/${user.id}`, method: 'GET',
        })
        if (res.data?.status === 'success') setPosts(res.data.data || [])
      } else {
        const res = await Network.request<{ status: string; data: Post[] }>({
          url: '/api/community/posts', method: 'GET',
        })
        if (res.data?.status === 'success') setPosts(res.data.data || [])
      }
    } catch (err) { console.error('[Community] fetchPosts failed:', err) }
    finally { setLoading(false) }
  }

  const handleCreatePost = () => {
    if (!isLoggedIn) { Taro.navigateTo({ url: '/pages/auth/index' }); return }
    Taro.navigateTo({ url: '/pages/community/create-post/index' })
  }

  const handleLike = async (postId: string) => {
    if (!isLoggedIn || !user) { Taro.navigateTo({ url: '/pages/auth/index' }); return }
    try {
      await Network.request({
        url: `/api/community/posts/${postId}/like`,
        method: 'POST',
        data: { userId: user.id },
      })
      fetchPosts()
    } catch (err) { console.error(err) }
  }

  return (
    <View className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <View className="flex items-center justify-between px-4 pt-4 pb-2">
        <Text className="block text-xl font-bold text-foreground">{t('community.title', '社区')}</Text>
        <Button size="sm" className="bg-primary text-white" onClick={handleCreatePost}>
          <Plus size={16} color="#fff" className="mr-1" />
          <Text className="block text-xs">{t('community.create', '发帖')}</Text>
        </Button>
      </View>

      {/* Tab 切换 */}
      <View className="flex items-center gap-4 px-4 py-2 border-b border-border">
        <View
          className={`flex items-center gap-1 pb-2 ${activeTab === 'discover' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          <Compass size={16} color={activeTab === 'discover' ? '#7c6aef' : '#9090a0'} />
          <Text className={`block text-sm ${activeTab === 'discover' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            {t('community.discover', '发现')}
          </Text>
        </View>
        <View
          className={`flex items-center gap-1 pb-2 ${activeTab === 'following' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          <Users size={16} color={activeTab === 'following' ? '#7c6aef' : '#9090a0'} />
          <Text className={`block text-sm ${activeTab === 'following' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            {t('community.following', '关注')}
          </Text>
        </View>
      </View>

      {/* 帖子列表 */}
      <ScrollView scrollY className="flex-1 px-4 pb-8">
        {loading ? (
          <View className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </View>
        ) : posts.length === 0 ? (
          <View className="py-20 flex flex-col items-center">
            <Text className="block text-6xl mb-4">🌱</Text>
            <Text className="block text-muted-foreground text-center mb-4">
              {activeTab === 'following'
                ? t('community.noFollowingPosts', '还没有关注的用户发帖')
                : t('community.empty', '还没有帖子')}
            </Text>
            <Button className="bg-primary text-white" onClick={handleCreatePost}>
              <Plus size={16} color="#fff" className="mr-1" />
              <Text className="block">{t('community.createFirst', '发布第一条帖子')}</Text>
            </Button>
          </View>
        ) : (
          <View className="space-y-4">
            {posts.map(post => (
              <PostCard
                key={post.id}
                id={post.id}
                userId={post.userId}
                content={post.content}
                type={post.type}
                likesCount={post.likesCount}
                commentsCount={post.commentsCount}
                createdAt={post.createdAt}
                authorNickname={post.authorNickname}
                authorAvatar={post.authorAvatar}
                onLike={handleLike}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}