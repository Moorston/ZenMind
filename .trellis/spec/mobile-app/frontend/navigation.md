# Navigation

## React Navigation 6

The app uses React Navigation with a bottom-tabs + native-stack architecture.

Reference: `src/navigation/RootNavigator.tsx`

### Structure

```
NavigationContainer (dark theme)
  Stack.Navigator
    Conditional based on auth state:
      !hasSeenWelcome → WelcomeScreen
      !isLoggedIn → LoginScreen, RegisterScreen
      isLoggedIn →
        MainTabs (BottomTabNavigator)
          Home tab       → HomeScreen
          Discover tab   → DiscoverScreen
          Player tab     → PlayerScreen
          Profile tab    → ProfileScreen
        Player (stack)   → PlayerScreen (with back header)
        Quiz             → QuizScreen
        Stats            → StatsScreen (with header)
        Settings         → SettingsScreen (with header)
        Reminder         → ReminderScreen (with header)
```

### Auth Gating

The navigation uses Zustand state (`useAuthStore`) to conditionally render screens within a single `Stack.Navigator`. There are no separate navigators per auth state.

```typescript
const { isLoggedIn, hasSeenWelcome } = useAuthStore()

<Stack.Navigator>
  {!hasSeenWelcome ? (
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
  ) : !isLoggedIn ? (
    <>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </>
  ) : (
    <>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      {/* ... other screens */}
    </>
  )}
</Stack.Navigator>
```

### Tab Bar

4 tabs: Home, Discover, Player, Profile.

- Tab icons are **emoji characters** rendered in `<Text>`, not an icon library.
- Tab bar height: 85px with 28px bottom padding (safe area handling).
- Dark theme: background `#0a0a1a`, active tint `#7c6aef`.

### PlayerScreen Dual Registration

`PlayerScreen` is registered both as a tab and as a stack screen. The stack version (with a back header) is used for deep navigation from Home/Discover. The tab version has no header.

### Type-Safe Params

```typescript
export type RootStackParamList = {
  Welcome: undefined
  Login: undefined
  Register: undefined
  MainTabs: undefined
  Player: { courseId?: string; noiseId?: string }
  Quiz: undefined
  Stats: undefined
  Settings: undefined
  Reminder: undefined
}

export type RootTabParamList = {
  Home: undefined
  Discover: undefined
  Player: undefined
  Profile: undefined
}
```

### Theme

```typescript
const darkTheme = {
  dark: true,
  colors: {
    primary: '#7c6aef',
    background: '#0a0a1a',
    card: '#1a1a3e',
    text: '#ffffff',
    border: '#2a2a4e',
    notification: '#7c6aef',
  },
}
```

Anti-pattern: The theme is hardcoded — `isDarkMode` in `useUserStore` is never read by the navigator.
