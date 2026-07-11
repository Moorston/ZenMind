# Code Reuse Thinking Guide

> **Purpose**: Stop and think before creating new code — does it already exist?

---

## The Problem

**Duplicated code is the #1 source of inconsistency bugs** in this monorepo.

Known duplications in ZenMind:

1. **`toMeditationCourse()`** — exists in `mini-app/src/store/meditation.ts` AND is copy-pasted across `mobile-app/src/screens/HomeScreen.tsx`, `DiscoverScreen.tsx`, and `PlayerScreen.tsx` with inconsistent category mappings.

2. **`getBestTime()`** — duplicated logic with hardcoded Chinese strings in both mini-app and mobile-app stores.

3. **Static course/noise data** — defined in both `mini-app/src/store/meditation.ts` (as `meditationCourses`, `whiteNoises`) and `mobile-app/src/store/constants.ts`.

4. **Category maps** — `CATEGORY_MAP` exists in `mini-app/src/store/constants.ts` with similar logic scattered in mobile-app screens.

---

## Before Writing New Code

### Step 1: Search First

```bash
# Before creating a new utility function
grep -r "functionName\|function_name" mini-app/src/ mobile-app/src/ server/src/

# Before creating a new constant
grep -r "CATEGORY_MAP\|categoryMap\|category_map" mini-app/src/ mobile-app/src/

# Before creating a new type
grep -r "MeditationCourse\|CourseDTO\|WhiteNoise" mini-app/src/ mobile-app/src/
```

### Step 2: Check These Locations

| What you're creating | Search here first |
|---------------------|-------------------|
| UI component | `mini-app/src/components/ui/` (40 components) |
| Business component | `mini-app/src/components/` |
| Helper function | `mini-app/src/lib/utils.ts`, `mini-app/src/store/meditation.ts` |
| API endpoint call | `mini-app/src/api/courses.ts`, `mobile-app/src/api/courses.ts` |
| Type definition | `mini-app/src/api/courses.ts` (DTOs), `mobile-app/src/store/types.ts` (models) |
| Store action | Check all 4 stores in both frontends |
| Constant/map | `mini-app/src/store/constants.ts`, `mobile-app/src/store/constants.ts` |
| Server service | `server/src/modules/*/` — check if another module already handles similar logic |
| Zod schema | `server/src/modules/*/dto/` — check for reusable schemas |

### Step 3: Decide

- **Exists and works** → import and use it
- **Exists but incomplete** → extend it (don't copy and modify)
- **Doesn't exist** → create it in the right location, then document it

---

## Patterns to Watch

### Pattern: DTO → Frontend Model Mapping

Both frontends transform API responses (`CourseDTO`) into frontend models (`MeditationCourse`). This mapping:

```typescript
{ id, title, category: getDisplayCategory(dto.category), tags: JSON.parse(dto.tags), ... }
```

**Should exist in exactly one place per frontend** — not scattered across screen files.

### Pattern: Display Labels

Category and level display labels use i18n keys with fallback:

```typescript
// mini-app pattern (better)
function getDisplayCategory(category: string): string {
  return CATEGORY_MAP[category] ?? category
}

// mobile-app pattern (worse — hardcoded Chinese in catch)
try { return i18n.t(`store.categories.${category}`) } catch { return category }
```

Centralize in `store/constants.ts` and import everywhere.

### Pattern: Network Calls

Both frontends have a `Network` wrapper. Auth endpoints are called differently:
- **mini-app**: Auth page calls `Network.request` directly for `/api/auth/*`
- **mobile-app**: Auth calls are inline in `LoginScreen` and `RegisterScreen`

If you add a new auth endpoint, update BOTH frontend auth screens.

### Pattern: Repository Layer

The mini-app has a `src/repositories/` layer that abstracts data access with offline-first fallback. The mobile-app does not have this layer — it calls `useCoursesStore.initialize()` directly.

If you add data access patterns, follow the mini-app's repository approach for consistency.

---

## Monorepo Awareness

Changes in one workspace may require changes in others:

| Change in... | Check in... |
|-------------|-------------|
| `server/src/db/schema/*.ts` | Both frontends' DTO types |
| `server/src/modules/*/dto/*.ts` | Both frontends' API call types |
| `mini-app/src/store/constants.ts` | `mobile-app/src/store/constants.ts` (keep in sync) |
| `mini-app/src/api/courses.ts` | `mobile-app/src/api/courses.ts` (keep in sync) |
| `server/src/modules/auth/auth.controller.ts` | Both frontends' auth screens |

---

## Real Duplication Bugs

### Bug: Inconsistent Category Mapping

`body-scan` maps to `'beginner'` in `HomeScreen` but to `'sleep'` in `PlayerScreen` (mobile-app). Users see different category labels depending on which screen they're viewing.

**Fix**: Single `CATEGORY_MAP` constant, used everywhere.

### Bug: Stale Fallback Data

`meditationCourses` in `meditation.ts` has 8 hardcoded courses with Chinese titles. When the server adds new courses, these fallbacks become stale. The `CourseRepository` uses these as offline fallback.

**Fix**: Mark fallback data clearly with a comment, and update it when the seed data changes.
