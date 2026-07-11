# Directory Structure

## Source Layout

```
mini-app/src/
  app.tsx               # Root component (splash screen, language sync, preset wrapper)
  app.config.ts         # Taro page routes and tabBar config
  app.css               # Design system: CSS variables, dark theme, Tailwind config
  network.ts            # Network wrapper (request/uploadFile/downloadFile)
  index.html            # H5 entry HTML
  api/
    courses.ts          # CourseAPI namespace — all REST endpoint calls
  assets/
    tabbar/             # TabBar PNG icons (home, discover, play, user + active variants)
  components/
    menu-item.tsx       # Reusable list menu item
    selectable-card.tsx  # Selection card with check state
    white-noise-grid.tsx # White noise grid display
    ui/                 # 40 shadcn/ui-style components (button, card, dialog, etc.)
  i18n/
    index.ts            # i18next setup, language list, types
    locales/            # 15 locale JSON files (zh, en, ja, ko, etc.)
  lib/
    hooks/
      use-audio-player.ts   # Central audio hook (course + white noise playback)
      use-keyboard-offset.ts # Keyboard height tracking for mini-programs
    measure.ts          # DOM measurement utilities
    platform.ts         # Platform detection helpers (isH5, canUseDOM)
    utils.ts            # cn() utility (clsx + tailwind-merge)
  pages/
    index/              # Home dashboard (tab)
    discover/           # Course browsing (tab)
    player/             # Audio player (tab)
    profile/            # User profile (tab)
    quiz/               # Onboarding quiz
    stats/              # Statistics + achievements
    settings/           # App settings
    reminder/           # Daily reminder configuration
    auth/               # Login/register
  presets/
    index.tsx           # Preset wrapper (H5: error boundary + container; WEAPP: passthrough)
    env.ts              # IS_H5_ENV build-time flag
    dev-debug.ts        # Auto-enable debug on WEAPP non-release builds
    h5-container.tsx    # H5 wrapper with custom navbar
    h5-error-boundary.tsx # Error boundary with overlay UI (H5 only)
    h5-navbar.tsx       # Custom navigation bar for H5
    h5-styles.ts        # H5 runtime CSS injection (PC widescreen adaptation)
  repositories/
    CourseRepository.ts      # Course data access (API + local fallback)
    InstructorRepository.ts  # Instructor data access
    SeriesRepository.ts      # Series data access
  store/
    auth.ts             # Auth state (persisted: token, user, isLoggedIn)
    constants.ts        # Category maps, level labels
    courses.ts          # Course/series/instructor fetching
    language.ts         # Language state (persisted, syncs with i18next)
    meditation.ts       # User state + player state + helper functions
```

## Page Structure Convention

Each page follows this pattern:

```
pages/<name>/
  index.tsx         # Page component (default export)
  index.config.ts   # Per-page Taro navigation bar config
  index.css         # Page-specific CSS (optional, only when Tailwind is insufficient)
```

The `index.config.ts` uses a defensive pattern for compatibility outside Taro's build pipeline:

```typescript
export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '页面标题' })
  : { navigationBarTitleText: '页面标题' }
```

## Naming Conventions

- **Files**: kebab-case (`white-noise-grid.tsx`, `use-audio-player.ts`)
- **Components**: PascalCase (`WhiteNoiseGrid`, `MenuItem`)
- **Stores**: `use<Name>Store` (`useAuthStore`, `useCoursesStore`)
- **API namespaces**: PascalCase (`CourseAPI`, `Network`)
- **Repositories**: PascalCase (`CourseRepository`)
- **Locale files**: language code (`zh.json`, `en.json`, `ja.json`)
