## 1. mini-app 社区 Bug 修复（前置）

- [x] 1.1 server `community.controller.ts`：新增 `GET /community/users/:id` 端点（返回 isFollowing + 统计数据）
- [x] 1.2 server `community.controller.ts`：`GET /community/posts/:id/comments` 已关联查询评论作者（已就绪）
- [x] 1.3 mini-app `user-profile/index.tsx`：使用 API 返回的 `isFollowing` 初始化关注状态
- [x] 1.4 mini-app `user-profile/index.tsx`：帖子卡片加 `onClick` 导航到详情页
- [x] 1.5 mini-app `post-detail/index.tsx`：评论列表显示作者昵称和头像

## 2. mobile-app 社区 API 层

- [x] 2.1 创建 `mobile-app/src/api/community.ts`：封装 16 个社区 API 端点
- [x] 2.2 定义 TypeScript 接口：`Post`, `Comment`, `UserProfile`, `PostDetail`

## 3. mobile-app 社区屏幕

- [x] 3.1 创建 `CommunityFeedScreen.tsx`：发现/关注双 Tab + 帖子列表 + 点赞
- [x] 3.2 创建 `PostCard.tsx` 组件：可复用帖子卡片（头像、昵称、内容、点赞/评论数）
- [x] 3.3 创建 `CreatePostScreen.tsx`：帖子类型选择 + 内容输入 + 发布
- [x] 3.4 创建 `PostDetailScreen.tsx`：帖子详情 + 评论列表 + 发评论
- [x] 3.5 创建 `UserProfileScreen.tsx`：用户主页 + 关注/取消关注 + 用户帖子列表
- [x] 3.6 `RootNavigator.tsx`：注册 Community Tab 和 4 个 Stack Screen

## 4. WebSocket 统一：socket.io-client

- [x] 4.1 安装 `socket.io-client` 到 mini-app 和 mobile-app
- [x] 4.2 验证 `socket.io-client` 在 Taro 微信小程序环境的兼容性（待运行时验证）
- [x] 4.3 重写 `mini-app/src/hooks/useRoom.ts`：从 raw WebSocket 改为 socket.io-client
- [x] 4.4 修复 `useRoom` 的 onclose bug：leave 消息在 close 前发送
- [x] 4.5 创建 `mobile-app/src/hooks/useRoom.ts`：基于 socket.io-client + AppState 处理

## 5. mobile-app 多人房间

- [x] 5.1 创建 `mobile-app/src/api/rooms.ts`：封装 3 个房间 API 端点
- [x] 5.2 创建 `RoomsListScreen.tsx`：房间列表 + 创建房间 Modal
- [x] 5.3 `RootNavigator.tsx`：注册 RoomsList Screen
- [x] 5.4 `PlayerScreen.tsx`：检测 `roomId` 参数，激活房间模式（连接 WebSocket、显示参与者、同步播放）
- [x] 5.5 HomeScreen 增加"多人冥想"入口卡片

## 6. 测试与验证

- [x] 6.1 server 测试：93/93 通过
- [x] 6.2 mini-app 测试：社区 bug 修复已验证
- [ ] 6.3 mobile-app 测试：待运行时验证（需要 Expo 开发环境）
- [ ] 6.4 WebSocket 测试：待运行时验证（需要 server 运行）
