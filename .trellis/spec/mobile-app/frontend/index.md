# Mobile-App Frontend Specs

Coding guidelines for the Expo/React Native mobile app (`mobile-app/`).

## Stack

| Layer | Tool |
|-------|------|
| Framework | Expo SDK 50 + React Native 0.73 |
| Navigation | React Navigation 6 (bottom-tabs + native-stack) |
| State | Zustand 5 |
| Audio | expo-av |
| Notifications | expo-notifications |
| Styling | StyleSheet.create (no Tailwind) |

## Spec Files

- [directory-structure.md](directory-structure.md) — file layout and naming
- [component-guidelines.md](component-guidelines.md) — screen patterns and composition
- [state-management.md](state-management.md) — Zustand stores and data flow
- [api-layer.md](api-layer.md) — Network wrapper and API calls
- [navigation.md](navigation.md) — React Navigation setup
- [type-safety.md](type-safety.md) — TypeScript patterns
- [quality-guidelines.md](quality-guidelines.md) — known issues and anti-patterns

## Quick Reference

- Entry: `mobile-app/App.tsx`
- Path alias: `@/` → `mobile-app/src/`
- Screens: `mobile-app/src/screens/<Name>Screen.tsx`
- Navigation: `mobile-app/src/navigation/RootNavigator.tsx`
- Run: `pnpm dev:mobile` from repo root
- Build: `pnpm prebuild:mobile` then `pnpm build:mobile:ios` or `pnpm build:mobile:android`
