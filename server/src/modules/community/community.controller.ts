import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { eq, desc, count, and, inArray } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import { DRIZZLE } from '@/modules/db/db.module'
import { posts } from '@/db/schema/posts'
import { comments, likes, follows } from '@/db/schema/comments'
import { users } from '@/db/schema/users'
import { AuthGuard, Public } from '@/modules/auth/auth.guard'
import { success, error } from '@/common/api-response'
import * as crypto from 'crypto'

@ApiTags('community')
@Controller('community')
export class CommunityController {
  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<any>) {}

  @Post('posts')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '创建帖子' })
  async createPost(@Body() body: { userId: string; content: string; type?: string; courseId?: string }) {
    if (!body.userId || !body.content) return error('userId and content are required')
    const id = crypto.randomUUID()
    this.db.insert(posts).values({
      id, userId: body.userId, content: body.content,
      type: (body.type as any) || 'reflection',
      courseId: body.courseId || null,
    }).run()
    const [post] = this.db.select().from(posts).where(eq(posts.id, id)).limit(1).all()
    return success(post)
  }

  @Get('posts')
  @Public()
  @ApiOperation({ summary: '获取帖子列表（带作者信息）' })
  async getPosts(@Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    const p = parseInt(page)
    const ps = Math.min(parseInt(pageSize), 50)

    const data = this.db.select({
      id: posts.id,
      userId: posts.userId,
      content: posts.content,
      type: posts.type,
      courseId: posts.courseId,
      likesCount: posts.likesCount,
      commentsCount: posts.commentsCount,
      createdAt: posts.createdAt,
      authorNickname: users.nickname,
      authorAvatar: users.avatarUrl,
    })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(ps)
      .offset((p - 1) * ps)
      .all()

    const [total] = this.db.select({ total: count() }).from(posts).all()
    return success(data, { page: p, pageSize: ps, total: total?.total || 0 })
  }

  @Get('posts/:id')
  @Public()
  @ApiOperation({ summary: '获取帖子详情（含作者信息）' })
  async getPost(@Param('id') id: string) {
    const [post] = this.db.select({
      id: posts.id,
      userId: posts.userId,
      content: posts.content,
      type: posts.type,
      courseId: posts.courseId,
      likesCount: posts.likesCount,
      commentsCount: posts.commentsCount,
      createdAt: posts.createdAt,
      authorNickname: users.nickname,
      authorAvatar: users.avatarUrl,
    })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, id))
      .limit(1)
      .all()

    if (!post) return error('Post not found')
    return success(post)
  }

  @Delete('posts/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '删除帖子' })
  async deletePost(@Param('id') id: string, @Req() req: any) {
    const existing = this.db.select().from(posts).where(eq(posts.id, id)).limit(1).all()[0]
    if (!existing) return error('Post not found')
    if (existing.userId !== req.user?.id && req.user?.role !== 'admin') {
      return error('You can only delete your own posts')
    }
    this.db.delete(posts).where(eq(posts.id, id)).run()
    return success({ deleted: true })
  }

  @Post('posts/:id/comments')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '添加评论' })
  async addComment(@Param('id') postId: string, @Body() body: { userId: string; content: string }) {
    if (!body.userId || !body.content) return error('userId and content are required')
    const id = crypto.randomUUID()
    this.db.insert(comments).values({ id, postId, userId: body.userId, content: body.content }).run()

    const commentRows = this.db.select({ total: count() }).from(comments).where(eq(comments.postId, postId)).all()
    this.db.update(posts).set({ commentsCount: commentRows[0]?.total || 0 }).where(eq(posts.id, postId)).run()

    const [comment] = this.db.select({
      id: comments.id,
      postId: comments.postId,
      userId: comments.userId,
      content: comments.content,
      createdAt: comments.createdAt,
      authorNickname: users.nickname,
      authorAvatar: users.avatarUrl,
    })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.id, id))
      .limit(1)
      .all()

    return success(comment)
  }

  @Get('posts/:id/comments')
  @Public()
  @ApiOperation({ summary: '获取评论列表（含作者信息）' })
  async getComments(@Param('id') postId: string) {
    const data = this.db.select({
      id: comments.id,
      postId: comments.postId,
      userId: comments.userId,
      content: comments.content,
      createdAt: comments.createdAt,
      authorNickname: users.nickname,
      authorAvatar: users.avatarUrl,
    })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .all()
    return success(data)
  }

  @Post('posts/:id/like')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '点赞帖子' })
  async likePost(@Param('id') postId: string, @Body('userId') userId: string) {
    if (!userId) return error('userId is required')
    await this.db.insert(likes).values({ userId, postId }).onConflictDoNothing().run()
    const likeTotal = this.db.select({ total: count() }).from(likes).where(eq(likes.postId, postId)).all()[0]?.total || 0
    this.db.update(posts).set({ likesCount: likeTotal }).where(eq(posts.id, postId)).run()
    return success({ liked: true })
  }

  @Delete('posts/:id/like')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '取消点赞' })
  async unlikePost(@Param('id') postId: string, @Query('userId') userId: string) {
    if (!userId) return error('userId is required')
    this.db.delete(likes).where(and(eq(likes.postId, postId), eq(likes.userId, userId))).run()
    const likeTotal = this.db.select({ total: count() }).from(likes).where(eq(likes.postId, postId)).all()[0]?.total || 0
    this.db.update(posts).set({ likesCount: likeTotal }).where(eq(posts.id, postId)).run()
    return success({ liked: false })
  }

  @Post('users/:id/follow')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '关注用户' })
  async followUser(@Param('id') followingId: string, @Body('followerId') followerId: string) {
    if (!followerId) return error('followerId is required')
    if (followerId === followingId) return error('Cannot follow yourself')
    await this.db.insert(follows).values({ followerId, followingId }).onConflictDoNothing().run()
    return success({ followed: true })
  }

  @Delete('users/:id/follow')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '取消关注' })
  async unfollowUser(@Param('id') followingId: string, @Query('followerId') followerId: string) {
    if (!followerId) return error('followerId is required')
    this.db.delete(follows).where(and(eq(follows.followingId, followingId), eq(follows.followerId, followerId))).run()
    return success({ followed: false })
  }

  @Get('users/:id/followers')
  @Public()
  @ApiOperation({ summary: '获取粉丝列表' })
  async getFollowers(@Param('id') userId: string) {
    const rows = this.db.select({
      followerId: follows.followerId,
      nickname: users.nickname,
      avatarUrl: users.avatarUrl,
      createdAt: follows.createdAt,
    })
      .from(follows)
      .leftJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId))
      .all()
    return success(rows)
  }

  @Get('users/:id/following')
  @Public()
  @ApiOperation({ summary: '获取关注列表' })
  async getFollowing(@Param('id') userId: string) {
    const rows = this.db.select({
      followingId: follows.followingId,
      nickname: users.nickname,
      avatarUrl: users.avatarUrl,
      createdAt: follows.createdAt,
    })
      .from(follows)
      .leftJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId))
      .all()
    return success(rows)
  }

  @Get('users/:id')
  @Public()
  @ApiOperation({ summary: '获取用户资料（含关注状态）' })
  async getUserProfile(@Param('id') userId: string, @Query('viewerId') viewerId?: string) {
    const [user] = this.db.select({
      id: users.id,
      nickname: users.nickname,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .all()

    if (!user) return error('User not found')

    const [postsCountResult] = this.db.select({ total: count() })
      .from(posts).where(eq(posts.userId, userId)).all()
    const [followersCountResult] = this.db.select({ total: count() })
      .from(follows).where(eq(follows.followingId, userId)).all()
    const [followingCountResult] = this.db.select({ total: count() })
      .from(follows).where(eq(follows.followerId, userId)).all()

    let isFollowing = false
    if (viewerId && viewerId !== userId) {
      const [followRow] = this.db.select()
        .from(follows)
        .where(and(eq(follows.followerId, viewerId), eq(follows.followingId, userId)))
        .limit(1)
        .all()
      isFollowing = !!followRow
    }

    return success({
      ...user,
      postsCount: postsCountResult?.total || 0,
      followersCount: followersCountResult?.total || 0,
      followingCount: followingCountResult?.total || 0,
      isFollowing,
    })
  }

  @Get('users/:id/posts')
  @Public()
  @ApiOperation({ summary: '获取用户帖子列表' })
  async getUserPosts(@Param('id') userId: string, @Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    const p = parseInt(page)
    const ps = Math.min(parseInt(pageSize), 50)

    const data = this.db.select({
      id: posts.id,
      userId: posts.userId,
      content: posts.content,
      type: posts.type,
      courseId: posts.courseId,
      likesCount: posts.likesCount,
      commentsCount: posts.commentsCount,
      createdAt: posts.createdAt,
      authorNickname: users.nickname,
      authorAvatar: users.avatarUrl,
    })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(ps)
      .offset((p - 1) * ps)
      .all()

    const [total] = this.db.select({ total: count() }).from(posts).where(eq(posts.userId, userId)).all()
    return success(data, { page: p, pageSize: ps, total: total?.total || 0 })
  }

  @Get('feed/:userId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '获取关注用户的动态流' })
  async getFeed(@Param('userId') userId: string, @Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    const p = parseInt(page)
    const ps = Math.min(parseInt(pageSize), 50)

    // 获取关注的用户ID列表
    const following = this.db.select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId))
      .all()
      .map(f => f.followingId)

    if (following.length === 0) {
      return success([], { page: p, pageSize: ps, total: 0 })
    }

    // 获取关注用户的帖子
    const data = this.db.select({
      id: posts.id,
      userId: posts.userId,
      content: posts.content,
      type: posts.type,
      courseId: posts.courseId,
      likesCount: posts.likesCount,
      commentsCount: posts.commentsCount,
      createdAt: posts.createdAt,
      authorNickname: users.nickname,
      authorAvatar: users.avatarUrl,
    })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(inArray(posts.userId, following))
      .orderBy(desc(posts.createdAt))
      .limit(ps)
      .offset((p - 1) * ps)
      .all()

    const [total] = this.db.select({ total: count() }).from(posts).where(inArray(posts.userId, following)).all()
    return success(data, { page: p, pageSize: ps, total: total?.total || 0 })
  }
}