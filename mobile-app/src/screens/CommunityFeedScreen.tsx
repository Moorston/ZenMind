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
import { PostCardSkeleton } from '@/components/Skeleton'

type TabKey = 'discover' | 'following'

export function CommunityFeedScreen() {
  const navigation = useNavigation<any>()
  const { isLoggedIn, userId: currentUserId } = useAuthStore()

  const [activeTab, setActiveTab] = useState<TabKey>('discover')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const activeTabRef = useRef(activeTab)
  const pageSize = 20

  // 同步 ref 避免闭包过期
  activeTabRef.current = activeTab

  // Tab 数据缓存：key 为 tab 名，value 为 { posts, page, hasMore }
  const tabCache = useRef<Record<TabKey, { posts: Post[]; page: number; hasMore: boolean }>>({
    discover: { posts: [], page: 0, hasMore: true },
    following: { posts: [], page: 0, hasMore: true },
  })

  const switchTab = useCallback((tab: TabKey) => {
    if (tab === activeTab) return
    // 保存当前 Tab 数据到缓存
    tabCache.current[activeTab] = { posts, page, hasMore }
    setActiveTab(tab)
    // 恢复目标 Tab 缓存
    const cached = tabCache.current[tab]
    if (cached.posts.length > 0) {
      setPosts(cached.posts)
      setPage(cached.page)
      setHasMore(cached.hasMore)
      setLoading(false)
    } else {
      // 缓存为空，发起请求
      fetchPosts(tab, 1)
    }
  }, [activeTab, posts, page, hasMore, fetchPosts])

  const fetchPosts = useCallback(async (tab: TabKey, pageNum: number, append = false) => {
    if (pageNum === 1) {
      setPosts([])
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
    // 首次加载或用户切换时清空缓存并重新加载
    tabCache.current = {
      discover: { posts: [], page: 0, hasMore: true },
      following: { posts: [], page: 0, hasMore: true },
    }
    setActiveTab('discover')
    fetchPosts('discover', 1)

    // 从 CreatePostScreen 返回时清空缓存并刷新当前 Tab
    const unsubscribe = navigation.addListener('focus', () => {
      tabCache.current = {
        discover: { posts: [], page: 0, hasMore: true },
        following: { posts: [], page: 0, hasMore: true },
      }
      fetchPosts(activeTabRef.current, 1)
    })
    return unsubscribe
  }, [currentUserId])

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
          onPress={() => switchTab('discover')}
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
            switchTab('following')
          }}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>
            关注
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
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
