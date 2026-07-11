## Why

ZenMind（尘间静）作为一款跨平台冥想应用，在架构完整性、数据一致性、用户认证、通知推送和测试覆盖等方面存在 7 个关键缺口。这些缺口阻碍了产品上线：后端缺少管理接口导致内容无法维护，前端混用占位数据导致后端改不动，播放器进度同步不完整，微信小程序缺少一键登录降低转化率，提醒功能无实际推送，媒体资源使用占位 URL，以及整个项目零测试覆盖。本次变更旨在一次性补齐这些短板，使产品达到可上线状态。

## What Changes

### 1. 后端 CRUD 接口 + 管理员鉴权
- 课程模块新增：`POST /api/courses`、`PUT /api/courses/:id`、`DELETE /api/courses/:id`
- 系列模块新增：`POST /api/series`、`PUT /api/series/:id`、`DELETE /api/series/:id`、`POST /api/series/:id/courses`（关联课程）
- 导师模块新增：`POST /api/instructors`、`PUT /api/instructors/:id`、`DELETE /api/instructors/:id`
- 新建 `AdminGuard`，`users` 表新增 `role` 字段（admin/editor/user），管理接口仅限 admin/editor 角色
- 每个接口带有 Zod Schema 输入校验

### 2. 前端后端数据层分离
- 创建 `mini-app/src/repositories/` 统一数据访问层（CourseRepository, SeriesRepository, InstructorRepository）
- 首页和发现页移除对 `meditation.ts` 硬编码数据的直接引用，改为通过 Repository 获取
- Repository 策略：后端已初始化 → 使用后端 API 数据；未初始化 → 回落本地占位数据 + 异步初始化
- 白噪音等静态数据保留在前端

### 3. Taro 播放器 Hook 修复
- 修复 `useAudioPlayer.ts` 中 `useEffect` 重复创建 `InnerAudioContext` 的 bug
- 将 `userId` 从硬编码 `'local'` 改为从 `useAuthStore` 获取真实用户 ID
- 在播放器 UI 进度条显示 `2:30 / 10:00` 格式当前时间指示

### 4. 微信小程序一键登录
- `users` 表新增 `wechat_openid` 和 `avatar_url` 字段
- 后端新增 `POST /api/auth/wechat-login` 接口（code → openid → 创建/登录用户）
- 前端根据 `Taro.getEnv() === WEAPP` 条件显示微信登录按钮
- H5 端保留现有邮箱登录，两种方式共享 users 表

### 5. 通知推送
- **微信小程序端**：使用 `wx.requestSubscribeMessage` 订阅模板消息，后端定时任务到点推送
- **Expo 移动端**：使用已安装的 `expo-notifications` 实现本地定时通知
- **H5 端**：使用 Web Notification API
- 新增 `push_tokens` 表存储用户推送偏好和 token
- 后端新增 `@nestjs/schedule` 定时任务模块

### 6. 媒体资源替换
- 准备真实冥想音频和封面文件到 `server/media/` 目录
- 配置 TOS 环境变量，运行 `pnpm seed:media` 上传到 TOS 并更新数据库 URL
- 上传成功后清理前端占位数据

### 7. 测试基础设施
- **后端单元测试**：`vitest` + 数据库 mock，覆盖 auth、courses、progress 三个核心模块
- **API 集成测试**：E2E 测试覆盖主要 API 端点
- **前端测试**：store 逻辑测试 + 组件基础测试
- 配置 `vitest.config.ts`，添加 `pnpm test` 脚本

## Capabilities

### New Capabilities
- `admin-content-api`: 后端管理员内容管理接口，含 CRUD 和角色鉴权
- `data-access-layer`: 前端统一数据访问层，实现后端数据优先、本地占位回落的策略
- `wechat-login`: 微信小程序一键登录，含后端 code2openid 和前端条件渲染
- `push-notifications`: 多端通知推送（小程序模板消息 + Expo 本地通知 + H5 Web Notification）
- `media-assets`: 真实冥想音频和封面资源，通过 TOS 分发
- `testing-infra`: 测试框架、配置、核心用例

### Modified Capabilities
- `audio-player`: 修复播放器 Hook 的 bug，完善进度同步（属于现有播放器能力的行为变更，影响 spec 粒度的播放器行为定义）

## Impact

- **后端**：`server/src/modules/*/` 下 courses、series、instructors 三个模块控制器和服务层扩展，auth 模块新增管理员守卫和微信登录，新增 `@nestjs/schedule` 依赖
- **数据库**：`users` 表新增 `role`、`wechat_openid`、`avatar_url` 字段；新增 `push_tokens` 表
- **前端 Taro**：`mini-app/src/repositories/` 新目录，首页/发现页/播放器页修改，auth 页面扩展
- **前端 Expo**：`mobile-app/` 导航和登录屏扩展，集成 expo-notifications 实际推送
- **配置**：新增环境变量 `WECHAT_APPID`、`WECHAT_SECRET`，补充 TOS 配置
- **构建**：新增 `pnpm test` 脚本，新增 `vitest` 依赖
- **媒体**：`server/media/` 目录需要准备约 30 个真实文件（15 封面 + 15 音频）