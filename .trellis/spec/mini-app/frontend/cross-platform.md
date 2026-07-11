# Cross-Platform Guidelines

The mini-app targets three platforms: **H5** (web), **WEAPP** (WeChat), and **TT** (TikTok). Cross-platform compatibility is a primary concern.

## Platform Detection

Use direct runtime checks — never `useState` + `useEffect` for platform detection (causes initial render errors and H5 white screen):

```typescript
// ✅ Correct
const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP

// ❌ Wrong — state delay causes incorrect initial render
const [isWeapp, setIsWeapp] = useState(false)
useEffect(() => { setIsWeapp(Taro.getEnv() === Taro.ENV_TYPE.WEAPP) }, [])
```

Reference: `src/lib/platform.ts` provides `isH5()` and `canUseDOM()` helpers.

## H5 Preset System

On H5, the app is wrapped with additional layers (reference: `src/presets/index.tsx`):

- **H5ErrorBoundary** (`h5-error-boundary.tsx`) — catches React errors, `window.error`, and `unhandledrejection`. Shows an overlay with error details and copy-to-clipboard.
- **H5Container** (`h5-container.tsx`) — adds a custom navigation bar since mini-programs have native nav bars but H5 does not.
- **PC Widescreen Adaptation** (`h5-styles.ts`) — renders the app in a 375px phone frame on screens > 769px.

On WEAPP, the `Preset` component is a passthrough — no additional wrapping.

## Known Cross-Platform Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Text wrapping/white screen | H5 renders Text as `inline` | Add `block` class to vertically stacked Text |
| Input styling broken | H5 Input is inline element | Wrap Input in View, put styles on View |
| Input + Button flex | H5 Input doesn't support flex | Wrap in View with `display: flex` on View |
| Fixed + Flex layout | Tailwind fixed+flex fails on H5 | Use `style={{ position: 'fixed', display: 'flex' }}` |
| TabBar overlap | Bottom-fixed elements hidden by TabBar | Add `bottom: 50` to fixed elements, padding to lists |
| Native components | Camera/Map/Canvas unavailable on H5 | Platform check + H5 fallback message |
| File upload H5 | H5 readFile fails | Use `Network.uploadFile(tempFilePath)` |
| H5 image upload | Service Worker intercepts blob fetch | H5: get raw File object, build FormData manually |
| WXSS opacity | WeChat doesn't support `bg-primary/20` | Use manual `.bg-primary-20` utility classes |

## Text Element Rules

All vertically arranged Text must have `block` class:

```tsx
<Text className="block text-lg font-semibold">标题</Text>
<Text className="block text-sm text-gray-500">说明</Text>
```

## Input/Textarea Rules

Must wrap in View with styles on the wrapper (H5 renders Input as inline):

```tsx
// ✅ Correct
<View className="bg-gray-50 rounded-xl px-4 py-3">
  <Input className="w-full bg-transparent" placeholder="请输入内容" />
</View>

// ❌ Wrong — H5 inline causes styling issues
<Input className="bg-gray-50 rounded-xl px-4 py-3 w-full" />
```

## Fixed + Flex Layout Rules

Must use inline styles (Tailwind fixed+flex fails on H5):

```tsx
// ✅ Correct
<View style={{
  position: 'fixed', bottom: 50, left: 0, right: 0,
  display: 'flex', flexDirection: 'row', gap: '12px',
  padding: '12px', backgroundColor: '#fff', zIndex: 100
}}>
  <View style={{ flex: 1 }}><Button>取消</Button></View>
  <View style={{ flex: 1 }}><Button>确认</Button></View>
</View>

// ❌ Wrong — Tailwind fixed+flex H5 failure
<View className="fixed bottom-0 left-0 right-0 flex flex-row gap-3 p-4">
```

## Platform-Specific Features

### Auth Page
- WEAPP: Shows WeChat one-tap login first, email form as fallback.
- H5: Shows email form directly.

Reference: `src/pages/auth/index.tsx`

### Reminder Page
- WEAPP: Uses `Taro.requestSubscribeMessage()` for template message subscription.
- H5: Uses Web `Notification` API with `setTimeout` for scheduled notifications.

Reference: `src/pages/reminder/index.tsx`

### TabBar
- PNG icons required for WEAPP (in `src/assets/tabbar/`).
- Tab bar text is dynamically updated via `Taro.setTabBarItem()` on language change (since `app.config.ts` uses hardcoded Chinese).

## Build Targets

```bash
pnpm dev:web      # H5 (Vite dev server)
pnpm dev:weapp    # WeChat mini-program (--watch)
pnpm dev:tt       # TikTok mini-program (--watch)
pnpm build:pack   # Build both weapp + tt concurrently
```
