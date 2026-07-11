## Design

### HTTP E2E 测试方案
- 使用 Test.createTestingModule 并 overrideGuard(AuthGuard) → TestAuthGuard
- 需要用 useFactory 方式创建测试 app，确保 DRIZZLE token 正确注入

### 社区前端页面
- 遵循项目规范：shadcn/ui 组件 + lucide-react-taro 图标 + Network API 调用
- PostCard 组件已创建，复用至详情页和用户主页

### 实时冥想前端
- 使用 socket.io-client 连接 WebSocket Gateway
- useRoom hook 封装 join/leave/playbackSync 逻辑
- 房间页面展示参与者列表和播放状态