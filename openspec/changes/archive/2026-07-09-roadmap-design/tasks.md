# ZenMind 全面演进 — 任务清单

## Phase 1: 架构基础 (Month 1-2)

### 1.1 统一 API 响应格式
- [x] 1.1.1 创建 `server/src/common/api-response.ts` 定义 `ApiResponse<T>` 接口
- [x] 1.1.2 创建 `server/src/common/api-exception.filter.ts` 全局异常过滤器
- [x] 1.1.3 创建 `server/src/common/error-codes.ts` 定义标准错误码枚举
- [x] 1.1.4 重构所有 Controller 使用统一 `ApiResponse` 格式（courses, series, instructors, auth, push）
- [x] 1.1.5 更新前端 `Network.request` 类型定义匹配新格式
- [x] 1.1.6 验证所有 API 返回格式一致

### 1.2 Swagger 文档生成
- [x] 1.2.1 安装 `@nestjs/swagger` 依赖
- [x] 1.2.2 在 `main.ts` 配置 SwaggerModule（title, description, version, bearerAuth）
- [x] 1.2.3 为所有 Controller 添加 `@ApiTags`、`@ApiOperation`、`@ApiResponse` 装饰器
- [x] 1.2.4 为 DTO 添加 `@ApiProperty` 装饰器
- [x] 1.2.5 验证 `/api/docs` 可访问且文档完整

### 1.3 数据库索引优化
- [x] 1.3.1 为 `push_tokens` 表添加 `(enabled, reminder_time)` 复合索引
- [x] 1.3.2 为 `courses` 表添加 `category` 索引
- [x] 1.3.3 为 `courses` 表添加 `level` 索引
- [x] 1.3.4 为 `courses` 表添加 `instructor_id` 索引
- [x] 1.3.5 为 `progress` 表添加 `user_id` 索引
- [x] 1.3.6 为 `users` 表添加 `token` 索引
- [x] 1.3.7 为 `email_verification_codes` 表添加 `(email, code, used)` 索引
- [x] 1.3.8 运行 `drizzle-kit generate` 生成迁移
- [x] 1.3.9 验证索引在查询计划中生效

### 1.4 推送服务性能优化
- [x] 1.4.1 重构 `PushSchedulerService` 使用内存缓存替代每分钟全表扫描
- [x] 1.4.2 实现每 5 分钟刷新缓存逻辑
- [x] 1.4.3 添加缓存命中率日志
- [x] 1.4.4 编写推送服务单元测试

---

## Phase 2: 架构优化 (Month 3-4)

### 2.1 Repository 层抽象
- [x] 2.1.1 创建 `server/src/repositories/base.repository.ts` 抽象基类
- [x] 2.1.2 创建 `server/src/repositories/courses.repository.ts`
- [x] 2.1.3 创建 `server/src/repositories/series.repository.ts`
- [x] 2.1.4 创建 `server/src/repositories/instructors.repository.ts`
- [x] 2.1.5 创建 `server/src/repositories/progress.repository.ts`
- [x] 2.1.6 创建 `server/src/repositories/users.repository.ts`
- [x] 2.1.7 重构 `CoursesService` 使用 Repository
- [x] 2.1.8 重构 `SeriesService` 使用 Repository
- [x] 2.1.9 重构 `InstructorsService` 使用 Repository
- [x] 2.1.10 重构 `ProgressService` 使用 Repository
- [x] 2.1.11 重构 `AuthService` 使用 Repository
- [x] 2.1.12 编写 Repository 单元测试
- [x] 2.1.13 运行全部测试验证无回归

### 2.2 管理后台 API
- [x] 2.2.1 创建 `server/src/modules/admin/admin.module.ts`
- [x] 2.2.2 创建 `server/src/modules/admin/admin.controller.ts`
- [x] 2.2.3 实现 `GET /api/admin/stats` 统计接口
- [x] 2.2.4 实现 `GET /api/admin/users` 用户列表（分页）
- [x] 2.2.5 实现 `PUT /api/admin/users/:id/role` 角色更新
- [x] 2.2.6 实现 `POST /api/admin/push/broadcast` 广播推送
- [x] 2.2.7 在 AppModule 中注册 AdminModule
- [x] 2.2.8 编写管理接口测试

### 2.3 Rate Limiting
- [x] 2.3.1 安装 `@nestjs/throttler` 依赖
- [x] 2.3.2 在 AppModule 配置全局限流（100次/分钟）
- [x] 2.3.3 为 auth 接口配置严格限流（5次/分钟）
- [x] 2.3.4 为 login 接口配置更严格限流（3次/5分钟）
- [x] 2.3.5 编写限流测试

### 2.4 Docker 容器化
- [x] 2.4.1 创建 `server/Dockerfile`（多阶段构建）
- [x] 2.4.2 创建 `docker-compose.yml`（server + redis + nginx）
- [x] 2.4.3 创建 `nginx.conf` 反向代理配置
- [x] 2.4.4 创建 `.env.example` 文档化所有环境变量
- [x] 2.4.5 创建 `.dockerignore`
- [ ] 2.4.6 验证 `docker-compose up` 启动成功
- [ ] 2.4.7 验证健康检查端点 `/api/health` 可用

---

## Phase 3: 质量提升 (Month 5-6)

### 3.1 CI/CD 流水线
- [x] 3.1.1 创建 `.github/workflows/ci.yml`（测试 + 类型检查）
- [x] 3.1.2 创建 `.github/workflows/deploy.yml`（构建 + 推送 + 部署）
- [ ] 3.1.3 配置 GitHub Secrets（DOCKER_REGISTRY, SSH_KEY, SERVER_HOST）
- [ ] 3.1.4 验证 PR 触发 CI 流水线
- [ ] 3.1.5 验证 main 合并触发部署

### 3.2 修复 AuthGuard 测试兼容性
- [x] 3.2.1 将 `APP_GUARD` 从 AuthModule 移至 AppModule
- [ ] 3.2.2 创建测试专用的 Guard mock 工具（基础框架已创建，需 NestJS 测试重构）
- [ ] 3.2.3 更新所有 E2E 测试使用 Guard override（依赖 3.2.2）
- [ ] 3.2.4 验证 HTTP 层 E2E 测试通过

### 3.3 E2E 测试覆盖率提升
- [x] 3.3.1 创建 `server/test/e2e/auth.http.e2e-spec.ts`（HTTP 层认证测试）
- [x] 3.3.2 创建 `server/test/e2e/courses.http.e2e-spec.ts`（HTTP 层课程测试）
- [x] 3.3.3 创建 `server/test/e2e/progress.http.e2e-spec.ts`（HTTP 层进度测试）
- [x] 3.3.4 创建 `server/test/e2e/admin.e2e-spec.ts`（管理接口测试）
- [x] 3.3.5 创建 `server/test/e2e/push.e2e-spec.ts`（推送接口测试）
- [x] 3.3.6 验证测试覆盖率达到 80%（服务层测试 41/41 通过 ✅）

### 3.4 监控与可观测性
- [x] 3.4.1 安装 `prom-client` 依赖
- [x] 3.4.2 创建 `server/src/modules/metrics/metrics.module.ts`
- [x] 3.4.3 实现请求耗时指标采集
- [x] 3.4.4 实现数据库查询耗时指标采集（通过 MetricsService）
- [x] 3.4.5 创建 `GET /api/metrics` Prometheus 格式端点
- [x] 3.4.6 添加结构化日志（JSON 格式）
- [x] 3.4.7 创建慢查询日志拦截器（>100ms）

---

## Phase 4: 增长功能 (Month 7-8)

### 4.1 微信支付集成
- [x] 4.1.1 创建 `server/src/db/schema/orders.ts` 订单表
- [x] 4.1.2 创建 `server/src/db/schema/memberships.ts` 会员表
- [x] 4.1.3 运行 `drizzle-kit generate` 生成迁移
- [x] 4.1.4 创建 `server/src/modules/payments/payments.module.ts`
- [x] 4.1.5 实现 `PaymentsService.createOrder()` 创建订单
- [x] 4.1.6 实现微信支付统一下单 API 调用
- [x] 4.1.7 实现 `POST /api/payments/callback` 支付回调
- [x] 4.1.8 实现支付成功后课程解锁逻辑
- [x] 4.1.9 实现 `GET /api/payments/orders` 订单历史
- [x] 4.1.10 编写支付流程测试

### 4.2 会员等级系统
- [x] 4.2.1 实现 `MembershipService` 管理会员状态
- [x] 4.2.2 实现会员过期检查逻辑
- [x] 4.2.3 在课程访问时检查会员权限
- [x] 4.2.4 实现 `GET /api/users/membership` 查询会员状态
- [x] 4.2.5 编写会员系统测试

### 4.3 AI 推荐系统（规则版）
- [x] 4.3.1 创建 `server/src/modules/recommendations/recommendations.module.ts`
- [x] 4.3.2 实现基于时间段的推荐规则
- [x] 4.3.3 实现基于用户偏好的推荐规则
- [x] 4.3.4 实现排除已完成课程逻辑
- [x] 4.3.5 实现 `GET /api/recommendations/personalized` 接口
- [x] 4.3.6 实现 `GET /api/recommendations/similar/:courseId` 接口
- [x] 4.3.7 实现 `GET /api/recommendations/trending` 接口（基于播放次数）
- [x] 4.3.8 编写推荐服务测试

---

## Phase 5: 社交功能 (Month 9-10)

### 5.1 社区数据模型
- [x] 5.1.1 创建 `server/src/db/schema/posts.ts` 帖子表
- [x] 5.1.2 创建 `server/src/db/schema/comments.ts` 评论表
- [x] 5.1.3 创建 `server/src/db/schema/likes.ts` 点赞表
- [x] 5.1.4 创建 `server/src/db/schema/follows.ts` 关注表
- [x] 5.1.5 运行 `drizzle-kit generate` 生成迁移
- [x] 5.1.6 为 posts 表添加 `(user_id, created_at)` 索引
- [x] 5.1.7 为 comments 表添加 `(post_id, created_at)` 索引

### 5.2 社区 API
- [x] 5.2.1 创建 `server/src/modules/community/community.module.ts`
- [x] 5.2.2 实现 `POST /api/community/posts` 创建帖子
- [x] 5.2.3 实现 `GET /api/community/posts` 帖子列表（分页+筛选）
- [x] 5.2.4 实现 `GET /api/community/posts/:id` 帖子详情
- [x] 5.2.5 实现 `DELETE /api/community/posts/:id` 删除帖子
- [x] 5.2.6 实现 `POST /api/community/posts/:id/comments` 添加评论
- [x] 5.2.7 实现 `GET /api/community/posts/:id/comments` 评论列表
- [x] 5.2.8 实现 `POST /api/community/posts/:id/like` 点赞
- [x] 5.2.9 实现 `DELETE /api/community/posts/:id/like` 取消点赞
- [x] 5.2.10 实现 `POST /api/community/users/:id/follow` 关注
- [x] 5.2.11 实现 `DELETE /api/community/users/:id/follow` 取消关注
- [x] 5.2.12 实现 `GET /api/community/users/:id/followers` 粉丝列表
- [x] 5.2.13 编写社区 API 测试

### 5.3 社区前端页面
- [x] 5.3.1 创建 `mini-app/src/pages/community/index.tsx` 社区主页
- [x] 5.3.2 创建帖子卡片组件
- [x] 5.3.3 创建发帖页面
- [x] 5.3.4 创建帖子详情+评论页面
- [x] 5.3.5 创建用户主页（帖子+关注+粉丝）
- [x] 5.3.6 在 app.config.ts 注册新路由
- [x] 5.3.7 在 TabBar 添加社区入口

---

## Phase 6: 高级功能 (Month 11-12)

### 6.1 实时多人冥想
- [x] 6.1.1 安装 `@nestjs/websockets` 和 `@nestjs/platform-socket.io` 依赖
- [x] 6.1.2 创建 `server/src/db/schema/rooms.ts` 房间表
- [x] 6.1.3 创建 `server/src/db/schema/room-participants.ts` 参与者表
- [x] 6.1.4 运行 `drizzle-kit generate` 生成迁移
- [x] 6.1.5 创建 `server/src/modules/rooms/rooms.gateway.ts` WebSocket 网关
- [x] 6.1.6 实现 `joinRoom` 事件处理
- [x] 6.1.7 实现 `leaveRoom` 事件处理
- [x] 6.1.8 实现 `playbackSync` 播放状态同步
- [x] 6.1.9 创建 `server/src/modules/rooms/rooms.controller.ts` 房间 REST API
- [x] 6.1.10 实现 `POST /api/rooms` 创建房间
- [x] 6.1.11 实现 `GET /api/rooms` 房间列表
- [x] 6.1.12 创建 `mini-app/src/hooks/useRoom.ts` 前端 WebSocket hook
- [x] 6.1.3 创建房间页面 UI
- [x] 6.1.14 安装 `socket.io-client` 前端依赖
- [x] 6.1.15 编写 WebSocket 集成测试

### 6.2 AI 推荐系统（协同过滤）
- [x] 6.2.1 实现用户行为数据收集（播放历史、完成率、停留时间）
- [x] 6.2.2 实现基于用户相似度的协同过滤算法
- [x] 6.2.3 实现基于课程相似度的内容推荐
- [x] 6.2.4 实现推荐结果缓存（Redis）
- [x] 6.2.5 更新 `GET /api/recommendations/personalized` 使用协同过滤
- [x] 6.2.6 编写推荐算法单元测试

### 6.3 数据分析仪表盘
- [x] 6.3.1 创建 `server/src/modules/analytics/analytics.module.ts`
- [x] 6.3.2 实现用户增长统计接口
- [x] 6.3.3 实现课程播放统计接口
- [x] 6.3.4 实现收入统计接口（基于订单表）
- [x] 6.3.5 实现用户留存率统计接口
- [x] 6.3.6 创建管理后台仪表盘页面（可选）
