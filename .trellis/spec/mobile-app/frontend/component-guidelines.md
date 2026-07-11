# Component Guidelines

## Screen Patterns

Screens are React functional components with default export. Each screen owns its own layout and business logic — there is no shared screen template or HOC.

```typescript
export default function HomeScreen({ navigation }: Props) {
  // hooks
  // state
  // effects
  // handlers
  return (
    <ScrollView style={styles.container}>
      {/* screen content */}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
})
```

## Styling

The mobile app uses **React Native `StyleSheet.create()`** — no Tailwind, no styled-components.

### Current Patterns (Inconsistent)

Styles are defined in two ways:

1. **Separate `.styles.ts` file** (4 screens): `HomeScreen.styles.ts`, `DiscoverScreen.styles.ts`, `PlayerScreen.styles.ts`, `ProfileScreen.style.ts`
2. **Inline `StyleSheet.create()`** at bottom of screen file (6 screens): `LoginScreen`, `RegisterScreen`, `QuizScreen`, `StatsScreen`, `SettingsScreen`, `ReminderScreen`

Prefer inline `StyleSheet.create()` at the bottom of the screen file for new screens unless the style object exceeds ~100 lines.

### Dark Theme

The entire app uses a hardcoded dark theme:

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0a0a1a` | Page backgrounds |
| Card | `#1a1a3e` | Card/section backgrounds |
| Primary | `#7c6aef` | Buttons, accents, active states |
| Text | `#ffffff` | Primary text |
| Muted | `#9090a0` | Secondary text |

There is **no theme system** — colors are hardcoded hex values in every screen. A `isDarkMode` toggle exists in settings but does nothing.

Anti-pattern: Using `StyleSheet as any` cast (seen in `ProfileScreen.style.ts`) — this masks type errors.

## Icons

The mobile app uses **emoji characters** as icons (`<Text>🏠</Text>`), not an icon library like `@expo/vector-icons`. This is functional but limits customization and may render differently across devices.

## Shared Components

There are **no shared business components** — each screen defines its own UI inline. If a pattern repeats (like stat cards or course cards), consider extracting a shared component.

## Composition Patterns

### Navigation Type Safety

```typescript
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/RootNavigator'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>
}
```

### Conditional Rendering by Auth State

The navigation uses Zustand state to conditionally render screens — not separate navigators per auth state. Reference: `src/navigation/RootNavigator.tsx`.
