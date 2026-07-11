# Mobile App Feature Parity

## Summary

补齐 mobile-app (React Native / Expo) 与 mini-app (Taro) 之间的功能差距，重点实现**社区功能**和**多人冥想房间**，同时修复 mini-app 社区的已知 bug 并统一双端 WebSocket 方案。

## Motivation

当前 mobile-app 缺少三个核心功能模块（社区、房间、管理后台），导致移动端用户体验不完整。经评估：

- **社区** — 用户冥想后分享感悟的核心场景，API 已就绪，移植成本低
- **多人房间** — 核心差异化功能，需要解决 WebSocket 协议统一问题
- **管理后台** — 手机端体验天然不佳，**不在本次范围内**

## Scope

### In Scope

1. **mini-app 社区 Bug 修复**（前置依赖）
   - Follow 状态从 API 获取（当前始终初始为 false）
   - 用户资料页帖子可点击跳转详情
   - 评论列表显示作者昵称

2. **社区功能 → mobile-app**（4 屏 + 1 组件）
   - `CommunityFeedScreen` — 帖子列表，发现/关注双 Tab
   - `CreatePostScreen` — 发帖（类型选择 + 内容输入）
   - `PostDetailScreen` — 帖子详情 + 评论列表 + 发评论
   - `UserProfileScreen` — 用户主页 + 关注/取消关注
   - `PostCard` 组件 — 可复用帖子卡片

3. **WebSocket 统一方案**（双端）
   - mini-app `useRoom` hook 从 raw WebSocket 改为 `socket.io-client`
   - mobile-app 新建 `useRoom` hook（基于 `socket.io-client`）
   - 确认 server gateway 兼容 `socket.io-client` 4.x

4. **多人房间 → mobile-app**
   - `RoomsListScreen` — 房间列表 + 创建房间
   - `PlayerScreen` 房间模式增强 — 加入房间后同步播放

### Out of Scope

- mobile-app 管理后台（手机端不适合）
- 社区功能的无限滚动/分页（当前全量加载）
- WebSocket 时钟偏差补偿（后续优化）
- 社区帖子图片上传（当前仅文本）

## Technical Approach

### 社区功能

复用现有 API 端点（`/api/community/*`），mobile-app 直接调用 `Network.request`。UI 使用 React Native 原生组件（ScrollView、TextInput、TouchableOpacity），不引入额外 UI 库。

导航结构：在 `RootNavigator` 的 Stack 中添加 4 个新 Screen。

### WebSocket 统一

**问题**：server 使用 NestJS `@WebSocketGateway`（底层 Socket.IO），mini-app 使用 raw `WebSocket`，二者协议不兼容。

**方案**：双端统一使用 `socket.io-client`：
- mini-app：安装 `socket.io-client`，重写 `useRoom` hook
- mobile-app：安装 `socket.io-client`，新建 `useRoom` hook
- server：无需改动（已支持 Socket.IO）

### Bug 修复

需要修改 server 端 `community.controller.ts`：
- `GET /community/users/:id` 返回 `isFollowing` 字段
- `GET /community/posts/:id/comments` 关联查询评论作者信息

## Risks

| 风险 | 影响 | 缓解 |
|------|------|------|
| socket.io-client 在小程序环境的兼容性 | 阻塞 WebSocket 统一 | 验证后再迁移 mini-app |
| 社区 API 缺少分页 | 大量帖子时性能差 | 先全量加载，后续加 pagination |
| React Native WebSocket 生命周期差异 | 房间断连问题 | 利用 AppState 监听前后台切换 |

## Dependencies

- `socket.io-client` npm 包（双端）
- server 端 community controller 小改动（isFollowing + 评论作者）
- server 端 rooms gateway 无需改动
