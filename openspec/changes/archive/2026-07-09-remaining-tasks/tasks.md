## 1. 测试基础设施 (P0)

- [ ] 1.1 重构 HTTP E2E 测试框架，使用 overrideGuard + useFactory 解决 DI 问题
- [ ] 1.2 创建 HTTP 层 auth 测试（5 个关键场景）
- [ ] 1.3 创建 HTTP 层 courses 测试（5 个关键场景）
- [ ] 1.4 创建 HTTP 层 progress 测试（3 个关键场景）
- [x] 1.5 创建 Repository 单元测试（CoursesRepository, SeriesRepository, InstructorsRepository）
- [ ] 1.6 补充支付/会员/推荐服务测试

## 2. 社区前端 (P1)

- [x] 2.1 创建帖子详情+评论页面（`pages/community/post-detail/index.tsx`）
- [x] 2.2 创建发帖页面（`pages/community/create-post/index.tsx`）
- [x] 2.3 在 app.config.ts 注册社区子页面路由
- [x] 2.4 在 TabBar 添加社区入口（替换"播放"或增加第5个Tab）
- [x] 2.5 社区 i18n 文案补充（zh.json + en.json）

## 3. 实时冥想前端 (P1)

- [x] 3.1 安装 `socket.io-client` 前端依赖
- [x] 3.2 创建 `mini-app/src/hooks/useRoom.ts` WebSocket hook
- [x] 3.3 创建房间列表页面（`pages/rooms/index.tsx`）
- [x] 3.4 在 app.config.ts 注册房间路由
- [x] 3.5 实现前端播放状态同步逻辑

## 4. AI 推荐增强 (P2)

- [x] 4.1 添加用户行为数据收集（播放历史、完成率、停留时间）
- [x] 4.2 实现基于用户相似度的协同过滤算法
- [x] 4.3 实现基于课程相似度的内容推荐
- [x] 4.4 推荐结果缓存（内存 + Redis 可选）
- [x] 4.5 更新 `GET /api/recommendations/personalized` 使用协同过滤
- [x] 4.6 编写推荐算法测试

## 5. 零散任务 (P2)

- [x] 5.1 为所有 Controller 添加 Swagger `@ApiTags` 装饰器
- [x] 5.2 为 DTO 添加 `@ApiProperty` 装饰器
- [x] 5.3 login 接口配置更严格限流（3次/5分钟）
- [ ] 5.4 编写限流测试
- [ ] 5.5 编写管理接口测试