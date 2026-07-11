import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CommunityAPI } from '@/api/community';
import { useAuthStore } from '@/store/useAuthStore';

const AVATAR_EMOJIS = ['🧘', '🌿', '🌸', '🍃', '🌙', '✨', '🦋', '🌊'];

function getAvatarEmoji(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_EMOJIS[Math.abs(hash) % AVATAR_EMOJIS.length];
}

export function UserProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId } = route.params as { userId: string };

  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const [profile, setProfile] = useState<CommunityAPI.UserProfile | null>(null);
  const [posts, setPosts] = useState<CommunityAPI.Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const pageSize = 20;

  const isOwnProfile = currentUserId === userId;

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, postsRes] = await Promise.all([
        CommunityAPI.getUserProfile(userId, currentUserId ?? undefined),
        CommunityAPI.getUserPosts(userId, 1, pageSize),
      ]);
      const profileData = profileRes.data;
      setProfile(profileData);
      setIsFollowing(profileData.isFollowing);
      setFollowersCount(profileData.followersCount);
      setPosts(postsRes.data || []);
      setHasMore((postsRes.data || []).length >= pageSize);
      setPage(1);
    } catch (err) {
      console.error('Failed to load user profile:', err);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [userId, currentUserId]);

  const handleLoadMore = async () => {
    if (!initialized || loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await CommunityAPI.getUserPosts(userId, nextPage, pageSize)
      const newPosts = res.data || []
      setPosts(prev => [...prev, ...newPosts])
      setHasMore(newPosts.length >= pageSize)
      setPage(nextPage)
    } catch (err) {
      console.error('Failed to load more posts:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFollow = async () => {
    if (!currentUserId) return;
    // Optimistic update
    setIsFollowing(true);
    setFollowersCount((prev) => prev + 1);
    try {
      await CommunityAPI.followUser(userId, currentUserId);
    } catch (err) {
      // Rollback on failure
      setIsFollowing(false);
      setFollowersCount((prev) => prev - 1);
      console.error('Failed to follow user:', err);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUserId) return;
    // Optimistic update
    setIsFollowing(false);
    setFollowersCount((prev) => prev - 1);
    try {
      await CommunityAPI.unfollowUser(userId, currentUserId);
    } catch (err) {
      // Rollback on failure
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
      console.error('Failed to unfollow user:', err);
    }
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />
        <ActivityIndicator size="large" color="#7c6aef" />
      </View>
    );
  }

  const renderPost = ({ item: post }: { item: CommunityAPI.Post }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => handlePostPress(post.id)}
      activeOpacity={0.7}
    >
      <Text style={styles.postContent} numberOfLines={4}>
        {post.content}
      </Text>
      <View style={styles.postFooter}>
        <View style={styles.postStat}>
          <Text style={styles.postStatIcon}>{'❤'}</Text>
          <Text style={styles.postStatText}>{post.likesCount}</Text>
        </View>
        <View style={styles.postStat}>
          <Text style={styles.postStatIcon}>{'💬'}</Text>
          <Text style={styles.postStatText}>{post.commentsCount}</Text>
        </View>
        <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  )

  const renderHeader = () => (
    <View>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>
            {getAvatarEmoji(userId)}
          </Text>
        </View>

        <Text style={styles.nickname}>
          {profile?.nickname || '匿名用户'}
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.postsCount ?? 0}</Text>
            <Text style={styles.statLabel}>{'帖子'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{followersCount}</Text>
            <Text style={styles.statLabel}>{'关注者'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.followingCount ?? 0}</Text>
            <Text style={styles.statLabel}>{'关注'}</Text>
          </View>
        </View>

        {/* Follow/Unfollow Button */}
        {!isOwnProfile && (
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing && styles.followingButton,
            ]}
            onPress={isFollowing ? handleUnfollow : handleFollow}
          >
            <Text
              style={[
                styles.followButtonText,
                isFollowing && styles.followingButtonText,
              ]}
            >
              {isFollowing ? '已关注' : '关注'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Posts Section Header */}
      <View style={styles.postsSection}>
        <Text style={styles.sectionTitle}>{'发布的帖子'}</Text>
      </View>
    </View>
  )

  const renderFooter = () => {
    if (!loadingMore) return null
    return (
      <View style={{ paddingVertical: 16 }}>
        <ActivityIndicator size="small" color="#7c6aef" />
      </View>
    )
  }

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{'暂无帖子'}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{'用户主页'}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2a2a3e',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  profileCard: {
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7c6aef30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  nickname: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#8888aa',
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 30,
    backgroundColor: '#2a2a3e',
  },
  followButton: {
    backgroundColor: '#7c6aef',
    paddingVertical: 10,
    paddingHorizontal: 48,
    borderRadius: 24,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#7c6aef',
  },
  followButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  followingButtonText: {
    color: '#7c6aef',
  },
  postsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#8888aa',
  },
  postCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  postContent: {
    fontSize: 15,
    color: '#e0e0e0',
    lineHeight: 22,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  postStatIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  postStatText: {
    fontSize: 13,
    color: '#8888aa',
  },
  postDate: {
    fontSize: 12,
    color: '#666680',
    marginLeft: 'auto',
  },
});
