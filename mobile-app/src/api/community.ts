import { Network } from './network'

export namespace CommunityAPI {
  export interface Post {
    id: string
    userId: string
    content: string
    type: 'reflection' | 'checkin' | 'share'
    courseId?: string | null
    likesCount: number
    commentsCount: number
    createdAt: string
    authorNickname?: string
    authorAvatar?: string
  }

  export interface PostDetail extends Post {
    // same fields, used for type clarity
  }

  export interface Comment {
    id: string
    postId: string
    userId: string
    content: string
    createdAt: string
    authorNickname?: string
    authorAvatar?: string
  }

  export interface UserProfile {
    id: string
    nickname: string
    avatarUrl?: string
    postsCount: number
    followersCount: number
    followingCount: number
    isFollowing: boolean
  }

  export interface Follower {
    followerId?: string
    followingId?: string
    nickname: string
    avatarUrl?: string
    createdAt: string
  }

  // Posts
  export async function getPosts(page = 1, pageSize = 20) {
    return Network.request<{ data: Post[]; meta?: { total: number } }>({
      url: `/api/community/posts?page=${page}&pageSize=${pageSize}`,
    })
  }

  export async function getFeed(userId: string, page = 1, pageSize = 20) {
    if (!userId) throw new Error('userId is required for getFeed')
    return Network.request<{ data: Post[]; meta?: { total: number } }>({
      url: `/api/community/feed/${userId}?page=${page}&pageSize=${pageSize}`,
    })
  }

  export async function getPost(postId: string) {
    return Network.request<{ data: PostDetail }>({
      url: `/api/community/posts/${postId}`,
    })
  }

  export async function createPost(params: { userId: string; content: string; type?: string }) {
    return Network.request<{ data: Post }>({
      url: '/api/community/posts',
      method: 'POST',
      data: { userId: params.userId, content: params.content, type: params.type || 'reflection' },
    })
  }

  export async function deletePost(postId: string) {
    return Network.request<{ data: { deleted: boolean } }>({
      url: `/api/community/posts/${postId}`,
      method: 'DELETE',
    })
  }

  // Likes
  export async function likePost(postId: string, userId: string) {
    if (!postId || !userId) throw new Error('postId and userId are required')
    return Network.request<{ data: { liked: boolean } }>({
      url: `/api/community/posts/${postId}/like`,
      method: 'POST',
      data: { userId },
    })
  }

  export async function unlikePost(postId: string, userId: string) {
    if (!postId || !userId) throw new Error('postId and userId are required')
    return Network.request<{ data: { liked: boolean } }>({
      url: `/api/community/posts/${postId}/like?userId=${userId}`,
      method: 'DELETE',
    })
  }

  // Comments
  export async function getComments(postId: string) {
    if (!postId) throw new Error('postId is required')
    return Network.request<{ data: Comment[] }>({
      url: `/api/community/posts/${postId}/comments`,
    })
  }

  export async function addComment(postId: string, userId: string, content: string) {
    if (!postId || !userId || !content) throw new Error('postId, userId and content are required')
    return Network.request<{ data: Comment }>({
      url: `/api/community/posts/${postId}/comments`,
      method: 'POST',
      data: { userId, content },
    })
  }

  // Users
  export async function getUserProfile(userId: string, viewerId?: string) {
    if (!userId) throw new Error('userId is required')
    const qs = viewerId ? `?viewerId=${viewerId}` : ''
    return Network.request<{ data: UserProfile }>({
      url: `/api/community/users/${userId}${qs}`,
    })
  }

  export async function getUserPosts(userId: string, page = 1, pageSize = 20) {
    if (!userId) throw new Error('userId is required')
    return Network.request<{ data: Post[]; meta?: { total: number } }>({
      url: `/api/community/users/${userId}/posts?page=${page}&pageSize=${pageSize}`,
    })
  }

  // Follow
  export async function followUser(userId: string, followerId: string) {
    if (!userId || !followerId) throw new Error('userId and followerId are required')
    return Network.request<{ data: { followed: boolean } }>({
      url: `/api/community/users/${userId}/follow`,
      method: 'POST',
      data: { followerId },
    })
  }

  export async function unfollowUser(userId: string, followerId: string) {
    if (!userId || !followerId) throw new Error('userId and followerId are required')
    return Network.request<{ data: { followed: boolean } }>({
      url: `/api/community/users/${userId}/follow?followerId=${followerId}`,
      method: 'DELETE',
    })
  }

  export async function getFollowers(userId: string) {
    return Network.request<{ data: Follower[] }>({
      url: `/api/community/users/${userId}/followers`,
    })
  }

  export async function getFollowing(userId: string) {
    return Network.request<{ data: Follower[] }>({
      url: `/api/community/users/${userId}/following`,
    })
  }
}
