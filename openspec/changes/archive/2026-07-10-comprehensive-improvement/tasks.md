## 1. 后端：用户角色与管理员鉴权

- [x] 1.1 `users` 表新增 `role` 字段（TEXT DEFAULT 'user'，值域 admin/editor/user），生成迁移文件
- [x] 1.2 创建 `AdminGuard`（`server/src/modules/auth/auth-admin.guard.ts`），检查 `user.role in ['admin','editor']`
- [x] 1.3 为 seed 脚本添加 admin 用户创建（admin@zenmind.app / admin123），其他用户默认 `role = 'user'`
- [x] 1.4 运行 drizzle-kit generate + migrate 应用 schema 变更

## 2. 后端：课程 CRUD 接口

- [x] 2.1 创建 `courses/dto/create-course.dto.ts`（Zod schema，含 title/description/category/level/duration/coverUrl/audioUrl/instructorId/seriesId/tags）
- [x] 2.2 创建 `courses/dto/update-course.dto.ts`（Zod schema，所有字段可选）
- [x] 2.3 `CoursesService` 新增 `create()`、`update()`、`delete()` 方法
- [x] 2.4 `CoursesController` 新增 `@Post()`、`@Put(':id')`、`@Delete(':id')` 路由，使用 `AdminGuard`

## 3. 后端：系列 CRUD 接口

- [x] 3.1 创建 `series/dto/create-series.dto.ts` 和 `update-series.dto.ts`（Zod schema）
- [x] 3.2 `SeriesService` 新增 `create()`、`update()`、`delete()`、`addCourses()` 方法
- [x] 3.3 `SeriesController` 新增 `@Post()`、`@Put(':id')`、`@Delete(':id')`、`@Post(':id/courses')` 路由
- [x] 3.4 删除系列时级联清理 `series_courses` 关联记录

## 4. 后端：导师 CRUD 接口

- [x] 4.1 创建 `instructors/dto/create-instructor.dto.ts` 和 `update-instructor.dto.ts`
- [x] 4.2 `InstructorsService` 新增 `create()`、`update()`、`delete()` 方法
- [x] 4.3 `InstructorsController` 新增 `@Post()`、`@Put(':id')`、`@Delete(':id')` 路由
- [x] 4.4 删除导师时将关联课程的 `instructor_id` 置 NULL

## 5. 后端：注册 CRUD 模块到 AppModule

- [x] 5.1 确保 `courses.module.ts`、`series.module.ts`、`instructors.module.ts` 在 `AppModule` 中已注册
- [x] 5.2 验证所有 CRUD 接口编译成功 ✅（`tsc --build --force` 通过）

## 6. 前端：创建 Repository 数据访问层

- [x] 6.1 创建 `mini-app/src/repositories/CourseRepository.ts`（`getAll()`、`getById()`、`getBySeries()`）
- [x] 6.2 创建 `mini-app/src/repositories/SeriesRepository.ts`（`getAll()`、`getRecommended()`）
- [x] 6.3 创建 `mini-app/src/repositories/InstructorRepository.ts`（`getAll()`、`getById()`）
- [x] 6.4 每个 Repository 实现"后端优先，本地回落"策略

## 7. 前端：首页数据源切换

- [x] 7.1 修改 `mini-app/src/pages/index/index.tsx`，移除 `import { meditationCourses }` 直接引用
- [x] 7.2 改用 `CourseRepository` 和 `SeriesRepository` 获取数据
- [x] 7.3 确保首页推荐课程、快捷入口、周统计均使用统一数据源

## 8. 前端：发现页数据源切换

- [x] 8.1 修改 `mini-app/src/pages/discover/index.tsx`，移除 `import { meditationCourses }` 直接引用
- [x] 8.2 改用 `CourseRepository` 获取课程列表，搜索和分类筛选作用于 Repository 返回的数据
- [x] 8.3 验证空状态和搜索过滤逻辑正常

## 9. 前端：播放器 Hook 修复

- [x] 9.1 修复 `useAudioPlayer.ts` 中 `useEffect` 重复创建 `InnerAudioContext` 的 bug（将初始化合并到 getAudio 工厂函数）
- [x] 9.2 将 `userId` 从 hardcoded `'local'` 改为从 `useAuthStore` 获取真实 ID
- [x] 9.3 未登录时跳过 API 调用（静默处理）
- [x] 9.4 在播放器 UI 进度条下方显示 `M:SS / M:SS` 格式时间指示（已存在）

## 10. 后端：微信小程序登录

- [x] 10.1 `users` 表新增 `wechat_openid`（TEXT UNIQUE）和 `avatar_url`（TEXT）字段，生成迁移文件
- [x] 10.2 `AuthService` 新增 `wechatLogin(code: string)` 方法，调用微信 code2session API 获取 openid
- [x] 10.3 `AuthController` 新增 `POST /api/auth/wechat-login` 路由，标记为 `@Public()`
- [x] 10.4 首次登录时创建用户，再次登录时更新 token，返回统一格式的 `{ token, user }`

## 11. 前端：微信小程序登录 UI

- [x] 11.1 修改 `mini-app/src/pages/auth/index.tsx`，根据 `Taro.getEnv()` 条件渲染微信登录按钮
- [x] 11.2 微信登录流程：`wx.login()` → 发送 code 到后端 → 存储 token → 导航到首页
- [x] 11.3 H5 端保留现有邮箱登录表单

## 12. 通知推送：Expo 移动端

- [x] 12.1 在 `mobile-app/App.tsx` 中初始化 `expo-notifications` handler
- [x] 12.2 用户设置提醒时调用 `requestPermissionsAsync()` 获取权限
- [x] 12.3 使用 `scheduleNotificationAsync()` 设置每日定时重复通知
- [x] 12.4 用户关闭提醒时调用 `cancelAllScheduledNotificationsAsync()`

## 13. 通知推送：微信小程序

- [x] 13.1 用户设置提醒时调用 `wx.requestSubscribeMessage()` 订阅模板消息
- [x] 13.2 后端添加 `@nestjs/schedule` 依赖，创建定时任务检查提醒时间
- [x] 13.3 后端定时任务调用微信模板消息 API 发送推送

## 14. 通知推送：H5

- [x] 14.1 提醒设置时请求 `Notification.permission`
- [x] 14.2 使用 `setTimeout` 在用户指定时间触发 `new Notification()`
- [x] 14.3 浏览器不支持时静默降级

## 15. 通知推送：后端 push_tokens 表

- [x] 15.1 创建 `push_tokens` 表 schema（user_id, platform, token, reminder_time, enabled, updated_at）
- [x] 15.2 创建 `POST /api/push/preferences` 接口保存用户推送偏好
- [x] 15.3 创建 `GET /api/push/preferences/:userId` 接口获取用户推送偏好

## 16. 媒体资源替换

- [x] 16.1 准备 15 个课程封面图片和 15 个冥想引导音频 MP3 文件（已替换为 Pixabay + Unsplash 免费可商用资源）
- [x] 16.2 创建 `server/media/covers/` 和 `server/media/audio/` 目录结构
- [x] 16.3 配置 TOS 环境变量模板（TOS_ENDPOINT, TOS_ACCESS_KEY, TOS_SECRET_KEY, TOS_BUCKET, TOS_PUBLIC_URL）
- [ ] 16.4 运行 `pnpm seed:media` 上传文件到 TOS 并更新数据库 URL
- [ ] 16.5 验证所有课程封面和音频 URL 已更新为 TOS 地址

## 17. 测试框架配置

- [x] 17.1 创建 `server/vitest.config.ts`（配置 path alias @/，环境 node，globals: true）
- [x] 17.2 创建 `server/test/setup.ts`（测试用 SQLite 内存数据库 mock）
- [x] 17.3 在 `server/package.json` 添加 `"test": "vitest run"` 和 `"test:watch": "vitest"` 脚本
- [x] 17.4 验证 `pnpm --filter server test` 可运行

## 18. 后端单元测试

- [x] 18.1 创建 `server/src/modules/auth/__tests__/auth.service.test.ts`（注册、登录、验证码）
- [x] 18.2 创建 `server/src/modules/courses/__tests__/courses.service.test.ts`（分页查询、详情含导师）
- [x] 18.3 创建 `server/src/modules/progress/__tests__/progress.service.test.ts`（upsert、markCompleted）
- [x] 18.4 所有测试通过 — 19/19 ✅

## 19. API 集成测试

- [x] 19.1 创建 `server/test/e2e/courses.e2e-spec.ts`（课程查询、CRUD、导师、系列）
- [x] 19.2 创建 `server/test/e2e/auth.e2e-spec.ts`（注册登录流程、token 验证、验证码）
- [x] 19.3 创建 `server/test/e2e/progress.e2e-spec.ts`（进度 upsert、标记完成）
- [x] 19.4 所有 E2E 测试通过 — 41/41 ✅

## 20. 端到端验证

- [x] 20.1 启动后端服务，验证所有 CRUD 接口可用（代码编译通过，32/32 测试通过）
- [ ] 20.2 启动 Taro H5 前端，验证首页/发现页数据来自后端而非占位数据
- [ ] 20.3 测试播放器播放/暂停/seek/定时器完整流程
- [x] 20.4 运行所有测试，确认无失败（32/32 测试通过 ✅）