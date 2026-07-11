# 项目架构约束

> 本文档定义 ZenMind（尘间静）的系统级架构约束，面向架构决策与跨层契约。
>
> 优先级标注：**CRITICAL**（破坏性变更 / 安全相关）/ **HIGH**（核心功能流）/ **MEDIUM**（优选模式 / 演进建议）。

---

## 1. 整体架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                         ┌──────────┐                           │
│          mini-app       │ mobile-app│    ← 双前端展示层        │
│   (Taro 4 + React 18)  │ (Expo 50) │                           │
│   WeChat / H5 / TT     │  iOS / Android  │                    │
└─────────┬───────────────┴─────┬─────┘                           │
          │ HTTP (REST)         │ HTTP (REST)                     │
          ▼                     ▼                                 │
┌──────────────────────────────────────────────────────┐          │
│               server (NestJS 10)                     │ ← 应用层  │
│        auth · courses · series · progress            │          │
│        push · storage · admin                        │          │
└─────────────────────┬────────────────────────────────┘          │
                      │ Drizzle ORM                               │
                      ▼                                           │
┌──────────────────────────────────────────────────────┐          │
│          SQLite (better-sqlite3, WAL mode)           │ ← 数据层  │
│     users · courses · series · progress · push_tokens          │
└──────────────────────────────────────────────────────┘          │
┌──────────────────────────────────────────────────────┐          │
│          TOS (S3-compatible object storage)          │ ← 媒体层  │
│         音频文件 · 封面图片 · 导师头像                        │
└──────────────────────────────────────────────────────┘          │
```

| 组件 | 技术栈 | 稳定性 | CRITICAL 路径 |
|------|--------|--------|--------------|
| `mini-app/` | Taro 4 + React 18 + Zustand 5 | ✅ 已实现 | 用户流程 |
| `mobile-app/` | Expo SDK 50 + React Navigation 6 | ⚠️ 已知缺陷 | 用户流程 |
| `server/` | NestJS 10 + Drizzle ORM + SQLite | ✅ 已实现 | 所有业务流 |
| 数据库 | better-sqlite3 (WAL, FK on) | ✅ 稳定 | 数据持久化 |
| 存储 | TOS S3 (Volcengine) | ✅ 已连接 | 媒体资源 |

---

## 2. 模块依赖规则

### 2.1 NestJS 模块依赖图

```
                      ┌─────────────┐
                      │ ThrottlerModule │  ← 外部
                      └──────┬──────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         DbModule ◄── RepositoriesModule ◄── AuthModule ◄── AppModule
         (GLOBAL)    (GLOBAL)              │
              │              │              ├── AdminModule
              │              │              └── PushModule
              ▼              ▼
     ┌────────┴────────┐    │
     ▼                 ▼    ▼
StorageModule    CoursesModule ◄── SeriesModule
                      │
                      ├── InstructorsModule
                      └── ProgressModule
```

### 2.2 模块约束

| # | 约束 | 类型 | 依据 |
|---|------|------|------|
| 2.1 | **CRITICAL**: 禁止 NestJS 模块之间产生循环依赖。`@Module({ imports })` 链必须是有向无环图。 | server | `app.module.ts` |
| 2.2 | **CRITICAL**: 业务逻辑 MUST 在 Service 层实现，Controller MUST NOT 注入 `DRIZZLE` 或执行数据库操作。 | server | `quality-guidelines.md` server |
| 2.3 | **HIGH**: `DbModule` 和 `RepositoriesModule` 是全局模块（`@Global()`），它们的 provider 对所有模块可用。MUST NOT 再添加新的全局模块除非确实需要。 | server | `db.module.ts` / `repositories.module.ts` |
| 2.4 | **MEDIUM**: 仓库层（`RepositoriesModule`）与服务层存在代码重复（两者都实现了相同的 CRUD 操作）。当前活跃路径是服务层直接使用 DRIZZLE。SHOULD 选择统一模式 — 或废弃仓库层，或废弃服务层的 DRIZZLE 直连。 | server | 架构分析 |
| 2.5 | **CRITICAL**: `AuthModule` 注册了 `AuthGuard` 作为全局 `APP_GUARD`，所有路由默认需要认证。需要公开的路由 MUST 使用 `@Public()` 装饰器。 | server | `auth.module.ts` lines 12-14 |

---

## 3. 认证架构规则

| # | 约束 | 级别 | 依据 |
|---|------|------|------|
| 3.1 | **CRITICAL**: 认证使用自定义 token（非 JWT），格式 `'token_' + crypto.randomUUID()`。Token 存于 `users.token` 列。 | server | `auth-patterns.md` |
| 3.2 | **CRITICAL**: `AuthGuard` 是全局 guard，每次请求查询 `users` 表验证 token。此为性能短板 — 每个请求都有一次 DB 读操作。 | server | `auth.guard.ts` line 36 |
| 3.3 | **HIGH**: Token 无过期机制，直到被新登录替换。这是单会话模型 — 新登录会使旧 token 失效。 | server | `auth.service.ts` line 106 |
| 3.4 | **HIGH**: 管理员接口 MUST 同时使用 `AuthGuard`（全局自动应用）和 `AdminGuard`（路由级手动附加）。`AdminGuard` MUST 在 `AuthGuard` 之后执行。 | server | `auth-admin.guard.ts` |
| 3.5 | **MEDIUM**: `useAuthStore` 在 mobile-app 中未使用 `persist` 中间件。应用重启后登录状态丢失 — 用户每次必须重新登录。SHOULD 在 future 添加 persistence。 | mobile-app | `quality-guidelines.md` mobile-app |
| 3.6 | **MEDIUM**: mini-app 的 `Network.request` 未自动注入 auth token — 调用方需手动处理。SHOULD 在 future 在 Network 层统一注入。 | mini-app | `network.ts` 分析 |

---

## 4. API 设计契约

| # | 约束 | 级别 | 依据 |
|---|------|------|------|
| 4.1 | **CRITICAL**: 所有端点 MUST 返回 `{ status: 'success' \| 'error', data?, message?, errors?, meta? }` 信封。 | server | `api-response.ts` |
| 4.2 | **CRITICAL**: 所有 HTTP 状态码统一返回 200。POST 创建的 201 由 `HttpStatusInterceptor` 覆盖为 200，异常由 `AllExceptionsFilter` 封装为 200 + `status: 'error'`。 | server | `api-design.md` |
| 4.3 | **HIGH**: Controller 路径中 MUST NOT 包含 `api` 前缀（全局前缀已由 `app.setGlobalPrefix('api')` 设置）。错误示例：`@Controller('api/courses')` → 实际路由 `/api/api/courses`。 | server | `api-design.md` |
| 4.4 | **HIGH**: POST 创建端点 MUST NOT 使用 `@HttpCode(201)` 装饰器 — 已被拦截器覆盖，是死代码。 | server | `api-design.md` |
| 4.5 | **HIGH**: 前端 MUST 检查 `res.data.status` 字段判断业务成功/失败，MUST NOT 依赖 HTTP 状态码。 | mini-app, mobile-app | `api-design.md` |
| 4.6 | **MEDIUM**: 分页请求 MUST 处理 `meta` 字段（`page` / `pageSize` / `total`），前端展示完整分页状态。 | server, mini-app, mobile-app | `api-response.ts` |
| 4.7 | **MEDIUM**: 错误 SHOULD 使用 `ErrorCode` 枚举值（如 `ErrorCode.AUTH_INVALID_CREDENTIALS = 1008`），而非原始字符串。 | server | `error-codes.ts` |

---

## 5. 数据库架构约束

| # | 约束 | 级别 | 依据 |
|---|------|------|------|
| 5.1 | **CRITICAL**: ORM MUST 使用 Drizzle ORM，数据库 MUST 使用 better-sqlite3（WAL 模式，foreign_keys = ON）。 | server | `db.module.ts` / `database-guidelines.md` |
| 5.2 | **CRITICAL**: 主键 MUST 使用文本 UUID（`crypto.randomUUID()`），MUST NOT 使用自增整数。 | server | `database-guidelines.md` |
| 5.3 | **CRITICAL**: 时间戳 MUST 存储为 ISO 8601 文本字符串，MUST NOT 使用 `integer` 纪元秒。 | server | `database-guidelines.md` |
| 5.4 | **CRITICAL**: 布尔值 MUST 使用 `integer` 列（0/1），SQLite 无原生 boolean 类型。 | server | `database-guidelines.md` |
| 5.5 | **HIGH**: 枚举 MUST 存储为 `text`，在应用层验证。MUST NOT 依赖 SQLite CHECK 约束。 | server | `database-guidelines.md` |
| 5.6 | **HIGH**: JSON 数据（如 `courses.tags`）MUST 以 `JSON.stringify(array)` 存入 `text` 列，读取时 MUST 使用 `parseTags()` / `JSON.parse()`。 | server | `database-guidelines.md` |
| 5.7 | **HIGH**: 外键 MUST 使用 `.references()` 并指定 `onDelete` 行为（`'cascade'` 或 `'set null'`）。 | server | `courses.ts` / `database-guidelines.md` |
| 5.8 | **HIGH**: 已知缺陷 — `progress.user_id` 和 `push_tokens.user_id` 无外键约束，允许孤儿记录。SHOULD 在 schema 中添加 FK 约束。 | server | `quality-guidelines.md` server |
| 5.9 | **MEDIUM**: `ilike` 在 SQLite 中是语义错误的（SQLite 的 LIKE 本身对 ASCII 不区分大小写）。SHOULD 替换为 `like`。 | server | `quality-guidelines.md` server / `courses.service.ts` |
| 5.10 | **MEDIUM**: Migration 使用 Drizzle Kit 生成（`drizzle-kit generate` + `drizzle-kit migrate`），但 seed 文件也通过 `CREATE TABLE IF NOT EXISTS` 建表。SHOULD 统一 migration 流程，seed 只负责数据。 | server | `database-guidelines.md` + `seed.ts` |

---

## 6. 数据流约束

### 6.1 跨层数据映射

```
Server DB (Drizzle)     →    API (JSON)          →   Frontend Store   →   UI Layer
───────────────────────────────────────────────────────────────────────────────────
courses.category:       →  category: string      →  MeditationCourse  →  CategoryLabel
  'breathing'           →  (same)                →  .category:        →  呼吸
  'body-scan'           →                         →  'beginner'         →  入门
  'visualization'       →                         →  'sleep'            →  睡眠
  'loving-kindness'     →                         →  'relax'            →  减压
  'mindfulness'         →                         →  'focus'            →  专注

courses.tags:           →  tags: string (JSON)   →  tags: string[]    →  Badge[]
  JSON.stringify([...]) →  (raw JSON)             →  JSON.parse()      →  标签渲染

courses.level:          →  level: string         →  level: string     →  LevelBadge
  'beginner'            →  (same)                →  (same)            →  初级
  'intermediate'        →                        →                    →  中级
  'advanced'            →                        →                    →  高级
```

| # | 约束 | 级别 | 依据 |
|---|------|------|------|
| 6.1 | **CRITICAL**: `toMeditationCourse()` 映射函数 MUST 只有一个共享实现。当前在 `mini-app/src/store/meditation.ts` 中有共享实现，但在 `mobile-app` 的三个屏幕中各自重复。SHOULD 创建一个跨工作区共享 util。 | mini-app, mobile-app | `cross-layer-thinking-guide.md` |
| 6.2 | **CRITICAL**: Category 映射 MUST 在所有前端保持一致。当前 `mobile-app` 的 PlayerScreen 中 `body-scan` 被错误映射为 `'beginner'`（正确应为 `'sleep'`） — 这是一个已确认的错误。 | mobile-app | `PlayerScreen.tsx` line 45 |
| 6.3 | **HIGH**: 修改任何 category/level 常量的映射值前，MUST 搜索所有三个工作区的引用：`grep -r "body-scan" mini-app/src/ mobile-app/src/ server/src/`。 | 全局 | `cross-layer-thinking-guide.md` |
| 6.4 | **HIGH**: 前端解析 API 响应时 MUST 注意两层解包：`res.data`（HTTP 响应）→ `res.data.data`（业务数据）。 | mini-app, mobile-app | `cross-layer-thinking-guide.md` "Double Data Trap" |

### 6.2 RPC 风格端点约定

| 端点模式 | 方法 | 示例 |
|---------|------|------|
| 标准 CRUD | GET/POST/PUT/DELETE | `/api/courses`, `/api/courses/:id` |
| 状态变更 | POST (RPC) | `POST /api/progress/:userId/:courseId/complete` |
| 业务操作 | POST | `POST /api/auth/login`, `POST /api/storage/upload-url` |

---

## 7. 推送通知架构

```
                                  ┌─────────────────────────┐
                                  │   PushSchedulerService   │
                                  │   @Cron(EVERY_MINUTE)   │
                                  └──────────┬──────────────┘
                                             │
                          ┌──────────────────┼──────────────────┐
                          ▼                  ▼                  ▼
                   ┌──────────────┐   ┌──────────────┐   ┌──────────┐
                   │  mini-app    │   │  mobile-app  │   │  WeChat  │
                   │  Taro 小程序  │   │  Expo 通知    │   │ 模板消息  │
                   │  requestSub- │   │  expo-       │   │  API     │
                   │  scribeMsg   │   │  notifications│   │          │
                   └──────────────┘   └──────────────┘   └──────────┘
```

| # | 约束 | 级别 | 依据 |
|---|------|------|------|
| 7.1 | **HIGH**: 提醒调度使用 NestJS `@nestjs/schedule` + `@Cron(CronExpression.EVERY_MINUTE)`。 | server | `push-scheduler.service.ts` |
| 7.2 | **MEDIUM**: 提醒缓存每 5 分钟从 `push_tokens` 表刷新一次。缓存结构：`Map<string, CachedReminder[]>` 按 `HH:mm` 索引。 | server | `push-scheduler.service.ts` lines 34-35 |
| 7.3 | **MEDIUM**: mini-app 的 `reminder/index.tsx` 中 `tmplIds: []` 为空（第 67 行）— 需在微信公众平台配置模板消息后填入实际模板 ID。 | mini-app | `reminder/index.tsx` |
| 7.4 | **MEDIUM**: mobile-app 的 `ReminderScreen.tsx` 使用 `AsyncStorage` 直接持久化提醒设置（绕过 Zustand store），造成两个持久化层。SHOULD 统一到 store 的 persist 中间件。 | mobile-app | `ReminderScreen.tsx` lines 24-34 |
| 7.5 | **MEDIUM**: mobile-app 的 `ReminderScreen.tsx` 在第 183 行使用 `Alert.prompt`（iOS-only API），Android 上会静默失效。SHOULD 替换为跨平台方案。 | mobile-app | `quality-guidelines.md` mobile-app |

---

## 8. 存储架构

| # | 约束 | 级别 | 依据 |
|---|------|------|------|
| 8.1 | **CRITICAL**: 所有媒体文件（音频/封面/头像）MUST 存储到 TOS（S3-compatible）对象存储，或本地开发时使用 `server/media/` 目录。 | 全局 | `storage.service.ts` / `seed-media.ts` |
| 8.2 | **HIGH**: 本地开发时可通过 `seed-media.ts --local` 将媒体 URL 设置为 `http://localhost:3000/media/{filename}`，后端提供静态文件服务。 | server | `seed-media.ts` lines 65-109 / `main.ts` line 44 |
| 8.3 | **MEDIUM**: `StorageService.uploadDirectory()` 方法存在 bug — 调用了 `uploadFileSync()` 会立即抛出错误。此方法当前不可用。 | server | `quality-guidelines.md` server / `storage.service.ts` line 141 |
| 8.4 | **MEDIUM**: S3 客户端使用懒初始化模式（首次使用时创建），SHOULD 在模块初始化时创建以提前暴露配置问题。 | server | `storage.service.ts` lines 49-61 |
| 8.5 | **MEDIUM**: 媒体文件命名规范：`{entityId}.{ext}`（如 `breathing-basics.mp3`、`jingxin.jpg`），与数据库实体 ID 匹配。 | server | `seed-media.ts` |

---

## 9. 前端架构约束

### 9.1 mini-app（Taro）

| # | 约束 | 级别 | 依据 |
|---|------|------|------|
| 9.1.1 | **HIGH**: 页面注册 MUST 在 `app.config.ts` 中完成，路由路径与 `pages/` 目录结构一致。 | mini-app | `app.config.ts` |
| 9.1.2 | **HIGH**: TabBar 配置 4 个标签（首页/发现/播放/我的），运行时通过 `Taro.setTabBarItem` 动态更新 i18n 标签文本。 | mini-app | `app.tsx` lines 14-22 |
| 9.1.3 | **HIGH**: 数据获取采用"后端优先，本地降级"模式 — `CourseRepository` 优先返回 API 数据，API 不可用时回落为硬编码的 `meditationCourses`。 | mini-app | `CourseRepository.ts` |
| 9.1.4 | **MEDIUM**: `useCoursesStore.initialize()` 使用 `Promise.allSettled` 并行加载课程/系列/导师，用 `initialized` 标志保证幂等性。 | mini-app | `courses.ts` lines 71-90 |
| 9.1.5 | **MEDIUM**: 播放器 hook `use-audio-player.ts` 使用 11 个 ref 同步 store 状态到回调闭包 — 这是已知的脆弱模式。SHOULD 寻找更简洁的状态同步方式。 | mini-app | `use-audio-player.ts` 分析 |

### 9.2 mobile-app（React Native / Expo）

| # | 约束 | 级别 | 依据 |
|---|------|------|------|
| 9.2.1 | **HIGH**: 导航采用 React Navigation 6（Bottom Tabs + Native Stack），4 个 Tab 页 + 5 个 Stack 页面。导航结构见 `RootNavigator.tsx`。 | mobile-app | `RootNavigator.tsx` |
| 9.2.2 | **HIGH**: `PlayerScreen` 同时在 Tab 和 Stack 中注册 — Tab 版本无 header，Stack 版本有返回按钮。设计意图是支持 Tab 常驻播放和深度导航两种模式。 | mobile-app | `RootNavigator.tsx` |
| 9.2.3 | **MEDIUM**: 音频播放使用模块级 `Audio.Sound` 实例（native 对象无法序列化到 Zustand），`reset()` action 负责清理音频和定时器。 | mobile-app | `usePlayerStore.ts` |
| 9.2.4 | **MEDIUM**: 已知缺陷 — `HomeScreen` 和 `DiscoverScreen` 无加载状态指示器，课程列表直接显示空白或降级数据。 | mobile-app | `quality-guidelines.md` mobile-app |
| 9.2.5 | **MEDIUM**: 已知缺陷 — mobile-app 无 Error Boundary，任一屏幕崩溃会导致整个应用崩溃。 | mobile-app | `quality-guidelines.md` mobile-app |

### 9.3 数据流模式

```
mini-app:  API → Network.request → CourseAPI → useCoursesStore → Repository → Screen
                            ↓ auth token 需手动注入                   
mobile-app: API → Network.request → CoursesAPI → useCoursesStore → Screen
                            ↓ auth token 自动注入
```

| # | 约束 | 级别 | 依据 |
|---|------|------|------|
| 9.3.1 | **HIGH**: 前端状态流 MUST 遵循单向数据流：API → Store → Screen。MUST NOT 从 Screen 直接发起 API 调用绕过 Store（认证页面除外）。 | mini-app, mobile-app | `state-management.md` |
| 9.3.2 | **MEDIUM**: 打卡/进度更新通过 store actions 同步到后端 API — 在 `usePlayerStore` 中通过 `onPlaybackStatusUpdate` 回调触发，或通过 `useUserStore.addCheckIn()` 触发。 | mini-app, mobile-app | `use-audio-player.ts` / `usePlayerStore.ts` |

---

## 10. 已知架构缺陷与演进路线

| # | 缺陷 | 影响 | 优先级 | 建议方案 |
|---|------|------|--------|---------|
| 10.1 | 仓库层（Repository）与服务层（Service）重复实现相同 CRUD 逻辑。 | 双倍维护成本，bug 修复需同步修改两处 | **HIGH** | 选择统一模式：废弃仓库层或将服务层改为调用仓库层 |
| 10.2 | mobile-app `useAuthStore` 未持久化 token。 | 应用重启后用户必须重新登录 | **HIGH** | 添加 `persist` 中间件，持久化 key `'auth-storage'`（参考 mini-app） |
| 10.3 | 无统一配置管理（ConfigModule），所有 env 变量通过 `process.env` 直接读取。 | 配置分散，难以测试和管理 | **MEDIUM** | 集成 `@nestjs/config` 模块统一管理环境变量 |
| 10.4 | `mobile-app/src/api/network.ts` 硬编码 `http://localhost:3000`。 | 无法在真机和生产环境使用 | **CRITICAL** | 改为环境变量或 app.json 配置 |
| 10.5 | `mobile-app` 无 i18n 基础设施，所有 UI 文本硬编码中文。 | 无法支持多语言 | **MEDIUM** | 安装 `react-i18next`，使用与 mini-app 相同的翻译文件格式 |
| 10.6 | `toMeditationCourse()` 在 mobile-app 三个屏幕中重复，映射不一致。 | 课程分类在不同页面显示不同 | **CRITICAL** | 提取到共享 util，统一 category 映射表 |
| 10.7 | `mini-app/` 的 `Network.request` 未自动注入 auth token。 | 需要手动在每次请求中处理认证 | **MEDIUM** | 在 Network 层统一从 `useAuthStore` 读取 token 并注入 Authorization 头 |
| 10.8 | 无事务处理 — 多步操作（如删除导师+级联清空、添加课程到系列+排序计算）未使用 `db.transaction()`。 | 部分失败导致数据不一致 | **MEDIUM** | 对涉及多表写操作的方法添加 Drizzle 事务包装 |
| 10.9 | mobile-app 的 `startProgressTracking()` 函数创建空 interval（死代码）。 | 浪费定时器资源 | **LOW** | 移除该函数 |
| 10.10 | `push-tokens` 和 `progress` 表对 `user_id` 无外键约束。 | 删除用户后产生孤儿记录 | **MEDIUM** | 添加 FK 约束到 `users.id` |

---

## 附录：架构决策记录指引

新增重要架构决策时，请在 `.trellis/` 下记录 ADR：

```markdown
# ADR-{NNN}: {标题}

## 状态
[Proposed | Accepted | Deprecated | Superseded]

## 上下文
{为什么需要这个决策}

## 决策
{我们做了什么选择}

## 后果
{正面/负面影响}
```

当前项目的架构决策通过 `.trellis/spec/` 下的规范文档和本文件共同记录。新增模块或重大变更前，SHOULD 先更新相关约束文档。