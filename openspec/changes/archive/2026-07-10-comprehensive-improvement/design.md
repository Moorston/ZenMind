## Context

ZenMind 是一个 pnpm monorepo，包含三个子包（server/mini-app/mobile-app），后端使用 NestJS 10 + Drizzle ORM + SQLite，前端使用 Taro 4 + Zustand 和 Expo SDK 50。当前项目处于开发中期，已具备核心功能但存在 7 个关键的架构/功能缺口（详见 proposal.md）。本次变更涉及后端、前端 Taro、前端 Expo 三个包，以及数据库 schema 变更、新增依赖和配置。

## Goals / Non-Goals

**Goals:**
- 后端课程/系列/导师模块具备完整的 CRUD 能力，并受角色鉴权保护
- 前端 Taro 版所有页面统一从后端 API 获取数据，本地占位数据仅作为回落
- 修复 Taro 播放器 Hook 的 bug，完善进度同步到后端
- 微信小程序支持一键登录，与现有邮箱登录共存
- 三端（小程序/Expo/H5）具备实际的通知推送能力
- 15 个课程的真实音频和封面替换 SoundHelix/Unsplash 占位
- 项目具备可运行的测试框架和核心用例

**Non-Goals:**
- 不涉及后端管理后台 UI（仅 API 层面，UI 可后续单独开发）
- 不涉及微信小程序支付/会员体系
- 不涉及实时多人冥想功能
- 不涉及第三方登录（微信之外的其他社交登录）
- 测试不追求 100% 覆盖率，仅覆盖核心业务逻辑

## Decisions

### 1. 角色鉴权设计：AdminGuard 而非 RBAC 框架

**选择**：在现有 `AuthGuard` 基础上扩展 `AdminGuard`，检查 `user.role` 字段。

**理由**：项目仅需简单 admin/editor/user 三级角色，无需引入 Casbin 等 RBAC 框架。`AuthGuard` 已实现 token 验证，`AdminGuard` 只需继承后加角色检查，改动最小。角色硬编码在 `users` 表 `role` 字段，通过 seed 脚本或手动 SQL 设置。

**备选方案**：引入 `@nestjs/casbin` — 否决，为三个角色引入框架过重。

### 2. 数据访问层：Repository 模式而非完全的 API 优先

**选择**：创建 `mini-app/src/repositories/` 目录，每个 Repository 封装"后端优先，本地回落"策略。

**理由**：后端 API 在开发/演示环境中可能不可用，Repository 层提供优雅降级。与现存 `useCoursesStore` 的 `initialize()` 逻辑兼容，只是将策略从 store 提升到独立的 Repository 层，职责更清晰。

**备选方案**：直接移除占位数据，强制后端可用 — 否决，开发环境需要灵活回落。

### 3. 播放器 bug 修复：删除重复的 InnerAudioContext 创建

**选择**：删除 `useAudioPlayer.ts` 第 187-256 行的 `useEffect`，将其初始化逻辑合并到 `getAudio()` 工厂函数中。

**理由**：当前代码在 `useEffect` 中又创建了一次 `Taro.createInnerAudioContext()`，覆盖了 `getAudio()` 创建的实例，导致初始化和事件绑定混乱。合并后音频生命周期由单一来源管理。

### 4. 微信登录：后端 code2openid + 前端条件渲染

**选择**：后端新增 `POST /api/auth/wechat-login`，前端通过 `Taro.getEnv()` 检测平台，条件渲染微信登录按钮。

**理由**：微信小程序 wx.login() 返回的 code 必须在后端换取 openid（appsecret 不可暴露前端）。`users` 表新增 `wechat_openid` 字段，与邮箱登录共享同一张表，用户可绑定两种方式。

### 5. 通知推送：分端实现，不做统一推送中心

**选择**：三端各自实现推送，不建立统一的后端推送中心。

**理由**：
- 微信小程序：模板消息必须在微信端配置，无需后端推送
- Expo 移动端：`expo-notifications` 已安装，只需补全调用代码
- H5 端：Web Notification API 最简单，浏览器原生支持
- 后端仅提供 `push_tokens` 表存储用户偏好，不做推送网关

**备选方案**：接入 Firebase Cloud Messaging / 阿里云推送 — 否决，对当前项目阶段过重。

### 6. 测试框架：vitest 而非 Jest

**选择**：使用 vitest 作为测试框架。

**理由**：vitest 与 TypeScript 原生兼容，与 NestJS 的 tsconfig paths 集成良好，速度比 Jest 快，且 API 与 Jest 兼容。后端无需 jsdom 环境，原生 node 环境即可。

### 7. 媒体资源：TOS 上传 + 数据库更新

**选择**：使用现有的 `seed-media.ts` 脚本，将本地 `server/media/` 文件上传到 TOS 并更新数据库。

**理由**：`seed-media.ts` 已实现完整的遍历→上传→更新数据库逻辑，无需重写。只需配置 TOS 环境变量和准备媒体文件。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 微信小程序模板消息需微信审核 | 先实现代码逻辑，模板消息审核是外部依赖 |
| 播放器修复可能影响现有播放功能 | 在 QA 环境中完整测试播放/暂停/seek/定时器流程 |
| 数据层迁移后首页可能短暂显示空数据 | Repository 层确保后端不可用时立即回落占位数据，用户无感知 |
| 微信登录需 appid/secret 配置，首次部署需配置 | 文档化环境变量清单，添加缺失时的友好错误提示 |
| 测试覆盖可能遗漏边缘情况 | 先覆盖核心路径（happy path + 常见错误），后续迭代补充 |

## Migration Plan

### 执行顺序

```
Phase 1 — 基础设施 (P0，并行执行)
├── #1a 后端: users 表新增 role 字段 + AdminGuard
├── #1b 后端: courses/series/instructors CRUD 接口
├── #7 测试: vitest 配置 + 核心用例
├── #3 前端: 播放器 Hook 修复
└── #6 媒体: 准备文件 + 配置 TOS + seed:media

Phase 2 — 数据层与用户 (P1)
├── #2 前端: repositories/ 目录 + 页面改造
└── #4 微信登录: 后端接口 + 前端 UI

Phase 3 — 推送与收尾 (P2)
├── #5 通知推送: 三端实现
└── #7 测试: 补充 E2E + 前端测试
```

### 回滚策略

- 数据库 schema 变更（users 表新增字段）使用 `ALTER TABLE` 非破坏性变更，可回滚
- 新增的 API 路由不会影响现有路由
- 前端数据层改造保持向后兼容（占位数据回落）
- 每个子任务独立可回滚，无需整体回滚

## Open Questions

- 微信小程序模板消息的模板 ID 能否在开发阶段使用测试模板？
- 是否需要为管理后台准备一个简单的管理页面（如仅 admin 可见的入口），还是纯 API 即可？
- mobile-app 端是否需要微信登录（Android/iOS 微信登录依赖微信开放平台）？
- 第一轮测试的具体覆盖范围是否需要调整？