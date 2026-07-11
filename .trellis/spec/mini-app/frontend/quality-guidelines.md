# Quality Guidelines

## Linting

- ESLint with `eslint-config-taro`, `react`, `react-hooks`, and `tailwindcss` plugins.
- Config: `mini-app/eslint.config.mjs`.
- Run: `pnpm lint` (warnings allowed) or `pnpm lint:build` (`--max-warnings=0`).
- Auto-fix: `pnpm lint:fix`.

## Type Checking

```bash
pnpm --filter mini-app tsc    # TypeScript noEmit check
pnpm validate                 # Concurrent lint:build + tsc
```

## Required Patterns

| Pattern | Rule |
|---------|------|
| UI components | Use `@/components/ui/*` — never hand-craft with View/Text |
| Styling | Tailwind classes via `className` — not inline `style` |
| Network | Use `Network.request` — not `Taro.request` |
| Platform detection | Direct `Taro.getEnv()` — not useState + useEffect |
| Path alias | Use `@/` — not relative `../../` |
| i18n | Use `t('key')` for user-visible strings — not hardcoded Chinese |
| Text wrapping | Add `block` class to vertically stacked Text elements |
| Input styling | Wrap Input in View — put styles on the wrapper |
| Icons | Use `color`/`size` props on lucide icons — not `className` for coloring |

## Forbidden Patterns

| Pattern | Why |
|---------|-----|
| `w-[340px]`, `text-[14px]` | Hardcoded px breaks cross-platform (pxtransform) |
| `style={{ fontSize: '14px' }}` | Same as above — use Tailwind tokens |
| `Taro.request(...)` directly | Bypasses URL prefix and Network wrapper |
| `process.env` for platform | Use `Taro.getEnv()` |
| `className="text-red-500"` on icons | Doesn't affect SVG stroke — use `color` prop |
| Placeholder URLs (`example.com`, `placeholder.com`) | Use real TOS URLs or skip |
| `@tarojs/components` for common UI | Use `@/components/ui/*` instead |
| Hardcoded domain in URLs | Use relative `/api/...` paths |

## Testing

There is **no test suite** for the mini-app. Do not fabricate test commands. If asked to "run tests", clarify with the user.

## Known Issues

1. **i18n keys for courses are unused**: `en.json` defines `course.breathingBasics.title` etc., but `meditation.ts` hardcodes Chinese strings. Course titles are never actually translated.
2. **Hardcoded Chinese in `getBestTime()` and `DISPLAY_CATEGORY_NAMES`**: Uses `try { return i18n.t(...) } catch { return label }` — fragile try/catch for control flow.
3. **`getCourseProgress` stub**: Always returns `null` — incomplete feature.
4. **Duplicate `toMeditationCourse()` logic**: Exists in `meditation.ts` and is also inlined in `use-audio-player.ts`. Import from `meditation.ts` instead.
5. **Dark mode toggle has no effect**: `:root` and `.dark` CSS blocks have identical color values.
6. **`usePersistedState` hook**: Defined inline in `settings/index.tsx` instead of in `lib/hooks/` for reuse.
7. **Slider 100ms delay**: Uses `setTimeout` for layout measurement — a race condition on slow devices.
