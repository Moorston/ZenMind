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
import { UserPlus, UserCheck, Users, Heart } from 'lucide-react-taro'

interface UserProfile {
  id: string
  nickname: string
  avatarUrl?: string
  postsCount: number
  followersCount: number
  followingCount: number
  isFollowing: boolean
}

interface UserProfilePost {
  id: string
  content: string
  type: string
  likesCount: number
  commentsCount: number
  createdAt: string
}

export default function UserProfile() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuthStore()
  const params = Taro.getCurrentInstance()?.router?.params || {}
  const userId = params.userId as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<UserProfilePost[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { Taro.navigateBack(); return }
    fetchProfile()
    fetchPosts()
  }, [userId])

  const fetchProfile = async () => {
    try {
      const qs = currentUser?.id ? `?viewerId=${currentUser.id}` : ''
      const res = await Network.request<{ status: string; data: UserProfile }>({
        url: `/api/community/users/${userId}${qs}`, method: 'GET',
      })
      if (res.data?.status === 'success') {
        setProfile(res.data.data)
        setIsFollowing(res.data.data.isFollowing || false)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const fetchPosts = async () => {
    try {
      const res = await Network.request<{ status: string; data: UserProfilePost[] }>({
        url: `/api/community/users/${userId}/posts`, method: 'GET',
      })
      if (res.data?.status === 'success') setPosts(res.data.data || [])
    } catch (err) { console.error(err) }
  }

  const handleFollow = async () => {
    if (!currentUser) { Taro.navigateTo({ url: '/pages/auth/index' }); return }
    try {
      await Network.request({
        url: `/api/community/users/${userId}/follow`,
        method: 'POST',
        data: { followerId: currentUser.id },
      })
      setIsFollowing(true)
      if (profile) setProfile({ ...profile, followersCount: profile.followersCount + 1 })
    } catch (err) { console.error(err) }
  }

  const handleUnfollow = async () => {
    try {
      await Network.request({
        url: `/api/community/users/${userId}/follow?followerId=${currentUser?.id}`,
        method: 'DELETE',
      })
      setIsFollowing(false)
      if (profile) setProfile({ ...profile, followersCount: profile.followersCount - 1 })
    } catch (err) { console.error(err) }
  }

  if (loading) return <Skeleton className="h-screen w-full" />
  if (!profile) return null

  return (
    <View className="flex flex-col h-screen bg-background">
      <ScrollView scrollY className="flex-1 px-4 pt-4">
        {/* 用户信息 */}
        <Card className="bg-card border-0 mb-4">
          <CardContent className="p-4">
            <View className="flex items-center gap-4 mb-4">
              <View className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <Text className="block text-2xl">{profile.avatarUrl || '🧘'}</Text>
              </View>
              <View className="flex-1">
                <Text className="block text-xl font-semibold text-foreground">{profile.nickname}</Text>
                <View className="flex items-center gap-4 mt-1">
                  <Text className="block text-xs text-muted-foreground">
                    {profile.postsCount} {t('community.posts', '帖子')}
                  </Text>
                  <Text className="block text-xs text-muted-foreground">
                    {profile.followersCount} {t('community.followers', '粉丝')}
                  </Text>
                  <Text className="block text-xs text-muted-foreground">
                    {profile.followingCount} {t('community.following', '关注')}
                  </Text>
                </View>
              </View>
            </View>

            {currentUser?.id !== userId && (
              <Button
                className={isFollowing ? 'bg-muted text-foreground' : 'bg-primary text-white'}
                onClick={isFollowing ? handleUnfollow : handleFollow}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={16} color="#7c6aef" className="mr-1" />
                    <Text className="block">{t('community.following', '已关注')}</Text>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} color="#fff" className="mr-1" />
                    <Text className="block">{t('community.follow', '关注')}</Text>
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 帖子列表 */}
        <Text className="block text-base font-semibold text-foreground mb-3">
          {t('community.userPosts', 'TA 的帖子')}
        </Text>

        {posts.length === 0 ? (
          <View className="py-8 flex flex-col items-center">
            <Text className="block text-muted-foreground">{t('community.noPosts', '暂无帖子')}</Text>
          </View>
        ) : (
          <View className="space-y-3 pb-8">
            {posts.map(post => (
              <Card
                key={post.id}
                className="bg-card border-0"
                onClick={() => Taro.navigateTo({ url: `/pages/community/post-detail/index?id=${post.id}` })}
              >
                <CardContent className="p-4">
                  <Text className="block text-sm text-foreground mb-2">{post.content}</Text>
                  <View className="flex items-center gap-4">
                    <View className="flex items-center gap-1">
                      <Heart size={14} color="#9090a0" />
                      <Text className="block text-xs text-muted-foreground">{post.likesCount}</Text>
                    </View>
                    <View className="flex items-center gap-1">
                      <Users size={14} color="#9090a0" />
                      <Text className="block text-xs text-muted-foreground">{post.commentsCount}</Text>
                    </View>
                    <Text className="block text-xs text-muted-foreground ml-auto">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Text>
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