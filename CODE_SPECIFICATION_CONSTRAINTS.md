# 项目全局代码规范约束

> 适用范围：`mini-app/` / `mobile-app/` / `server/` 三个工作区。
>
> 关键词约定：MUST（必须） / MUST NOT（禁止） / SHOULD（应该） / SHOULD NOT（不建议） / MAY（可以）。

---

## 1. 包管理器与工程规范

| # | 约束 | 适用范围 | 依据 |
|---|------|---------|------|
| 1.1 | 项目 MUST 使用 `pnpm` 作为包管理器，MUST NOT 使用 `npm` 或 `yarn`。 | 全局 | `style-guide.md` / `package.json` engine |
| 1.2 | 安装依赖 MUST 使用 `pnpm add <pkg>` 或 `pnpm add -D <pkg>`。 | 全局 | `style-guide.md` |
| 1.3 | 新增 workspace 包 MUST 在 `pnpm-workspace.yaml` 中注册。 | 全局 | `pnpm-workspace.yaml` |
| 1.4 | 根目录 `package.json` 的 `scripts` SHOULD 集中编排跨 workspace 的命令（dev/build/seed）。 | 全局 | `package.json` |
| 1.5 | 所有 workspace 共用同一个 `pnpm-lock.yaml`。MUST NOT 每个子包单独生成 lock 文件。 | 全局 | pnpm workspace 约束 |

---

## 2. 命名规范

| # | 约束 | 适用范围 | 依据 |
|---|------|---------|------|
| 2.1 | 文件名 MUST 使用 kebab-case（如 `white-noise-grid.tsx`、`use-audio-player.ts`）。 | 全局 | `style-guide.md` |
| 2.2 | React 组件名 MUST 使用 PascalCase（如 `WhiteNoiseGrid`、`SafeImage`）。 | mini-app, mobile-app | `style-guide.md` |
| 2.3 | 变量/函数名 MUST 使用 camelCase（如 `getCourseById`、`handleSubmit`）。 | 全局 | `style-guide.md` |
| 2.4 | 常量 MUST 使用 UPPER_SNAKE_CASE（如 `API_BASE_URL`、`REMINDER_KEY`）。 | 全局 | `style-guide.md` |
| 2.5 | 类型/接口名 MUST 使用 PascalCase（如 `UserInfo`、`CourseDTO`）。 | 全局 | `style-guide.md` |
| 2.6 | Zustand store MUST 使用 `use<Name>Store` 命名模式（如 `useAuthStore`、`useCoursesStore`）。 | mini-app, mobile-app | `store/` analysis |
| 2.7 | API 命名空间 MUST 使用 PascalCase（如 `CourseAPI`、`Network`）。 | 全局 | `api/courses.ts` |
| 2.8 | 锁文件 MUST 命名为 `pnpm-lock.yaml`。MUST NOT 使用 `package-lock.json`（npm）或 `yarn.lock`。 | 全局 | monorepo 约束 |

---

## 3. Git 提交规范

| # | 约束 | 适用范围 | 依据 |
|---|------|---------|------|
| 3.1 | 提交信息 MUST 遵循 Conventional Commits 格式：`<type>: <description>`。 | 全局 | `style-guide.md` |
| 3.2 | 允许的 type 值：`feat` / `fix` / `style` / `refactor` / `docs` / `test` / `chore`。 | 全局 | project convention |
| 3.3 | 提交信息 SHOULD 使用中文描述（如 `fix: 修复列表加载问题`）。 | 全局 | `style-guide.md` |
| 3.4 | 禁止直接向 `master` 分支提交代码。SHOULD 使用 feature branch + PR 模式。 | 全局 | git workflow |

---

## 4. 通用 UI 组件约束（mini-app）

| # | 约束 | 适用范围 | 依据 |
|---|------|---------|------|
| 4.1 | 通用 UI 组件 MUST 优先从 `@/components/ui/*` 导入使用，MUST NOT 使用 `@tarojs/components` 的 `View`/`Text` 手搓。 | mini-app | `style-guide.md` |
| 4.2 | 当 `@/components/ui/*` 缺少所需组件时，SHOULD 先在 `@/components/ui/` 中按现有模式补齐，然后在页面中引用。 | mini-app | `style-guide.md` |
| 4.3 | 可用的 UI 组件清单见 `mini-app/src/components/ui/`（共 40+ 个组件），使用前 MUST 先检查是否已存在。 | mini-app | `style-guide.md` |
| 4.4 | 通用组件变体 MUST 使用 `cva()`（class-variance-authority）定义，禁止在每个页面重复样式。 | mini-app | `button.tsx` / `badge.tsx` |
| 4.5 | 图标组件 MUST 通过 `color` / `size` props 控制样式，MUST NOT 使用 `className` 的 `text-*` 控制颜色。 | mini-app | `style-guide.md` / lucide 渲染原理 |

---

## 5. 样式开发规范

| # | 约束 | 适用范围 | 依据 |
|---|------|---------|------|
| 5.1 | mini-app MUST 使用 Tailwind 类名（`className`）表达样式，MUST NOT 使用 `style={{ ... }}` 或 `.css` 文件表达常规样式。 | mini-app | `style-guide.md` |
| 5.2 | mini-app 禁止使用 `w-[340px]`、`text-[14px]` 等带 `px` 的 Tailwind 任意值（跨端 `pxtransform` 破坏）。 | mini-app | `style-guide.md` |
| 5.3 | mobile-app MUST 使用 `StyleSheet.create()` 定义样式，MUST NOT 使用 Tailwind 或 CSS-in-JS。 | mobile-app | `component-guidelines.md` |
| 5.4 | mobile-app SHOULD 将 `StyleSheet.create()` 放在文件底部（内联模式），或将导出放在 `.styles.ts` 或 `.style.ts` 独立文件。 | mobile-app | `component-guidelines.md` |
| 5.5 | mobile-app MUST NOT 使用 `(StyleSheet as any).create` 强制类型转换。 | mobile-app | `ProfileScreen.style.ts` 已知问题 |

---

## 6. 图标使用规范

| # | 约束 | 适用范围 | 依据 |
|---|------|---------|------|
| 6.1 | mini-app MUST 使用 `lucide-react-taro` 图标库，通过 `color` / `size` / `strokeWidth` props 控制样式。 | mini-app | `style-guide.md` |
| 6.2 | mini-app MUST NOT 使用 `className` 的 `text-*` 或 `w-*` / `h-*` 控制图标颜色/尺寸。 | mini-app | lucide 在 Taro 中通过 Image 渲染 |
| 6.3 | mobile-app MAY 暂时使用 emoji 作为图标，但 SHOULD 在未来迁移到 `@expo/vector-icons`。 | mobile-app | `component-guidelines.md` |

---

## 7. 网络请求规范

| # | 约束 | 适用范围 | 依据 |
|---|------|---------|------|
| 7.1 | API 请求 MUST 使用 `Network.request` / `Network.uploadFile` / `Network.downloadFile` 封装，MUST NOT 直接使用 `Taro.request` / `fetch` / `XMLHttpRequest`。 | mini-app, mobile-app | `style-guide.md` / `network.ts` |
| 7.2 | 请求 URL MUST 使用相对路径（如 `/api/courses`），MUST NOT 硬编码域名或 `localhost`。 | mini-app, mobile-app | `style-guide.md` |
| 7.3 | Network 封装内部会自动拼接 `PROJECT_DOMAIN`（mini-app 编译时常量）或 base URL（mobile-app 暂硬编码）。 | mini-app, mobile-app | `mini-app/src/network.ts` / `mobile-app/src/api/network.ts` |
| 7.4 | 响应处理 MUST 检查两层嵌套：`res.data` 是 HTTP 响应体，`res.data.data` 是业务数据（信封模式）。 | mini-app, mobile-app | `style-guide.md` "Double Data Trap" |
| 7.5 | 移动端 `mobile-app/src/api/network.ts` 中的 `localhost:3000` 是已知问题，SHOULD 在未来改为环境变量配置。 | mobile-app | `mobile-app/src/api/network.ts` line 1 |
| 7.6 | mini-app MUST NOT 修改 `src/network.ts` 文件，即使遇到 tsc 类型报错。 | mini-app | `style-guide.md` |

---

## 8. 国际化规范

| # | 约束 | 适用范围 | 依据 |
|---|------|---------|------|
| 8.1 | 所有用户可见文本 MUST 使用 `t('key')` 翻译函数，MUST NOT 硬编码中文或其他语言。 | mini-app | `quality-guidelines.md` mini-app |
| 8.2 | 翻译 key MUST 按页面/模块命名空间组织（如 `home.title`、`auth.login`、`player.play`）。 | mini-app | `i18n/locales/*.json` |
| 8.3 | 支持的语言列表见 `mini-app/src/i18n/index.ts`（共 15 种），新增语言 MUST 添加完整翻译文件。 | mini-app | `i18n/index.ts` |
| 8.4 | 标题类翻译 SHOULD 在 `pages/<name>/index.config.ts` 中使用 `navigationBarTitleText` 设置。 | mini-app | app.config convention |
| 8.5 | mobile-app 暂未安装 i18n 库，UI 文本为硬编码中文。这是已知缺陷，SHOULD 在未来引入 i18n 方案。 | mobile-app | `quality-guidelines.md` mobile-app |

---

## 9. 状态管理规范

| # | 约束 | 适用范围 | 依据 |
|---|------|---------|------|
| 9.1 | 全局状态 MUST 使用 Zustand 5 管理，MUST NOT 使用 Redux 或其他状态库。 | mini-app, mobile-app | `state-management.md` |
| 9.2 | Store 接口 MUST 使用扁平结构（无 slice 模式），单一 `create()` 调用。 | mini-app, mobile-app | `state-management.md` |
| 9.3 | 需要持久化的数据 MUST 使用 `persist` 中间件 + `AsyncStorage`（Taro storage / React Native AsyncStorage）。 | mini-app, mobile-app | `useAuthStore` / `useUserStore` |
| 9.4 | 不需要持久化的数据（如课程列表、播放器状态）MUST NOT 使用 `persist`。 | mini-app, mobile-app | `useCoursesStore` / `usePlayerStore` |
| 9.5 | 禁止多个位置获取同一份数据 — 统一通过 Store 或 Repository 访问，MUST NOT 在不同屏幕分别 fetch。 | mini-app, mobile-app | `state-management.md` anti-patterns |
| 9.6 | 计算值 SHOULD 使用 `useMemo` 或 selector 派生，MUST NOT 存入 store state。 | mini-app, mobile-app | `state-management.md` |
| 9.7 | `usePlayerStore` 在 `meditation.ts` 中的模块级变量（`audioRef` / `whiteNoiseRef` / `sleepTimerRef`）是已知模式，但用于音频实例的模块级变量需谨慎管理清理。 | mini-app, mobile-app | `use-audio-player.ts` / `usePlayerStore.ts` |

---

## 10. 数据映射规范

| # | 约束 | 适用范围 | 依据 |
|---|------|---------|------|
| 10.1 | `toMeditationCourse()` 函数 MUST 有唯一共享定义，MUST NOT 在多个屏幕中重复实现。 | mini-app, mobile-app | `mini-app/src/store/meditation.ts` 第 353 行 |
| 10.2 | API `CourseDTO` 与前端 `MeditationCourse` 之间的 category 映射 MUST 保持一致。 | mini-app, mobile-app | `cross-layer-thinking-guide.md` |
| 10.3 | 当前映射表：`breathing→beginner` / `body-scan→sleep` / `visualization→relax` / `loving-kindness→relax` / `mindfulness→focus`。MUST NOT 产生不一致的映射。 | mini-app, mobile-app | `store/constants.ts` |
| 10.4 | `courses.tags` 在 DB 中存储为 JSON 字符串，读取时 MUST 调用 `parseTags()` / `JSON.parse()` 解析为数组。 | 全局 | `database-guidelines.md` |
| 10.5 | 修改 category 映射前 MUST 先执行 `grep -r "body-scan" mini-app/src/ mobile-app/src/ server/src/` 搜索所有引用点。 | 全局 | `cross-layer-thinking-guide.md` pre-modification rule |

---

## 11. 错误处理规范

| # | 约束 | 适用范围 | 依据 |
|---|------|---------|------|
| 11.1 | 服务端所有端点 MUST 返回统一的 `{ status, data?, message?, errors?, meta? }` 信封格式。 | server | `api-response.ts` |
| 11.2 | Controller MUST 使用 `success()` 和 `error()` 辅助函数构造响应。 | server | `api-response.ts` |
| 11.3 | 所有 HTTP 状态码统一为 200（POST 创建和错误响应也返回 200），由 `HttpStatusInterceptor` 和 `AllExceptionsFilter` 处理。 | server | `api-design.md` |
| 11.4 | 错误 SHOULD 使用 `ErrorCode` 枚举（如 `ErrorCode.COURSE_NOT_FOUND`），而不是原始字符串。 | server | `error-codes.ts` |
| 11.5 | Controller 方法边界 MUST 使用 `safeParse()`（Zod）或明确参数检查，MUST NOT 在 Controller 中注入 `DRIZZLE` 直接操作数据库。 | server | `quality-guidelines.md` server |
| 11.6 | 前端 MUST 检查 `res.data.status` 字段（而非 HTTP 状态码）来判断请求成功与否。 | mini-app, mobile-app | `api-design.md` |
| 11.7 | 前端网络请求 MUST 包含错误处理（try/catch 或 .catch），对用户展示友好提示。 | mini-app, mobile-app | 各 screen 文件模式 |

---

## 12. 测试规范

| # | 约束 | 适用范围 | 依据 |
|---|------|---------|------|
| 12.1 | server 单元测试 MUST 使用 Vitest，测试文件 MUST 放在 `__tests__/` 目录中，命名 `<name>.service.test.ts`。 | server | `vitest.config.ts` / `quality-guidelines.md` |
| 12.2 | server 集成测试 MUST 使用 `createTestDb()`（内存 SQLite）进行隔离测试。 | server | `test/setup.ts` |
| 12.3 | server 目前有 3 个 E2E 测试文件和 3 个单元测试文件，新增模块 SHOULD 提供对应测试。 | server | `test/e2e/` / `__tests__/` |
| 12.4 | mini-app 和 mobile-app 目前无测试套件，此为已知缺陷。SHOULD 在未来引入测试框架。 | mini-app, mobile-app | `quality-guidelines.md` |

---

## 13. 资源管理规范

| # | 约束 | 适用范围 | 依据 |
|---|------|---------|------|
| 13.1 | 图片、音频等静态资源 MUST 通过 TOS 对象存储管理，代码中使用 TOS 返回的 URL。 | 全局 | `style-guide.md` |
| 13.2 | TabBar 图标（PNG）允许放在 `mini-app/src/assets/tabbar/` 下（微信小程序强制要求）。 | mini-app | `style-guide.md` |
| 13.3 | 禁止使用 `https://via.placeholder.com/` 等占位符服务。 | 全局 | `style-guide.md` |
| 13.4 | 禁止使用 `/images/placeholder.jpg` 等虚构路径。 | 全局 | `style-guide.md` |
| 13.5 | 本地开发使用 `server/media/` 目录 + `seed-media.ts --local` 模式。 | server | `seed-media.ts` / `main.ts` line 42 |
| 13.6 | 开发环境下后端提供 `http://localhost:3000/media/*` 静态文件服务（1 天缓存）。 | server | `main.ts` line 44 |

---

## 14. 跨平台兼容规范（mini-app Taro）

| # | 约束 | 适用范围 | 依据 |
|---|------|---------|------|
| 14.1 | 平台检测 MUST 使用 `Taro.getEnv()` 直接判断，MUST NOT 使用 `useState` + `useEffect` 延迟设置。 | mini-app | `style-guide.md` |
| 14.2 | 垂直排列的 `<Text>` 元素 MUST 添加 `block` 类名（H5 端 inline 会白屏）。 | mini-app | `style-guide.md` |
| 14.3 | `<Input>` / `<Textarea>` MUST 用 `<View>` 包裹，样式放在外层 View 上（H5 端 Input 是 inline 元素）。 | mini-app | `style-guide.md` |
| 14.4 | `<Input>` + `<Button>` flex 布局 MUST 使用 `<View>` 容器 + `inline style`，flex 放在 View 上。 | mini-app | `style-guide.md` |
| 14.5 | `fixed` + `flex` 布局 MUST 使用 `inline style`（Tailwind fixed+flex 在 H5 失效），且 `bottom` MUST 避开 TabBar（`bottom: 50px+`）。 | mini-app | `style-guide.md` |
| 14.6 | 原生组件（Camera / Map / Canvas / RecorderManager）MUST 检测平台 + H5 降级方案。 | mini-app | `style-guide.md` |

---

## 15. 安全规范

| # | 约束 | 适用范围 | 依据 |
|---|------|---------|------|
| 15.1 | 密码 MUST 使用 `bcryptjs` 加盐哈希存储，MUST NOT 存储明文密码。 | server | `auth.service.ts` line 75 |
| 15.2 | Token MUST 使用 `'token_' + crypto.randomUUID()` 格式，MUST NOT 使用 JWT（本项目约定）。 | server | `auth-patterns.md` |
| 15.3 | 认证 guard 是全局的（`AuthGuard`），需要公开的路由 MUST 显式使用 `@Public()` 装饰器。 | server | `auth.guard.ts` line 22 |
| 15.4 | 管理员接口 MUST 同时使用 `@Admin()` 装饰器和 `AdminGuard`。 | server | `auth-admin.guard.ts` |
| 15.5 | 用户角色 MUST 为 `'user'` / `'editor'` / `'admin'` 之一。 | server | `users.ts` schema |
| 15.6 | 微信登录用户在 `password` 字段存空字符串 — 这是安全的设计（bcrypt 比较安全地返回 false），但 SHOULD 在未来明确标记 WeChat-only 用户。 | server | `auth.service.ts` line 197 |
| 15.7 | API 路由前缀 MUST NOT 在 `@Controller('api/...')` 中重复添加 `/api`（全局前缀已设置）。 | server | `api-design.md` |
| 15.8 | 生产环境 CORS MUST 限制为 `ALLOWED_ORIGINS` 环境变量中配置的域名列表。 | server | `main.ts` line 26 |
| 15.9 | mini-app auth token 未自动注入到 `Network.request` 请求头中 — 调用者 MUST 手动处理（已知缺陷）。 | mini-app | `network.ts` 分析 |

---

## 附录 A：引用文件索引

| 工作区 | 关键路径 | 用途 |
|--------|---------|------|
| 全局 | `package.json` | 工作区编排、scripts |
| 全局 | `pnpm-workspace.yaml` | 工作区注册 |
| 全局 | `style-guide.md` | 主规范文档 |
| mini-app | `src/components/ui/*` | UI 组件库 |
| mini-app | `src/network.ts` | 网络封装 |
| mini-app | `src/store/*` | 状态管理 |
| mini-app | `src/i18n/*` | 国际化 |
| mobile-app | `src/api/network.ts` | 网络封装 |
| mobile-app | `src/navigation/RootNavigator.tsx` | 导航架构 |
| server | `src/main.ts` | 应用入口 |
| server | `src/modules/auth/` | 认证系统 |
| server | `src/common/api-response.ts` | 响应信封 |
| server | `src/common/error-codes.ts` | 错误码 |
| server | `src/db/schema/` | 数据库模式 |