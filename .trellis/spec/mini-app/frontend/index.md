# Mini-App Frontend Specs

Coding guidelines for the Taro frontend (`mini-app/`).

## Stack

| Layer | Tool |
|-------|------|
| Framework | Taro 4.1.9 + React 18 |
| Styling | Tailwind CSS 4 + weapp-tailwindcss |
| State | Zustand 5 |
| UI Library | shadcn/ui-style components in `@/components/ui` (40 components) |
| Icons | lucide-react-taro |
| i18n | i18next + react-i18next (15 languages) |
| Network | Custom `Network` wrapper over Taro request APIs |

## Spec Files

- [directory-structure.md](directory-structure.md) — file layout and naming
- [component-guidelines.md](component-guidelines.md) — UI components and composition
- [state-management.md](state-management.md) — Zustand stores and data flow
- [cross-platform.md](cross-platform.md) — H5/WeChat/TikTok compatibility rules
- [network-layer.md](network-layer.md) — API calls and Network wrapper
- [type-safety.md](type-safety.md) — TypeScript patterns and DTOs
- [quality-guidelines.md](quality-guidelines.md) — forbidden patterns and linting

## Quick Reference

- Entry: `mini-app/src/app.tsx`
- Path alias: `@/` → `mini-app/src/`
- Pages: `mini-app/src/pages/<name>/index.tsx` + `index.config.ts`
- TabBar: Home, Discover, Player, Profile (PNG icons in `src/assets/tabbar/`)
- Build: `pnpm dev:web` (H5), `pnpm dev:weapp` (WeChat), `pnpm dev:tt` (TikTok)
- Lint: `pnpm lint`, `pnpm validate` (lint + tsc)
