# 技术债务清理 — 执行计划

## 执行顺序

### Phase 1: 基础清理 (P0-4)
- [ ] 1.1 确认 `all-exceptions.filter.ts` 未被引用，删除文件
- [ ] 1.2 确认 `tsc --noEmit` 通过

### Phase 2: 拆分长文件 (P0-2) 
- [ ] 2.1 提取 `auth.service.ts` 中的 `sendEmail` 到 `email.service.ts`
- [ ] 2.2 提取密码强度校验到 `password.validator.ts`
- [ ] 2.3 提取 OpenID 加解密到 `crypto.utils.ts`
- [ ] 2.4 运行 `vitest run src/` 验证

### Phase 3: Repository 重构 + 类型安全 (P0-1 + P0-3)
- [ ] 3.1 创建 `sessions.repository.ts`，重构 `token.service.ts`
- [ ] 3.2 重构 `analytics.service.ts` 使用 Repository
- [ ] 3.3 重构 `membership.service.ts` 使用 Repository
- [ ] 3.4 重构 `payments.service.ts` 使用 Repository
- [ ] 3.5 重构 `recommendations.service.ts` 使用 Repository
- [ ] 3.6 重构 `push-scheduler.service.ts` 使用 Repository
- [ ] 3.7 每重构一个 Service 运行一次 `vitest run src/`

### Phase 4: 消除 `as any`
- [ ] 4.1 修复 Drizzle 枚举类型相关的 `as any`
- [ ] 4.2 定义 `WechatApiResponse` 接口替代微信 API 的 `as any`
- [ ] 4.3 定义 `TemplateMessageResponse` 接口替代模板消息的 `as any`
- [ ] 4.4 其余零散 `as any` 类型修复
- [ ] 4.5 最终运行 `tsc --noEmit` 和 `vitest run src/` 验证

## 验证命令

```bash
cd server && npx tsc --noEmit
cd server && npx vitest run src/
```

## 回滚点

- Phase 1 完成后：`git add` + `git commit`
- Phase 2 完成后：`git add` + `git commit`
- 每个 Service 重构完成后：`git add` + `git commit`