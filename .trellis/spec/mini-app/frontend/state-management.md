# State Management

## Zustand 5

The mini-app uses **Zustand 5** for all global state. There are 4 stores in `src/store/`.

### Store Overview

| Store | File | Persisted | Purpose |
|-------|------|-----------|---------|
| `useAuthStore` | `auth.ts` | Yes (`auth-storage`) | Token, user info, login state |
| `useLanguageStore` | `language.ts` | Yes (`app-language`) | Language selection, i18next sync |
| `useCoursesStore` | `courses.ts` | No | Courses, series, instructors from API |
| `useUserStore` | `meditation.ts` | Yes (`meditation-user`) | Check-ins, stats, streak, preferences |
| `usePlayerStore` | `meditation.ts` | No | Current course, playback state, volume |

### Store Pattern

Flat interface (no slices). Each store is a single `create()` call:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  user: { id: string; nickname: string; email?: string } | null
  isLoggedIn: boolean
  login: (token: string, user: AuthState['user']) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoggedIn: false,
      login: (token, user) => set({ token, user, isLoggedIn: true }),
      logout: () => set({ token: null, user: null, isLoggedIn: false }),
    }),
    { name: 'auth-storage' },
  ),
)
```

### Persisted Stores

Three stores use Zustand's `persist` middleware with Taro's storage:

- `useAuthStore` → key `auth-storage`
- `useLanguageStore` → key `app-language` (with `onRehydrateStorage` callback to sync i18next)
- `useUserStore` → key `meditation-user`

Session-only stores (`useCoursesStore`, `usePlayerStore`) do not persist — they re-fetch or reinitialize on each session.

### Repository Pattern

The `src/repositories/` layer abstracts data access with an offline-first strategy:

```typescript
// CourseRepository.getAll() — returns backend data if available, local fallback otherwise
export const CourseRepository = {
  getAll: async () => {
    const store = useCoursesStore.getState()
    if (!store.initialized) store.initialize() // background fetch
    return store.courses.length > 0 ? store.courses : meditationCourses // local fallback
  },
}
```

Reference: `src/repositories/CourseRepository.ts`

### Data Flow

```
API (server) → CourseAPI → useCoursesStore → Pages
                                              ↓
                                        usePlayerStore (current playback)
                                              ↓
                                        useUserStore (check-ins, stats)
```

Pages read from stores directly via hooks. User actions (play, check-in) update stores, which may trigger API calls for persistence.

### Helper Functions in meditation.ts

`meditation.ts` also exports static data and helper functions:

- `meditationCourses` — 8 hardcoded fallback courses
- `whiteNoises` — 4 hardcoded white noise items
- `toMeditationCourse()` — maps backend `CourseDTO` to frontend `MeditationCourse`
- `getCourses()`, `getCourseById()` — helper accessors
- `getBestTime()`, `getNoiseEmoji()`, `getNoiseColor()` — display helpers

### Anti-Patterns

- Creating more than one place to fetch the same data — use `CourseRepository` or `useCoursesStore`, not both.
- Putting computed values in store state — derive them with selectors or helper functions.
- Using `useRef` + manual sync to bridge store state into callbacks (the `use-audio-player.ts` pattern with 11 refs) — this is a known workaround for stale closures, but fragile.
