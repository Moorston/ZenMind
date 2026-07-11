import { View, Animated, StyleSheet, type ViewStyle } from 'react-native'
import { useEffect, useRef } from 'react'

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: ViewStyle
}

/**
 * 骨架屏组件（带闪烁动画）
 */
export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as number | string,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  )
}

/**
 * 帖子卡片骨架屏
 */
export function PostCardSkeleton() {
  return (
    <View style={styles.card}>
      {/* Author row */}
      <View style={styles.authorRow}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="30%" height={10} style={{ marginTop: 6 }} />
        </View>
        <Skeleton width={50} height={22} borderRadius={12} />
      </View>
      {/* Content */}
      <Skeleton width="100%" height={14} style={{ marginBottom: 6 }} />
      <Skeleton width="80%" height={14} style={{ marginBottom: 6 }} />
      <Skeleton width="50%" height={14} style={{ marginBottom: 12 }} />
      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 20 }}>
        <Skeleton width={50} height={16} borderRadius={8} />
        <Skeleton width={50} height={16} borderRadius={8} />
      </View>
    </View>
  )
}

/**
 * 用户资料卡片骨架屏
 */
export function ProfileCardSkeleton() {
  return (
    <View style={styles.profileCard}>
      <Skeleton width={64} height={64} borderRadius={32} />
      <Skeleton width="40%" height={18} style={{ marginTop: 12 }} />
      <View style={{ flexDirection: 'row', gap: 24, marginTop: 12 }}>
        <Skeleton width={40} height={14} />
        <Skeleton width={40} height={14} />
        <Skeleton width={40} height={14} />
      </View>
      <Skeleton width="50%" height={36} borderRadius={18} style={{ marginTop: 16 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#2a2a4a',
  },
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
  profileCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
})
