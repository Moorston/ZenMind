# ZenMind - 尘间静
一款主打正念静心、情绪舒缓、睡前助眠的轻治愈微信冥想小程序。
汇聚自然白噪音、呼吸引导冥想、场景化静心课程、日常正念打卡等核心功能，
无需逃离烟火日常，利用碎片化时间放空思绪，消解焦虑内耗，安抚浮躁心绪。
项目采用前后端分离架构，小程序端轻量化交互，后端提供完整内容接口、用户数据、冥想课程管理服务，开箱即用，有编程能力可自行二次开发定制。

基于 Taro 4 + NestJS + Expo 的冥想 App，支持 H5 / 微信小程序 / Android / iOS 多端。

## 技术栈

| 类别 | 技术 |
|------|------|
| **前端框架** | Taro 4.1.9 + React 18 |
| **移动端** | Expo SDK 50 + React Native 0.73 |
| **后端** | NestJS 10 + Express 5 |
| **数据库** | SQLite (Drizzle ORM + better-sqlite3) |
| **样式** | Tailwind CSS 4 + weapp-tailwindcss |
| **状态管理** | Zustand 5 |
| **图标** | lucide-react-taro |
| **包管理** | pnpm 9 (monorepo) |
| **语言** | TypeScript |

## 项目结构

```
ZenMind/
├── package.json              # 根工作空间编排
├── pnpm-workspace.yaml       # 工作空间定义
├── style-guide.md                 # 开发规范
│
├── mini-app/                 # 前端 (Taro 4 + React)
│   ├── src/
│   │   ├── pages/            # 8 个页面
│   │   │   ├── index/        # 首页
│   │   │   ├── discover/     # 发现
│   │   │   ├── player/       # 播放器
│   │   │   ├── profile/      # 我的
│   │   │   ├── quiz/         # 偏好测试
│   │   │   ├── stats/        # 数据统计
│   │   │   ├── settings/     # 设置
│   │   │   └── reminder/     # 每日提醒
│   │   ├── components/ui/    # 45+ shadcn/ui 组件
│   │   ├── store/            # Zustand 状态管理
│   │   ├── api/              # 后端 API 封装
│   │   ├── presets/          # H5 兼容层
│   │   ├── lib/              # 工具函数
│   │   ├── app.tsx           # 应用入口
│   │   ├── app.config.ts     # 路由配置
│   │   └── network.ts        # 网络请求封装
│   ├── config/               # Taro 构建配置
│   └── package.json
│
├── mobile-app/               # 移动端 (Expo + React Native)
│   ├── src/
│   │   ├── screens/          # 8 个屏幕页面
│   │   ├── navigation/       # 底部 Tab + Stack 导航
│   │   ├── api/              # 后端 API 封装
│   │   └── store/            # Zustand 状态管理
│   ├── App.tsx               # 应用入口
│   ├── app.json              # Expo 配置
│   └── package.json
│
└── server/                   # 后端 (NestJS + Drizzle)
    ├── src/
    │   ├── db/schema/        # 5 张数据表定义
    │   ├── modules/          # 6 个业务模块
    │   │   ├── courses/      # 课程
    │   │   ├── series/       # 系列
    │   │   ├── instructors/  # 导师
    │   │   ├── progress/     # 用户进度
    │   │   ├── storage/      # TOS 文件存储
    │   │   └── db/           # 数据库连接
    │   ├── main.ts           # 服务入口
    │   └── app.module.ts     # 根模块
    └── package.json
```

## 数据库表关系

```
instructors 1 ── N courses N ── N series
                  │
                  │  progress (userId + courseId 联合主键)
```

数据表：`courses` | `series` | `series_courses` | `instructors` | `progress`

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 本地开发

```bash
# 同时启动前端 H5 + 后端
pnpm dev

# 单独启动
pnpm dev:web        # H5 前端 (端口 5000)
pnpm dev:server     # 后端 API (端口 3000)
pnpm dev:mobile     # Expo 移动端
```

### 构建

```bash
pnpm build

# 单独构建
pnpm build:web      # H5 → dist-web
pnpm build:server   # 后端 → server/dist
```

### 数据库初始化

```bash
cd server
npx drizzle-kit generate   # 生成迁移
npx drizzle-kit migrate    # 执行迁移
pnpm seed                  # 填充初始数据
cd ..
```

### 移动端开发 (Android / iOS)

```bash
pnpm dev:mobile     # 启动 Expo 开发服务器

# 按 i 打开 iOS 模拟器，按 a 打开 Android 模拟器
# 或在真机安装 Expo Go 扫码调试

# 构建原生应用
pnpm prebuild:mobile              # 生成 ios/android 原生项目
pnpm build:mobile:ios             # 构建 iOS
pnpm build:mobile:android         # 构建 Android
```

## API 端点一览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/courses` | 课程列表（分页、筛选） |
| GET | `/api/courses/:id` | 课程详情 |
| GET | `/api/courses/series/:seriesId` | 系列下课程 |
| GET | `/api/series` | 所有系列 |
| GET | `/api/series/recommended` | 推荐系列 |
| GET | `/api/series/:id` | 系列详情 |
| GET | `/api/instructors` | 所有导师 |
| GET | `/api/instructors/:id` | 导师详情 |
| GET | `/api/progress/:userId` | 用户进度列表 |
| GET | `/api/progress/:userId/:courseId` | 单个课程进度 |
| PUT | `/api/progress/:userId/:courseId` | 更新进度 |
| POST | `/api/progress/:userId/:courseId/complete` | 标记完成 |
| POST | `/api/storage/upload-url` | 获取文件上传 URL |

## 前端核心规范

### 组件库优先

所有通用 UI 组件优先使用 `@/components/ui`：

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
```

### 图标使用

```tsx
import { House, Settings } from 'lucide-react-taro'

<House size={24} color="#7c6aef" />
```

### 样式开发

默认使用 Tailwind，禁止硬编码 `px` 值：

```tsx
// ✅ 正确
<View className="flex flex-col p-4 bg-gray-100">

// ❌ 禁止
<View className="w-[340px] p-[16px]">
```

### 网络请求

```typescript
import { Network } from '@/network'

const data = await Network.request({ url: '/api/courses' })
```

## 跨端兼容规则

- 平台检测直接判断 (`const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP`)
- 原生 `Text` 组件添加 `block` 类
- `Input` / `Textarea` 用 `View` 包裹，样式放外层
- Fixed + Flex 布局使用 `inline style`
- 底部固定元素添加 `bottom: 50` 避开 TabBar
