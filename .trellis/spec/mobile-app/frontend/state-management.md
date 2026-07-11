# State Management

## Zustand 5

The mobile app uses **Zustand 5** for all global state. There are 4 stores in `src/store/`.

### Store Overview

| Store | File | Persisted | Purpose |
|-------|------|-----------|---------|
| `useAuthStore` | `useAuthStore.ts` | No | Token, login state, user info |
| `useUserStore` | `useUserStore.ts` | Yes (`zenmind-user`) | Check-ins, stats, streak, preferences |
| `useCoursesStore` | `useCoursesStore.ts` | No | Courses, series, instructors from API |
| `usePlayerStore` | `usePlayerStore.ts` | No | Audio playback state (expo-av) |

### Store Pattern

Flat interface (no slices). Session-only stores use basic `create()`:

```typescript
import { create } from 'zustand'

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  token: null,
  userId: null,
  nickname: null,
  login: (params) => set({ isLoggedIn: true, ...params }),
  logout: () => set({ isLoggedIn: false, token: null, userId: null }),
}))
```

### Persisted Store: useUserStore

Uses Zustand's `persist` middleware with a custom AsyncStorage adapter:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: 'zenmind-user',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name)
        },
      },
    },
  ),
)
```

### Audio Player Store

`usePlayerStore` manages audio playback state. It uses **module-level `Audio.Sound` instances** outside the store (native objects cannot be serialized into Zustand state):

```typescript
// Module-level singletons (not in store state)
let soundInstance: Audio.Sound | null = null
let noiseInstance: Audio.Sound | null = null

export const usePlayerStore = create<PlayerState>((set, get) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  // ... actions that operate on soundInstance/noiseInstance
}))
```

Key actions: `playCourse()`, `pause()`, `resume()`, `seek()`, `setSleepTimer()`, `reset()`.

On course completion, `playCourse`'s status callback calls `useUserStore.addCheckIn()` and `CoursesAPI.completeCourse()`.

### Streak Calculation

`addCheckIn()` in `useUserStore` correctly handles:
- Same-day merging (accumulates duration for multiple sessions on one day).
- Streak counting from sorted unique dates (breaks on gap).

### Data Flow

```
API (server) → CoursesAPI → useCoursesStore → Screens
                                                ↓
                                          usePlayerStore (audio playback)
                                                ↓
                                          useUserStore (check-ins, stats)
```

### Anti-Patterns

- **Token not persisted**: `useAuthStore` has no persist middleware. Users must re-login on every app restart. This is likely a bug.
- **Split persistence**: `ReminderScreen` uses `AsyncStorage` directly instead of going through Zustand. All persistence should go through stores.
- **Duplicate `toMeditationCourse()`**: This function is copy-pasted across `HomeScreen`, `DiscoverScreen`, and `PlayerScreen`. Extract to a shared utility.
