# Type Safety

## TypeScript Configuration

- Extends `expo/tsconfig.base` with strict mode.
- Path alias: `@/*` → `src/*`.
- Type check: `pnpm --filter mobile-app tsc` (noEmit, skipLibCheck).

## Type Definitions

Frontend model types are defined in `src/store/types.ts`:

```typescript
export type MeditationCourse = {
  id: string
  title: string
  description: string
  duration: number
  category: 'beginner' | 'sleep' | 'relax' | 'focus'
  cover_url: string
  audio_url: string
  instructor: string
  level: string
  tags: string[]
}

export type WhiteNoise = {
  id: string
  name: string
  emoji: string
  color: string
  audio_url: string
}

export type CheckIn = {
  date: string
  courseId: string
  duration: number
}
```

## API Types

API response types are defined inline in `src/api/courses.ts`:

```typescript
export type Course = {
  id: string
  title: string
  description: string
  category: string
  level: string
  duration: number
  cover_url: string
  audio_url: string
  tags: string  // JSON string
  instructor?: { nickname: string }
  // ...
}
```

## DTO → Frontend Mapping

The `toMeditationCourse()` function maps API responses to frontend models. **This function is duplicated** across `HomeScreen.tsx`, `DiscoverScreen.tsx`, and `PlayerScreen.tsx`.

Anti-pattern: The mapping logic should be in a single shared utility. The category mapping is inconsistent across copies (e.g., `body-scan` maps to `'beginner'` in some places and `'sleep'` in others).

## Navigation Types

Type-safe navigation with `NativeStackNavigationProp`:

```typescript
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/RootNavigator'

type ScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>
}
```

## Known Type Issues

- `(StyleSheet as any).create` cast in `ProfileScreen.style.ts` — masks a typing issue instead of fixing it.
- `Alert.prompt` returns `string | undefined` but is used without null checks in `SettingsScreen` and `ReminderScreen`.
