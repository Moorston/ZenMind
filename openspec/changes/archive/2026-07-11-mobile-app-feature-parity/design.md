## Context

mobile-app (React Native / Expo) 与 mini-app (Taro) 存在三个功能差距：社区、多人房间、管理后台。本次变更补齐前两个（管理后台不在范围内），同时修复 mini-app 社区已知 bug 并统一双端 WebSocket 方案。

当前状态：
- 后端社区 API（11 个端点）和房间 API（3 个 REST + WebSocket gateway）已就绪
- mini-app 社区有 3 个已知 bug（follow 状态、评论作者、帖子详情跳转）
- mini-app 使用 raw `WebSocket` 连接 server 的 Socket.IO gateway（协议不兼容）
- mobile-app 无社区、房间、WebSocket 相关代码

## Goals / Non-Goals

**Goals:**
- mobile-app 具备完整的社区功能（发帖、评论、点赞、关注）
- mobile-app 支持多人冥想房间（加入、播放同步）
- mini-app 社区 3 个 bug 全部修复
- 双端统一使用 `socket.io-client` 连接 WebSocket
- 新增屏幕遵循 mobile-app 现有代码风格（StyleSheet、Zustand、直接 API 调用）

**Non-Goals:**
- 不做 mobile-app 管理后台
- 不做社区帖子分页/无限滚动（当前全量加载）
- 不做 WebSocket 时钟偏差补偿
- 不做社区帖子图片上传
- 不做房间内聊天功能

## Decisions

### 1. 社区功能：直接调用 API，不建 Store

**选择**：每个屏幕内部用 `useState` + `Network.request` 直接调用 API，不创建 `useCommunityStore`。

**理由**：mini-app 的社区实现就是这种模式（每个页面独立 fetch）。社区数据的共享范围小（帖子列表和帖子详情之间不需要实时同步），引入 Zustand store 增加复杂度但无明显收益。与 mini-app 保持一致的模式也降低维护成本。

**备选方案**：创建全局 `useCommunityStore` — 否决，过度设计。

### 2. WebSocket：统一 socket.io-client 4.x

**选择**：双端统一使用 `socket.io-client@^4.7` 连接 server 的 Socket.IO gateway。

**理由**：
- server 使用 NestJS `@WebSocketGateway`（底层 Socket.IO），Socket.IO 有自己的握手协议
- mini-app 当前使用 raw `WebSocket`，在某些环境下可能碰巧工作（Taro 的 WebSocket 实现可能做了兼容），但这是不可靠的
- `socket.io-client` 支持 React Native（通过 `react-native` 引擎自动选择 WebSocket transport）
- mini-app 需要验证 `socket.io-client` 在微信小程序环境的兼容性，如不兼容则保留 raw WebSocket 仅限小程序

**备选方案**：server 改用 raw WebSocket — 否决，改动 server 网关风险更大。

### 3. 房间导航：复用 PlayerScreen 而非独立房间页面

**选择**：加入房间后导航到现有 `PlayerScreen`，通过 `roomId` 参数激活房间模式。

**理由**：mini-app 就是这种模式（`/pages/player/index?roomId=xxx`）。房间模式下的播放器 UI 与普通播放器基本一致，只是增加了参与者列表和播放同步。避免代码重复。

**备选方案**：独立的 `RoomPlayerScreen` — 否决，大量重复 PlayerScreen 代码。

### 4. mini-app 社区 Bug 修复：server 端改 + client 端改

**选择**：
- server `community.controller.ts`：`GET /users/:id` 增加 `isFollowing` 字段；`GET /posts/:id/comments` 关联查询评论作者
- mini-app `user-profile/index.tsx`：使用 API 返回的 `isFollowing`；帖子卡片加点击事件
- mini-app `post-detail/index.tsx`：评论显示作者昵称

**理由**：Bug 根因在 server 端缺少数据，client 端只是消费方。在 server 端修复后，mobile-app 实现时自然也能获得正确的数据。

## Architecture

```
mobile-app/src/
├── screens/
│   ├── CommunityFeedScreen.tsx      ← 新增
│   ├── CreatePostScreen.tsx         ← 新增
│   ├── PostDetailScreen.tsx         ← 新增
│   ├── UserProfileScreen.tsx        ← 新增
│   └── RoomsListScreen.tsx          ← 新增
├── components/
│   └── PostCard.tsx                 ← 新增
├── hooks/
│   └── useRoom.ts                   ← 新增
├── api/
│   ├── community.ts                 ← 新增
│   └── rooms.ts                     ← 新增
└── navigation/
    └── RootNavigator.tsx            ← 修改（添加新 Screen 注册）

mini-app/src/
├── hooks/
│   └── useRoom.ts                   ← 修改（WebSocket → socket.io-client）
├── pages/community/
│   ├── index.tsx                    ← 修改（follow 状态修复）
│   ├── post-detail/index.tsx        ← 修改（评论作者显示）
│   └── user-profile/index.tsx       ← 修改（帖子跳转 + isFollowing）
```
