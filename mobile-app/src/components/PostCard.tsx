import { useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import {
  type PostType, TYPE_LABELS, TYPE_COLORS,
  formatRelativeTime, canLike,
} from '../../../shared/post-card-logic'

export type { PostType }

export interface PostCardProps {
  id: string
  userId?: string
  content: string
  type: PostType
  likesCount: number
  commentsCount: number
  createdAt: string
  authorNickname?: string
  authorAvatar?: string
  onLike?: () => void
  onPress?: () => void
  onAuthorPress?: () => void
}

export function PostCard({
  content,
  type,
  likesCount,
  commentsCount,
  createdAt,
  authorNickname,
  authorAvatar,
  onLike,
  onPress,
  onAuthorPress,
}: PostCardProps) {
  const badgeColor = TYPE_COLORS[type]
  const badgeLabel = TYPE_LABELS[type]
  const lastLikeTimeRef = useRef(0)

  const handleLike = () => {
    if (!onLike || !canLike(lastLikeTimeRef)) return
    onLike()
  }

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Author row */}
      <View style={styles.authorRow}>
        <TouchableOpacity
          style={styles.avatarCircle}
          activeOpacity={0.7}
          onPress={onAuthorPress}
        >
          <Text style={styles.avatarText}>
            {authorAvatar || '\u{1F9D8}'}
          </Text>
        </TouchableOpacity>

        <View style={styles.authorInfo}>
          <TouchableOpacity activeOpacity={0.7} onPress={onAuthorPress}>
            <Text style={styles.nickname}>
              {authorNickname || '匿名用户'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.date}>{formatRelativeTime(createdAt)}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: badgeColor + '20' }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>
            {badgeLabel}
          </Text>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.content} numberOfLines={3}>
        {content}
      </Text>

      {/* Action row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.6}
          onPress={handleLike}
        >
          <Text style={styles.actionIcon}>{'❤️'}</Text>
          <Text style={styles.actionCount}>{likesCount}</Text>
        </TouchableOpacity>

        <View style={styles.actionBtn}>
          <Text style={styles.actionIcon}>{'💬'}</Text>
          <Text style={styles.actionCount}>{commentsCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  authorInfo: {
    flex: 1,
    marginLeft: 10,
  },
  nickname: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  date: {
    color: '#9090a0',
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionCount: {
    color: '#9090a0',
    fontSize: 13,
  },
})
