import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle } from 'lucide-react-taro'
import { TYPE_LABELS, formatRelativeTime } from '../../../shared/post-card-logic'

interface PostCardProps {
  id: string
  userId?: string
  content: string
  type: 'reflection' | 'checkin' | 'share'
  likesCount: number
  commentsCount: number
  createdAt: string
  authorNickname?: string
  authorAvatar?: string
  onLike?: (id: string) => void
}

export function PostCard({
  id, userId, content, type, likesCount, commentsCount, createdAt,
  authorNickname, authorAvatar, onLike,
}: PostCardProps) {
  const handleClick = () => {
    Taro.navigateTo({ url: `/pages/community/post-detail?id=${id}` })
  }

  const handleUserClick = (e: any) => {
    e.stopPropagation()
    if (userId) {
      Taro.navigateTo({ url: `/pages/community/user-profile?userId=${userId}` })
    }
  }

  return (
    <Card className="bg-card border-0" hoverClass="opacity-80" onClick={handleClick}>
      <CardContent className="p-4">
        {/* 作者信息 */}
        {authorNickname && (
          <View className="flex items-center gap-2 mb-3" onClick={handleUserClick}>
            <View className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Text className="block text-sm">{authorAvatar || '🧘'}</Text>
            </View>
            <Text className="block text-sm font-medium text-foreground">{authorNickname}</Text>
          </View>
        )}

        {/* 帖子内容 */}
        <View className="flex items-center justify-between mb-2">
          <Badge className="bg-primary-20 text-primary text-xs">
            {TYPE_LABELS[type] || '帖子'}
          </Badge>
          <Text className="block text-xs text-muted-foreground">
            {formatRelativeTime(createdAt)}
          </Text>
        </View>
        <Text className="block text-sm text-foreground mb-3 line-clamp-3">
          {content}
        </Text>

        {/* 操作栏 */}
        <View className="flex items-center gap-4">
          <View className="flex items-center gap-1" onClick={(e) => { e.stopPropagation(); onLike?.(id) }}>
            <Heart size={14} color="#9090a0" />
            <Text className="block text-xs text-muted-foreground">{likesCount}</Text>
          </View>
          <View className="flex items-center gap-1">
            <MessageCircle size={14} color="#9090a0" />
            <Text className="block text-xs text-muted-foreground">{commentsCount}</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  )
}