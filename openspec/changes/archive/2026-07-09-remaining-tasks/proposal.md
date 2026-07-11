## Why

承接 roadmap-design 归档后剩余的 54 项任务，完成 ZenMind 最后的质量提升和功能完善工作。

## What Changes

### 质量提升
- HTTP 层 E2E 测试（重构 NestJS 测试基础设施）
- Repository 单元测试
- 支付/会员/推荐服务测试
- Swagger 装饰器补全

### 社区前端完善
- 帖子详情+评论页面
- 发帖页面
- 用户主页（帖子+关注+粉丝）
- 社区 TabBar 入口

### 实时冥想
- 前端 useRoom WebSocket hook
- 房间页面 UI
- socket.io-client 集成

### AI 推荐增强
- 协同过滤算法
- 行为数据收集
- 推荐结果缓存

## Capabilities

### New Capabilities
- `http-e2e-tests`: HTTP 层端到端测试（绕过 AuthGuard 的完整 NestJS 测试方案）
- `community-frontend`: 社区前端完整页面（详情/发帖/用户主页）
- `realtime-frontend`: 实时冥想前端（WebSocket hook + 房间 UI）
- `ai-collaborative-filtering`: 协同过滤推荐算法

### Modified Capabilities
- `testing-infra`: 增强测试基础设施，解决 NestJS APP_GUARD 测试兼容性

## Impact

- **server/test/e2e/**: 新增 HTTP 层 E2E 测试文件
- **mini-app/src/**: 新增社区详情页、发帖页、用户主页、房间页面
- **server/src/modules/recommendations/**: 增强协同过滤算法