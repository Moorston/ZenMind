# 技术债务清理 — 设计文档

## P0-1: Service 改用 Repository

### 当前状态
6 个 Service 直接注入 `DRIZZLE` 操作数据库。

### 目标状态
所有 Service 通过 Repository 操作数据库。

### 迁移顺序
1. `token.service.ts` → 已有 SessionsRepository（需创建）
2. `analytics.service.ts` → 使用现有 Repository
3. `membership.service.ts` → 使用现有 Repository
4. `payments.service.ts` → 使用现有 Repository
5. `recommendations.service.ts` → 使用现有 Repository
6. `push-scheduler.service.ts` → 使用现有 Repository

### 新增 Repository 文件
- `server/src/repositories/sessions.repository.ts` — TokenService 专用

## P0-2: 拆分长文件

### `token.service.ts` (230行)
- 保持原样（Token 生成/验证/刷新是同一职责的不同方面）
- 提取 `JwtPayload` 和 `TokenPair` 接口到独立文件 `src/modules/auth/token.types.ts`

### `auth.service.ts` (308行)
- 提取 `sendEmail` 到 `email.service.ts`
- 提取密码强度校验到 `password.validator.ts`
- 提取 OpenID 加密/解密到 `crypto.utils.ts`

## P0-3: 消除 `as any`

### 策略
1. Drizzle 枚举类型 → 使用 `as const` 断言
2. 动态数据 → 定义接口 `WechatApiResponse`、`TemplateMessageResponse`
3. 服务层数据传递 → 使用明确的泛型参数

## P0-4: 清理死代码

### `all-exceptions.filter.ts`
- 确认未被任何模块引用
- 删除文件
- 更新 import

## 风险与回滚

- 每个 Service 重构独立可回滚
- 重构后运行 `vitest run src/` 验证
- `as any` 消除后运行 `tsc --noEmit` 验证