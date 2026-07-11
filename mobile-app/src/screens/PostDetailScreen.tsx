import { useState, useEffect, useRef } from 'react'
import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, KeyboardAvoidingView,
  Platform, StyleSheet,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { CommunityAPI, type PostDetail as PostDetailType, type Comment } from '@/api/community'
import { useAuthStore } from '@/store/useAuthStore'
import PostCard from '@/components/PostCard'

export function PostDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const postId: string = route.params?.postId

  const { isLoggedIn, userId: currentUserId, nickname: currentNickname } = useAuthStore()

  const [post, setPost] = useState<PostDetailType | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    if (!postId) {
      navigation.goBack()
      return
    }
    loadData()
  }, [postId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [postRes, commentsRes] = await Promise.all([
        CommunityAPI.getPost(postId),
        CommunityAPI.getComments(postId),
      ])
      if (postRes.data) setPost(postRes.data)
      if (commentsRes.data) setComments(commentsRes.data)
    } catch (err) {
      console.error('[PostDetail] load failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!isLoggedIn || !currentUserId) return
    try {
      await CommunityAPI.likePost(postId, currentUserId)
      loadData()
    } catch (err) {
      console.error('[PostDetail] like failed:', err)
    }
  }

  const handleSubmitComment = async () => {
    if (!isLoggedIn || !currentUserId || !commentText.trim() || submitting) return
    const content = commentText.trim()
    setSubmitting(true)

    // 乐观追加：先添加到列表
    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      postId,
      userId: currentUserId,
      content,
      createdAt: new Date().toISOString(),
      authorNickname: currentNickname || '我',
    }
    setComments(prev => [...prev, optimisticComment])
    setCommentText('')
    inputRef.current?.blur()

    // 帖子评论数 +1
    if (post) setPost({ ...post, commentsCount: post.commentsCount + 1 })

    try {
      const res = await CommunityAPI.addComment(postId, currentUserId, content)
      // 用服务端返回的真实数据替换临时评论
      if (res.data) {
        setComments(prev => prev.map(c =>
          c.id === optimisticComment.id ? res.data : c
        ))
      }
    } catch (err) {
      // 失败回滚：移除临时评论，恢复评论数
      setComments(prev => prev.filter(c => c.id !== optimisticComment.id))
      if (post) setPost({ ...post, commentsCount: post.commentsCount - 1 })
      console.error('[PostDetail] comment failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return '刚刚'
    if (diffMin < 60) return `${diffMin}分钟前`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour}小时前`
    const diffDay = Math.floor(diffHour / 24)
    if (diffDay < 30) return `${diffDay}天前`
    return d.toLocaleDateString()
  }

  const typeLabels: Record<string, string> = {
    reflection: '心得',
    checkin: '打卡',
    share: '分享',
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c6aef" />
      </View>
    )
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>帖子不存在</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>帖子详情</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Post */}
        <PostCard
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

        {/* Comments header */}
        <Text style={styles.sectionTitle}>评论 ({comments.length})</Text>

        {/* Comments list */}
        {comments.length === 0 ? (
          <Text style={styles.emptyComments}>暂无评论</Text>
        ) : (
          comments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentAuthorRow}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>
                    {comment.authorAvatar || '🧘'}
                  </Text>
                </View>
                <Text style={styles.commentNickname}>
                  {comment.authorNickname || '匿名用户'}
                </Text>
                <Text style={styles.commentDate}>
                  {formatDate(comment.createdAt)}
                </Text>
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
            </View>
          ))
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Comment input bar */}
      <View style={styles.inputBar}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="输入评论..."
          placeholderTextColor="#9090a0"
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!commentText.trim() || submitting) && styles.sendBtnDisabled,
          ]}
          disabled={!commentText.trim() || submitting}
          onPress={handleSubmitComment}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendBtnText}>发送</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  center: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#0a0a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 22,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 12,
  },
  emptyText: {
    color: '#9090a0',
    fontSize: 15,
  },
  emptyComments: {
    color: '#9090a0',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 32,
  },
  commentCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7c6aef30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  commentAvatarText: {
    fontSize: 12,
  },
  commentNickname: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7c6aef',
    flex: 1,
  },
  commentDate: {
    fontSize: 11,
    color: '#9090a0',
  },
  commentContent: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1a1a3e',
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
  },
  input: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#fff',
    maxHeight: 100,
    marginRight: 10,
  },
  sendBtn: {
    backgroundColor: '#7c6aef',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})
