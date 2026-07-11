# ZenMind 鉴权模块 Grilling Session 改进清单

## Goal

记录 grilling session 中达成共识的 20 项改进，按优先级排序，确保不遗漏任何决策。

## Grilling Session 发现的问题

### 🔴 安全类 (High Priority)

| # | 问题 | 决策 | 文件 |
|---|------|------|------|
| 1 | register 竞态条件：两个并发请求可能同时通过 email 检查 | 使用 ON CONFLICT DO NOTHING | `auth.service.ts:95` |
| 2 | OPENID_ENCRYPTION_KEY 未设置时只在运行时报错 | 启动时在 TokenService.onModuleInit() 中检查 | `crypto.utils.ts:6` |
| 3 | refreshToken 先删后建，数据库异常时用户丢失登录 | 改为先建后删 | `token.service.ts:105-109` |
| 4 | push_tokens.user_id 缺少外键约束 | 添加 `.references(() => users.id, { onDelete: 'cascade' })` | `push-tokens.ts:5` |
| 5 | logoutAll 没有将旧 token 加入黑名单 | 先查出所有 session 的 access token 加入黑名单，再删除 | `token.service.ts:152-155` |
| 6 | deletePost 没有权限检查，任何用户可删除任何帖子 | 检查 `req.user.id === post.userId \|\| req.user.role === 'admin'` | `community.controller.ts:46-50` |
| 7 | SALT 使用硬编码默认值 | 移除默认值，未设置时抛错 | `crypto.utils.ts:4` |
| 8 | 验证码日志在所有环境都打印 | 只在 `NODE_ENV === 'development'` 时打印 | `auth.service.ts:83` |
| 9 | 开发环境验证码不返回给前端 | 开发环境返回 `{ success, message, code }` | `auth.service.ts:88` |
| 10 | wechatLogin 的 fetch 没有超时 | 添加 5 秒超时 `AbortSignal.timeout(5000)` | `auth.service.ts:126` |
| 11 | sendEmail 的 sendMail 是异步但没有 await | 改为 async 方法并 await | `auth.service.ts:217` |

### 🟡 性能类 (Medium Priority)

| # | 问题 | 决策 | 文件 |
|---|------|------|------|
| 12 | scryptSync 每次调用都重新派生密钥 | 缓存派生密钥，模块加载时计算一次 | `crypto.utils.ts:14,26` |
| 13 | isTokenBlacklisted 每次请求都查数据库 | 启动时加载到内存 Map，每分钟刷新 | `token.service.ts:173-179` |
| 14 | Session 只在启动时清理，运行期间不清理 | 添加定时任务每天凌晨清理 | `auth.service.ts:148-153` |
| 15 | cleanupBlacklist 从未被调用 | 与 session 清理一起执行 | `token.service.ts:186-190` |

### 🟢 一致性类 (Low Priority)

| # | 问题 | 决策 | 文件 |
|---|------|------|------|
| 16 | login 返回的 user 缺少 role 字段 | 返回 `{ id, email, nickname, role }` | `auth.service.ts:118` |
| 17 | generateTokenPair 的 deviceInfo/ipAddress 从未使用 | 从 request 中提取真实值传入 | `token.service.ts:36` / Controller |
| 18 | register 错误格式不统一 | 统一返回 `{ error: string }` | `auth.service.ts:96,100` |
| 19 | Service 层 delete 返回值不一致 | 统一返回 boolean | `courses.service.ts:46-49` |
| 20 | findById 缺少关联查询 | Service 中关联查询 instructor 和 series | `courses.service.ts:32-36` |

## 实施顺序

1. **安全类** — 立即实施
2. **性能类** — 次优先
3. **一致性类** — 最后实施

## 约束

- 每项改动后运行 `npx vitest run src/` 确认无回归
- 不改变现有 API 响应格式（前端兼容性）
- 不引入新依赖（除非必要）