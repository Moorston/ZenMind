# Directory Structure

## Source Layout

```
mobile-app/
  App.tsx                     # Entry: splash screen → RootNavigator
  app.json                    # Expo config (bundle ID, plugins, splash)
  babel.config.js             # babel-preset-expo + reanimated plugin
  tsconfig.json               # Strict mode, @/* → src/*
  src/
    api/
      courses.ts              # CoursesAPI namespace (typed REST calls)
      network.ts              # Network wrapper (fetch-based, Bearer auth)
    navigation/
      RootNavigator.tsx        # Tab + Stack navigation, auth gating
    screens/
      WelcomeScreen.tsx        # Onboarding carousel (3 slides)
      LoginScreen.tsx          # Phone/Email/WeChat login tabs
      RegisterScreen.tsx       # Registration form
      HomeScreen.tsx           # Dashboard (greeting, check-in, courses)
      DiscoverScreen.tsx       # Browse/search courses + white noise
      PlayerScreen.tsx         # Audio player (course + white noise)
      ProfileScreen.tsx        # User profile, calendar, menu
      QuizScreen.tsx           # Onboarding preference quiz
      StatsScreen.tsx          # Statistics + achievements
      SettingsScreen.tsx       # App settings (toggles, language)
      ReminderScreen.tsx       # Daily notification reminder setup
    store/
      constants.ts             # Hardcoded white noise data (Pixabay CDN)
      types.ts                 # MeditationCourse, WhiteNoise, CheckIn types
      useAuthStore.ts          # Auth state (token, login/logout)
      useCoursesStore.ts       # Courses/series/instructors from API
      usePlayerStore.ts        # Audio playback (expo-av)
      useUserStore.ts          # User prefs, check-ins, stats (persisted)
```

## Screen File Convention

Each screen is a single file in `src/screens/`:

```
<Name>Screen.tsx          # Screen component (default export)
<Name>Screen.styles.ts    # StyleSheet (optional — co-located or inline)
```

Note: Style file naming is inconsistent — `ProfileScreen.style.ts` (singular) vs `DiscoverScreen.styles.ts` (plural). Prefer the plural form for new files.

## Naming Conventions

- **Screen files**: PascalCase + `Screen` suffix (`HomeScreen.tsx`, `PlayerScreen.tsx`)
- **Style files**: Match screen name (`HomeScreen.styles.ts`)
- **Stores**: `use<Name>Store` (`useAuthStore`, `usePlayerStore`)
- **API namespaces**: PascalCase (`CoursesAPI`, `Network`)
- **Types**: PascalCase (`MeditationCourse`, `WhiteNoise`)
