# Quality Guidelines

## Required Patterns

| Pattern | Rule |
|---------|------|
| Navigation | Use `NativeStackNavigationProp<RootStackParamList, 'ScreenName'>` for type safety |
| State | Use Zustand stores — not raw `useState` for cross-screen state |
| Audio | Use `expo-av` Audio.Sound — module-level instances, not store state |
| Notifications | Use `expo-notifications` — handle permissions gracefully |
| Persistence | Use Zustand `persist` middleware with AsyncStorage — not direct AsyncStorage calls |
| Styling | `StyleSheet.create()` — not inline objects or CSS-in-JS libraries |

## Forbidden Patterns

| Pattern | Why |
|---------|-----|
| Hardcoded `http://localhost:3000` | Won't work on physical devices or in production |
| `Alert.prompt` for critical flows | iOS-only — does nothing on Android |
| Direct `AsyncStorage` usage | Use Zustand `persist` middleware instead |
| Emoji-only icons | Use `@expo/vector-icons` for consistent cross-device rendering |
| Duplicated `toMeditationCourse()` | Import from shared utility (to be extracted) |
| Empty progress tracking interval | `startProgressTracking()` is a no-op — remove it |

## Dependency Hygiene

The following packages are installed but **never imported** in source code:

- `clsx` — listed in `package.json` but unused
- `expo-keep-awake` — intended for preventing screen sleep during meditation, never wired up
- `react-native-root-siblings` — never imported
- `date-fns` — never imported; dates use raw `Date` and `toISOString()`

Consider removing unused dependencies or wiring them up.

## Version Mismatches

There are significant version mismatches between dependencies and Expo SDK 50:

| Package | Installed | Expected for SDK 50 |
|---------|-----------|---------------------|
| `expo-notifications` | `^57.0.3` | `~0.27.x` |
| `expo-build-properties` | `^55.0.14` | `~0.12.x` |
| `babel-preset-expo` | `^55.0.21` | `~10.0.x` |

These mismatches may cause runtime issues or build failures.

## Known Issues

1. **Token not persisted**: `useAuthStore` has no `persist` middleware. Users must re-login on every app restart.
2. **Dark mode toggle does nothing**: `isDarkMode` is stored but the entire theme is hardcoded. No light theme exists.
3. **Language setting does nothing**: No i18n library is installed. All UI text is hardcoded Chinese.
4. **WeChat login is mocked**: `handleWechatLogin` uses `setTimeout` with a fake token. No WeChat SDK integration.
5. **No error boundaries**: No React error boundaries anywhere. A crash in any screen crashes the entire app.
6. **No loading states**: `HomeScreen` and `DiscoverScreen` don't show loading indicators while fetching.
7. **Missing assets**: `assets/` directory is empty. `app.json` references `./assets/icon.png` but the file doesn't exist. Build will fail.
8. **`startProgressTracking()` is dead code**: Creates an interval with an empty body. Position updates come from the `expo-av` status callback.
9. **Category mapping inconsistency**: The `toMeditationCourse()` mapping differs across screen files.
10. **`Alert.prompt` iOS-only**: Used in `SettingsScreen` (nickname editing) and `ReminderScreen` (custom time) — fails silently on Android.
