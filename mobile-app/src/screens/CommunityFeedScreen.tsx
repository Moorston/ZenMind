import { useState, useEffect, useCallback, useRef } from 'react'
import {
  View, Text, StyleSheet,
  ActivityIndicator, TouchableOpacity, StatusBar, Alert,
  FlatList,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { CommunityAPI, type Post } from '@/api/community'
import { useAuthStore } from '@/store/useAuthStore'
import PostCard from '@/components/PostCard'

type TabKey = 'discover' | 'following'

export function CommunityFeedScreen() {
  const navigation = useNavigation<any>()
  const { isLoggedIn, user } = useAuthStore()
  const currentUserId = user?.id

  const [activeTab, setActiveTab] = useState<TabKey>('discover')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const pageSize = 20

  const fetchPosts = useCallback(async (tab: TabKey, pageNum: number, append = false) => {
    if (pageNum === 1) {
      setPosts([]) // 清空旧数据，避免 Tab 切换时短暂显示错误内容
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      let res
      if (tab === 'following' && currentUserId) {
        res = await CommunityAPI.getFeed(currentUserId, pageNum, pageSize)
      } else {
        res = await CommunityAPI.getPosts(pageNum, pageSize)
      }
      const newPosts = res.data || []
      setPosts(prev => append ? [...prev, ...newPosts] : newPosts)
      setHasMore(newPosts.length >= pageSize)
      setPage(pageNum)
    } catch (err) {
      console.error('[Community] fetchPosts failed:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setInitialized(true)
    }
  }, [currentUserId])

  useEffect(() => {
    fetchPosts(activeTab, 1)
  }, [activeTab, fetchPosts])

  const handleLoadMore = () => {
    if (!initialized || loadingMore || !hasMore) return
    fetchPosts(activeTab, page + 1, true)
  }

  const handleLike = async (postId: string) => {
    if (!isLoggedIn || !currentUserId) return
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p
    ))
    try {
      await CommunityAPI.likePost(postId, currentUserId)
    } catch (err) {
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, likesCount: Math.max(0, p.likesCount - 1) } : p
      ))
      console.error('[Community] like failed:', err)
    }
  }

  const handleCreatePost = () => {
    if (!isLoggedIn) return
    navigation.navigate('CreatePost')
  }

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      id={item.id}
      userId={item.userId}
      content={item.content}
      type={item.type}
      likesCount={item.likesCount}
      commentsCount={item.commentsCount}
      createdAt={item.createdAt}
      authorNickname={item.authorNickname}
      authorAvatar={item.authorAvatar}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
      onAuthorPress={() => navigation.navigate('UserProfile', { userId: item.userId })}
      onLike={() => handleLike(item.id)}
    />
  )

  const renderFooter = () => {
    if (!loadingMore) return null
    return (
      <View style={{ paddingVertical: 16 }}>
        <ActivityIndicator size="small" color="#7c6aef" />
      </View>
    )
  }

  const renderEmpty = () => {
    if (loading) return null
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>还没有帖子，快来分享你的冥想心得吧</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>社区</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreatePost}>
          <Text style={styles.createButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.tabActive]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>
            发现
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.tabActive]}
          onPress={() => {
            if (!isLoggedIn) {
              Alert.alert('提示', '请先登录后查看关注动态')
              return
            }
            setActiveTab('following')
          }}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>
            关注
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7c6aef" />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.postListContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  createButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7c6aef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 22,
    color: '#ffffff',
    lineHeight: 24,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 8,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: '#7c6aef',
  },
  tabText: {
    fontSize: 15,
    color: '#8888aa',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 15,
    color: '#8888aa',
    textAlign: 'center',
    lineHeight: 22,
  },
  postListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
})
