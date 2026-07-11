## Why

ZenMind 当前是一个功能完整的 MVP，但要从"能用"进化到"好用并可持续运营"，需要在架构、性能、部署、质量、新功能五个维度进行全面升级。当前代码库存在以下核心问题：

1. **架构债务**：Service 层直接操作 ORM，换数据库需改动所有模块；API 响应格式不统一
2. **性能隐患**：推送服务每分钟全表扫描、无数据库索引、无请求缓存
3. **部署空白**：无 Docker、CI/CD、日志、监控
4. **质量缺口**：AuthGuard 测试兼容性问题、无 Swagger 文档、错误处理不一致
5. **功能扩展**：缺少实时多人、AI 推荐、社区、支付等增长型功能

本次设计覆盖 7 个方向的完整技术方案，作为未来 12 个月的演进路线图。

## What Changes

### Phase 1: 架构基础 (0-3个月)
- 添加 Repository 数据访问层，解耦 Service 与 ORM
- 统一 API 响应格式 (`ApiResponse<T>`)
- 自动生成 Swagger/OpenAPI 文档
- 管理后台 API 增强 (内容管理、用户管理、数据统计)
- 数据库索引优化

### Phase 2: 部署与质量 (3-6个月)
- Docker 容器化 (server + redis)
- GitHub Actions CI/CD 流水线
- 阿里云/腾讯云部署方案
- 修复 AuthGuard 测试兼容性问题
- E2E 测试覆盖率提升至 80%
- 性能监控 (Prometheus + Grafana)

### Phase 3: 增长功能 (6-12个月)
- 实时多人冥想 (WebSocket + 房间管理)
- AI 推荐系统 (基于用户行为的规则推荐)
- 社区功能 (帖子、评论、点赞、关注)
- 微信支付集成
- 会员等级系统

## Capabilities

### New Capabilities
- `repository-layer`: 数据访问层抽象，解耦 Service 与 Drizzle ORM
- `api-standards`: 统一 API 响应格式 + Swagger 自动生成
- `admin-backend`: 管理后台 API (内容管理、用户管理、数据统计)
- `docker-deployment`: Docker 容器化 + docker-compose 编排
- `ci-cd-pipeline`: GitHub Actions CI/CD 流水线
- `database-optimization`: 索引优化 + 查询性能提升
- `realtime-meditation`: WebSocket 实时多人冥想 + 房间管理
- `ai-recommendation`: 基于用户行为的智能推荐系统
- `community-features`: 社区帖子、评论、点赞、关注系统
- `payment-integration`: 微信支付集成 + 会员等级系统
- `monitoring-observability`: 日志收集 + 性能监控 + 告警

### Modified Capabilities
- `api-error-handling`: 统一错误处理格式，从混合模式改为标准 HTTP 状态码
- `auth-system`: 增强认证系统，支持 JWT、Rate Limiting、密码策略
- `push-notifications`: 优化推送服务性能，添加推送统计

## Impact

### 受影响的代码
- **server/src/modules/**: 所有模块添加 Repository 层
- **server/src/db/schema/**: 添加索引、新增 posts/comments/likes/follows/orders 表
- **mini-app/src/**: 添加实时通信、推荐展示、社区页面
- **mobile-app/src/**: 同步 mini-app 功能
- **根目录**: 新增 Dockerfile、docker-compose.yml、.github/workflows/

### 新增依赖
- **后端**: @nestjs/swagger, @nestjs/websockets, @nestjs/schedule (已有), ioredis
- **前端**: socket.io-client, @tanstack/react-query (可选)
- **基础设施**: Docker, GitHub Actions, Redis

### 数据库变更
- 新增 6+ 张表 (posts, comments, likes, follows, orders, recommendations)
- 现有表添加索引 (push_tokens, courses, users)
- 可能迁移至 PostgreSQL (如 SQLite 并发不足)
