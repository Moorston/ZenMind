# ZenMind 全面演进设计文档

## 一、架构演进设计

### 1.1 Repository 层抽象

**目标**: 解耦 Service 层与 Drizzle ORM，为未来数据库迁移做准备

```
当前架构 (直接操作 ORM):
┌──────────┐      ┌──────────────┐      ┌─────────┐
│Controller│─────→│   Service    │─────→│  Drizzle│
│          │      │ (直接用 ORM) │      │  ORM    │
└──────────┘      └──────────────┘      └─────────┘

目标架构 (Repository 模式):
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌─────────┐
│Controller│─────→│ Service  │─────→│Repository│─────→│  Drizzle│
│          │      │ (业务逻辑)│      │ (数据抽象)│      │  ORM    │
└──────────┘      └──────────┘      └──────────┘      └─────────┘
```

**实现方案**:

```typescript
// server/src/repositories/base.repository.ts
export abstract class BaseRepository<T> {
  constructor(
    @Inject(DRIZZLE) protected db: BetterSQLite3Database<any>
  ) {}

  abstract findById(id: string): Promise<T | null>
  abstract findAll(query?: any): Promise<T[]>
  abstract create(data: Partial<T>): Promise<T>
  abstract update(id: string, data: Partial<T>): Promise<T | null>
  abstract delete(id: string): Promise<boolean>
}

// server/src/repositories/courses.repository.ts
@Injectable()
export class CoursesRepository extends BaseRepository<Course> {
  async findById(id: string): Promise<Course | null> {
    const [course] = await this.db.select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1)
    return course || null
  }

  async findByCategory(category: string): Promise<Course[]> {
    return this.db.select()
      .from(courses)
      .where(eq(courses.category, category))
      .all()
  }
}
```

**迁移策略**:
1. 先为每个模块创建 Repository (不改 Service)
2. 逐步将 Service 中的 ORM 调用替换为 Repository 调用
3. 最终删除 Service 中的直接 ORM 依赖

### 1.2 统一 API 响应格式

**当前问题**: 混用 `return { status: 'error' }` 和 `throw new Exception()`

**统一方案**:

```typescript
// server/src/common/api-response.ts
export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  data?: T
  message?: string
  errors?: Array<{
    field: string
    message: string
  }>
  meta?: {
    page?: number
    pageSize?: number
    total?: number
  }
}

// server/src/common/api-exception.filter.ts
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Internal server error'

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus()
      message = exception.message
    }

    response.status(statusCode).json({
      status: 'error',
      message,
    })
  }
}

// Controller 使用示例
@Get(':id')
async findById(@Param('id') id: string): Promise<ApiResponse<Course>> {
  const course = await this.coursesService.findById(id)
  if (!course) {
    throw new NotFoundException('Course not found')
  }
  return { status: 'success', data: course }
}
```

### 1.3 Swagger/OpenAPI 自动生成

**实现方案**:

```typescript
// server/src/main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .setTitle('ZenMind API')
    .setDescription('冥想应用 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(3000)
}
```

**效果**: 访问 `http://localhost:3000/api/docs` 自动生成交互式 API 文档

### 1.4 管理后台 API 增强

**新增接口**:

```typescript
// server/src/modules/admin/admin.controller.ts
@Controller('admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {

  // 数据统计
  @Get('stats')
  async getStats(): Promise<ApiResponse<AdminStats>> { ... }

  // 用户管理
  @Get('users')
  async getUsers(@Query() query: PaginationDto): Promise<PaginatedResponse<User>> { ... }

  @Put('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body() body: UpdateRoleDto) { ... }

  // 内容管理
  @Post('courses')
  async createCourse(@Body() body: CreateCourseDto) { ... }

  @Put('courses/:id')
  async updateCourse(@Param('id') id: string, @Body() body: UpdateCourseDto) { ... }

  // 推送管理
  @Post('push/broadcast')
  async broadcastPush(@Body() body: BroadcastDto) { ... }
}
```

---

## 二、性能优化设计

### 2.1 数据库索引优化

**当前问题**: 无索引，全表扫描

**索引方案**:

```sql
-- push_tokens 表 (每分钟查询)
CREATE INDEX idx_push_tokens_enabled_time
ON push_tokens(enabled, reminder_time)
WHERE enabled = 1;

-- courses 表 (频繁按分类查询)
CREATE INDEX idx_courses_category
ON courses(category);

CREATE INDEX idx_courses_level
ON courses(level);

CREATE INDEX idx_courses_instructor
ON courses(instructor_id);

-- progress 表 (按用户查询)
CREATE INDEX idx_progress_user
ON progress(user_id);

-- users 表 (按 token 查询，认证用)
CREATE INDEX idx_users_token
ON users(token);

-- email_verification_codes 表 (按邮箱+验证码查询)
CREATE INDEX idx_email_codes_email
ON email_verification_codes(email, code, used);
```

**Drizzle ORM 索引定义**:

```typescript
// server/src/db/schema/push-tokens.ts
export const pushTokens = sqliteTable('push_tokens', {
  // ... existing columns
}, (table) => ({
  enabledTimeIdx: index('idx_push_tokens_enabled_time')
    .on(table.enabled, table.reminderTime),
}))
```

### 2.2 推送服务优化

**当前问题**: 每分钟全表扫描 O(n)

**优化方案1: 内存缓存 + 增量更新**

```typescript
@Injectable()
export class PushSchedulerService {
  private reminderCache: Map<string, PushToken[]> = new Map()
  private lastCacheUpdate = 0

  @Cron(CronExpression.EVERY_MINUTE)
  async handleReminderPush() {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    // 每 5 分钟更新缓存
    if (Date.now() - this.lastCacheUpdate > 5 * 60 * 1000) {
      await this.refreshCache()
    }

    const dueReminders = this.reminderCache.get(currentTime) || []
    // ... 发送推送
  }

  private async refreshCache() {
    const allReminders = await this.db.select()
      .from(pushTokens)
      .where(eq(pushTokens.enabled, true))
      .all()

    this.reminderCache.clear()
    for (const reminder of allReminders) {
      const time = reminder.reminderTime
      if (!this.reminderCache.has(time)) {
        this.reminderCache.set(time, [])
      }
      this.reminderCache.get(time)!.push(reminder)
    }
    this.lastCacheUpdate = Date.now()
  }
}
```

**优化方案2: Redis Sorted Set (推荐用于生产)**

```typescript
// 推送偏好保存时，同时写入 Redis
async savePreferences(userId: string, reminderTime: string) {
  // 写入数据库
  await this.db.insert(pushTokens).values({ ... })

  // 写入 Redis Sorted Set (score = 时间戳)
  const timestamp = this.timeToTimestamp(reminderTime)
  await this.redis.zadd('push:reminders', timestamp, userId)
}

// 定时任务只查询当前时间窗口
@Cron(CronExpression.EVERY_MINUTE)
async handleReminderPush() {
  const now = Date.now()
  const userIds = await this.redis.zrangebyscore(
    'push:reminders',
    now - 60000,  // 1 分钟前
    now           // 现在
  )
  // 只查询这小部分用户
}
```

### 2.3 前端请求缓存

**方案**: 使用 SWR (Stale-While-Revalidate)

```typescript
// mini-app/src/hooks/useCourses.ts
import useSWR from 'swr'

export function useCourses(category?: string) {
  const { data, error, isLoading } = useSWR(
    `/api/courses?category=${category}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 分钟内去重
      staleTime: 300000,       // 5 分钟缓存
    }
  )

  return { courses: data, error, isLoading }
}
```

---

## 三、部署方案设计

### 3.1 Docker 容器化

**server/Dockerfile**:

```dockerfile
# 多阶段构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/api/health || exit 1
CMD ["node", "dist/main"]
```

**docker-compose.yml**:

```yaml
version: '3.8'

services:
  server:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:/data/zenmind.db
      - TOS_ENDPOINT=${TOS_ENDPOINT}
      - TOS_ACCESS_KEY=${TOS_ACCESS_KEY}
      - TOS_SECRET_KEY=${TOS_SECRET_KEY}
      - WECHAT_APPID=${WECHAT_APPID}
      - WECHAT_APPSECRET=${WECHAT_APPSECRET}
    volumes:
      - ./data:/data
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - server
    restart: unless-stopped

volumes:
  redis-data:
```

### 3.2 GitHub Actions CI/CD

**.github/workflows/ci.yml**:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter server test
      - run: pnpm --filter mini-app tsc

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t zenmind-server ./server

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker tag zenmind-server ${{ secrets.DOCKER_REGISTRY }}/zenmind-server:latest
          docker push ${{ secrets.DOCKER_REGISTRY }}/zenmind-server:latest

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/zenmind
            docker-compose pull
            docker-compose up -d
```

### 3.3 云服务部署方案

**推荐: 阿里云方案**

```
┌─────────────────────────────────────────┐
│           阿里云部署架构                  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  阿里云 CDN                     │   │
│  │  (静态资源 + TOS 加速)          │   │
│  └───────────────┬─────────────────┘   │
│                  │                      │
│  ┌───────────────▼─────────────────┐   │
│  │  阿里云 ECS (2核4G)             │   │
│  │  ┌───────────────────────────┐  │   │
│  │  │  Docker Compose           │  │   │
│  │  │  ├── NestJS Server        │  │   │
│  │  │  ├── Redis                │  │   │
│  │  │  └── Nginx                │  │   │
│  │  └───────────────────────────┘  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  阿里云 RDS PostgreSQL          │   │
│  │  (可选，替代 SQLite)            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  火山引擎 TOS                   │   │
│  │  (媒体文件存储)                 │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

成本估算:
├── ECS 2核4G: ¥200/月
├── RDS PostgreSQL: ¥150/月 (可选)
├── TOS 存储: ¥10/月
├── CDN 流量: ¥50/月
└── 总计: ¥260-410/月
```

---

## 四、技术债务修复设计

### 4.1 AuthGuard 测试兼容性

**问题**: `APP_GUARD` 注册导致测试环境 DI 失败

**解决方案**: 将 `APP_GUARD` 移至 `AppModule`，测试时使用 `overrideGuard`

```typescript
// server/src/app.module.ts
@Module({
  imports: [DbModule, AuthModule, ...],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}

// 测试时
const module = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideGuard(AuthGuard)
  .useValue({ canActivate: () => true }) // 测试时跳过认证
  .compile()
```

### 4.2 Rate Limiting

**方案**: 使用 `@nestjs/throttler`

```typescript
// server/src/app.module.ts
import { ThrottlerModule } from '@nestjs/throttler'

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,  // 1 分钟
      limit: 100,  // 100 次请求
    }]),
  ],
})
export class AppModule {}

// 特定接口限制更严格
@Controller('auth')
@Throttle({ default: { limit: 5, ttl: 60000 } }) // 1 分钟 5 次
export class AuthController {
  @Post('login')
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 5 分钟 3 次
  async login() { ... }
}
```

### 4.3 错误处理标准化

**方案**: 全局异常过滤器 + 标准错误码

```typescript
// server/src/common/error-codes.ts
export enum ErrorCode {
  // 认证相关 (1xxx)
  AUTH_TOKEN_MISSING = 1001,
  AUTH_TOKEN_INVALID = 1002,
  AUTH_TOKEN_EXPIRED = 1003,
  AUTH_EMAIL_REQUIRED = 1004,
  AUTH_PASSWORD_REQUIRED = 1005,

  // 业务逻辑 (2xxx)
  COURSE_NOT_FOUND = 2001,
  SERIES_NOT_FOUND = 2002,
  INSTRUCTOR_NOT_FOUND = 2003,

  // 服务器错误 (5xxx)
  INTERNAL_ERROR = 5000,
  DATABASE_ERROR = 5001,
}

// server/src/common/api-exception.ts
export class ApiException extends HttpException {
  constructor(
    public readonly errorCode: ErrorCode,
    statusCode: HttpStatus,
    message?: string,
  ) {
    super(message || ErrorCode[errorCode], statusCode)
  }
}

// 使用示例
if (!course) {
  throw new ApiException(
    ErrorCode.COURSE_NOT_FOUND,
    HttpStatus.NOT_FOUND,
    '课程不存在'
  )
}
```

---

## 五、实时多人冥想设计

### 5.1 技术架构

```
┌─────────────────────────────────────────────────────┐
│                实时多人冥想架构                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐  │
│  │ Client A │─WS──→│          │─WS──→│ Client B │  │
│  └──────────┘      │  NestJS  │      └──────────┘  │
│                    │ WebSocket│                     │
│  ┌──────────┐      │ Gateway  │      ┌──────────┐  │
│  │ Client C │─WS──→│          │─WS──→│ Client D │  │
│  └──────────┘      └────┬─────┘      └──────────┘  │
│                         │                           │
│                    ┌────▼─────┐                     │
│                    │  Redis   │                     │
│                    │  PubSub  │                     │
│                    └──────────┘                     │
└─────────────────────────────────────────────────────┘
```

### 5.2 数据模型

```typescript
// server/src/db/schema/rooms.ts
export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  hostId: text('host_id').notNull().references(() => users.id),
  courseId: text('course_id').references(() => courses.id),
  status: text('status', { enum: ['waiting', 'playing', 'ended'] }),
  maxParticipants: integer('max_participants').default(10),
  createdAt: text('created_at').notNull(),
})

export const roomParticipants = sqliteTable('room_participants', {
  roomId: text('room_id').notNull().references(() => rooms.id),
  userId: text('user_id').notNull().references(() => users.id),
  joinedAt: text('joined_at').notNull(),
  role: text('role', { enum: ['host', 'participant'] }),
}, (table) => ({
  pk: primaryKey({ columns: [table.roomId, table.userId] }),
}))
```

### 5.3 WebSocket Gateway

```typescript
// server/src/modules/rooms/rooms.gateway.ts
@WebSocketGateway({ cors: true })
export class RoomsGateway {
  @WebSocketServer()
  server: Server

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string },
  ) {
    // 加入房间
    client.join(data.roomId)

    // 通知房间内其他人
    this.server.to(data.roomId).emit('userJoined', {
      userId: data.userId,
      timestamp: Date.now(),
    })
  }

  @SubscribeMessage('playbackSync')
  handlePlaybackSync(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; currentTime: number; isPlaying: boolean },
  ) {
    // 同步播放状态给房间内其他人
    client.to(data.roomId).emit('playbackUpdate', {
      currentTime: data.currentTime,
      isPlaying: data.isPlaying,
      timestamp: Date.now(),
    })
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string },
  ) {
    client.leave(data.roomId)
    this.server.to(data.roomId).emit('userLeft', { userId: data.userId })
  }
}
```

### 5.4 前端集成

```typescript
// mini-app/src/hooks/useRoom.ts
import { io, Socket } from 'socket.io-client'

export function useRoom(roomId: string) {
  const [participants, setParticipants] = useState<string[]>([])
  const [playbackState, setPlaybackState] = useState({
    currentTime: 0,
    isPlaying: false,
  })

  useEffect(() => {
    const socket: Socket = io('ws://localhost:3000')

    socket.emit('joinRoom', { roomId, userId: currentUser.id })

    socket.on('userJoined', (data) => {
      setParticipants(prev => [...prev, data.userId])
    })

    socket.on('playbackUpdate', (data) => {
      setPlaybackState(data)
      // 同步本地播放器
      audioPlayer.seek(data.currentTime)
      if (data.isPlaying) audioPlayer.play()
      else audioPlayer.pause()
    })

    return () => {
      socket.emit('leaveRoom', { roomId, userId: currentUser.id })
      socket.disconnect()
    }
  }, [roomId])

  return { participants, playbackState }
}
```

---

## 六、AI 推荐系统设计

### 6.1 推荐策略

```
推荐策略分层:
┌─────────────────────────────────────┐
│  Layer 1: 基于规则的推荐 (立即实现)  │
│  ├── 时间段推荐 (早晨→专注, 晚上→睡眠)│
│  ├── 偏好匹配 (用户选择的偏好)       │
│  └── 热门课程 (播放次数最多的)        │
├─────────────────────────────────────┤
│  Layer 2: 协同过滤 (需要数据积累)     │
│  ├── 相似用户推荐                    │
│  └── 相似课程推荐                    │
├─────────────────────────────────────┤
│  Layer 3: 语义推荐 (可选，成本高)     │
│  ├── OpenAI Embedding API           │
│  └── 课程描述语义匹配               │
└─────────────────────────────────────┘
```

### 6.2 规则推荐实现

```typescript
// server/src/modules/recommendations/recommendations.service.ts
@Injectable()
export class RecommendationsService {
  constructor(
    @Inject(DRIZZLE) private db: BetterSQLite3Database<any>,
  ) {}

  async getPersonalizedRecommendations(userId: string): Promise<Course[]> {
    const hour = new Date().getHours()
    const user = await this.getUserPreferences(userId)

    // 规则1: 基于时间段
    let targetCategory: string
    if (hour >= 5 && hour < 12) {
      targetCategory = 'mindfulness'  // 早晨: 正念
    } else if (hour >= 12 && hour < 18) {
      targetCategory = 'breathing'    // 下午: 呼吸
    } else {
      targetCategory = 'sleep'        // 晚上: 睡眠
    }

    // 规则2: 结合用户偏好
    if (user?.preference) {
      targetCategory = user.preference
    }

    // 规则3: 排除已完成的课程
    const completedCourses = await this.getCompletedCourses(userId)

    const recommendations = await this.db.select()
      .from(courses)
      .where(and(
        eq(courses.category, targetCategory),
        not(inArray(courses.id, completedCourses)),
      ))
      .limit(5)
      .all()

    return recommendations
  }

  async getSimilarCourses(courseId: string): Promise<Course[]> {
    const course = await this.db.select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1)
      .all()[0]

    // 基于 category + level + tags 相似度
    return this.db.select()
      .from(courses)
      .where(and(
        eq(courses.category, course.category),
        ne(courses.id, courseId),
      ))
      .limit(5)
      .all()
  }
}
```

### 6.3 推荐 API

```typescript
// server/src/modules/recommendations/recommendations.controller.ts
@Controller('recommendations')
export class RecommendationsController {

  @Get('personalized')
  async getPersonalized(@Request() req): Promise<ApiResponse<Course[]>> {
    const userId = req.user.id
    const courses = await this.recommendationsService.getPersonalizedRecommendations(userId)
    return { status: 'success', data: courses }
  }

  @Get('similar/:courseId')
  async getSimilar(@Param('courseId') courseId: string): Promise<ApiResponse<Course[]>> {
    const courses = await this.recommendationsService.getSimilarCourses(courseId)
    return { status: 'success', data: courses }
  }

  @Get('trending')
  async getTrending(): Promise<ApiResponse<Course[]>> {
    // 基于最近播放次数排序
    const courses = await this.recommendationsService.getTrendingCourses()
    return { status: 'success', data: courses }
  }
}
```

---

## 七、社区功能设计

### 7.1 数据模型

```typescript
// server/src/db/schema/posts.ts
export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  courseId: text('course_id').references(() => courses.id), // 关联课程 (可选)
  content: text('content').notNull(),
  type: text('type', { enum: ['reflection', 'checkin', 'share'] }),
  likesCount: integer('likes_count').default(0),
  commentsCount: integer('comments_count').default(0),
  createdAt: text('created_at').notNull(),
})

// server/src/db/schema/comments.ts
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
})

// server/src/db/schema/likes.ts
export const likes = sqliteTable('likes', {
  userId: text('user_id').notNull().references(() => users.id),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.postId] }),
}))

// server/src/db/schema/follows.ts
export const follows = sqliteTable('follows', {
  followerId: text('follower_id').notNull().references(() => users.id),
  followingId: text('following_id').notNull().references(() => users.id),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.followerId, table.followingId] }),
}))
```

### 7.2 社区 API

```typescript
// server/src/modules/community/community.controller.ts
@Controller('community')
export class CommunityController {

  // 帖子
  @Post('posts')
  async createPost(@Request() req, @Body() body: CreatePostDto) { ... }

  @Get('posts')
  async getFeed(@Query() query: FeedQueryDto) { ... }

  @Get('posts/:id')
  async getPost(@Param('id') id: string) { ... }

  @Delete('posts/:id')
  async deletePost(@Param('id') id: string, @Request() req) { ... }

  // 评论
  @Post('posts/:id/comments')
  async addComment(@Param('id') postId: string, @Body() body: CreateCommentDto) { ... }

  @Get('posts/:id/comments')
  async getComments(@Param('id') postId: string) { ... }

  // 点赞
  @Post('posts/:id/like')
  async likePost(@Param('id') postId: string, @Request() req) { ... }

  @Delete('posts/:id/like')
  async unlikePost(@Param('id') postId: string, @Request() req) { ... }

  // 关注
  @Post('users/:id/follow')
  async followUser(@Param('id') userId: string, @Request() req) { ... }

  @Delete('users/:id/follow')
  async unfollowUser(@Param('id') userId: string, @Request() req) { ... }

  @Get('users/:id/followers')
  async getFollowers(@Param('id') userId: string) { ... }

  @Get('users/:id/following')
  async getFollowing(@Param('id') userId: string) { ... }
}
```

### 7.3 前端社区页面

```typescript
// mini-app/src/pages/community/index.tsx
export default function Community() {
  const { posts, loading, loadMore } = useFeed()

  return (
    <ScrollView>
      {/* 发帖入口 */}
      <CreatePostButton />

      {/* 帖子列表 */}
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onLike={() => handleLike(post.id)}
          onComment={() => navigateToComments(post.id)}
        />
      ))}

      {/* 加载更多 */}
      <LoadMoreButton loading={loading} onPress={loadMore} />
    </ScrollView>
  )
}
```

---

## 八、微信支付集成设计

### 8.1 支付流程

```
┌─────────────────────────────────────────────────────┐
│                微信支付流程                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. 用户选择课程/会员                                │
│         │                                           │
│         ▼                                           │
│  2. 前端调用后端创建订单                             │
│         │                                           │
│         ▼                                           │
│  3. 后端调用微信支付统一下单 API                      │
│         │                                           │
│         ▼                                           │
│  4. 返回 prepay_id 给前端                           │
│         │                                           │
│         ▼                                           │
│  5. 前端调用 wx.requestPayment                       │
│         │                                           │
│         ▼                                           │
│  6. 用户完成支付                                     │
│         │                                           │
│         ▼                                           │
│  7. 微信回调后端通知支付成功                          │
│         │                                           │
│         ▼                                           │
│  8. 后端更新订单状态，解锁课程/会员                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 8.2 数据模型

```typescript
// server/src/db/schema/orders.ts
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type', { enum: ['course', 'membership'] }),
  itemId: text('item_id'),  // 课程ID 或 会员类型
  amount: integer('amount').notNull(),  // 金额 (分)
  status: text('status', { enum: ['pending', 'paid', 'refunded', 'cancelled'] }),
  paymentId: text('payment_id'),  // 微信支付订单号
  createdAt: text('created_at').notNull(),
  paidAt: text('paid_at'),
})

// server/src/db/schema/memberships.ts
export const memberships = sqliteTable('memberships', {
  userId: text('user_id').notNull().references(() => users.id),
  level: text('level', { enum: ['free', 'premium', 'vip'] }),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId] }),
}))
```

### 8.3 支付服务

```typescript
// server/src/modules/payments/payments.service.ts
@Injectable()
export class PaymentsService {
  async createOrder(userId: string, type: string, itemId: string): Promise<Order> {
    const amount = await this.calculateAmount(type, itemId)

    const order = await this.db.insert(orders).values({
      id: crypto.randomUUID(),
      userId,
      type,
      itemId,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }).returning()

    // 调用微信支付统一下单
    const prepayId = await this.wechatPayUnifiedOrder(order[0])

    return { ...order[0], prepayId }
  }

  async handlePaymentCallback(data: WechatPayCallback) {
    // 验证签名
    if (!this.verifySignature(data)) {
      throw new Error('Invalid signature')
    }

    // 更新订单状态
    await this.db.update(orders)
      .set({ status: 'paid', paymentId: data.transaction_id, paidAt: new Date().toISOString() })
      .where(eq(orders.id, data.out_trade_no))

    // 解锁内容
    const order = await this.getOrder(data.out_trade_no)
    if (order.type === 'course') {
      await this.unlockCourse(order.userId, order.itemId)
    } else if (order.type === 'membership') {
      await this.activateMembership(order.userId, order.itemId)
    }
  }
}
```

---

## 九、实施优先级与时间线

```
┌─────────────────────────────────────────────────────┐
│                    12个月路线图                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Month 1-2: 基础设施                                │
│  ├── 统一 API 响应格式                              │
│  ├── Swagger 文档生成                               │
│  ├── 数据库索引优化                                 │
│  └── Docker 容器化                                  │
│                                                     │
│  Month 3-4: 架构优化                                │
│  ├── Repository 层抽象                              │
│  ├── 管理后台 API                                   │
│  ├── CI/CD 流水线                                   │
│  └── Rate Limiting                                  │
│                                                     │
│  Month 5-6: 质量提升                                │
│  ├── 修复 AuthGuard 测试问题                        │
│  ├── E2E 测试覆盖率 80%                            │
│  ├── 性能监控                                       │
│  └── 日志收集                                       │
│                                                     │
│  Month 7-8: 增长功能                                │
│  ├── 微信支付集成                                   │
│  ├── 会员等级系统                                   │
│  └── AI 推荐系统 (规则版)                           │
│                                                     │
│  Month 9-10: 社交功能                               │
│  ├── 社区帖子/评论/点赞                             │
│  ├── 关注系统                                       │
│  └── 通知系统增强                                   │
│                                                     │
│  Month 11-12: 高级功能                              │
│  ├── 实时多人冥想                                   │
│  ├── AI 推荐系统 (协同过滤)                         │
│  └── 数据分析仪表盘                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 资源估算

| 阶段 | 人力 | 云服务成本 |
|------|------|-----------|
| Month 1-6 | 1-2 开发 | ¥500/月 |
| Month 7-12 | 2-3 开发 | ¥1000/月 |
| 总计 | 12-18 人月 | ¥9000/年 |

---

这份设计文档覆盖了 ZenMind 未来 12 个月的完整演进路线，包含架构、性能、部署、质量、新功能五个维度的具体实现方案。需要我针对某个方向进一步细化吗？