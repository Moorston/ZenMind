# Cross-Layer Thinking Guide

> **Purpose**: Think through data flow across layers before implementing.

---

## The Problem

**Most bugs happen at layer boundaries**, not within layers.

In ZenMind, data flows through three distinct layers:

```
Server (NestJS + Drizzle) → API Response → Frontend Store → Screen Component
```

Common cross-layer bugs in this project:

- Server returns `tags` as a JSON string, frontend expects a parsed array
- Category enums differ between backend (`breathing`, `body-scan`) and frontend (`beginner`, `sleep`)
- The response envelope `{ status, data }` is not unwrapped, causing double-nesting
- Progress updates work in mini-app but fail in mobile-app due to different auth token handling

---

## Before Implementing Cross-Layer Features

### Step 1: Map the Data Flow

Ask: where does the data start, and where does it end?

| Question | Example |
|----------|---------|
| Where does it enter? | User taps "Play" on a course card |
| What format is it in? | `MeditationCourse` (frontend model) |
| What API call is made? | `PUT /api/progress/:userId/:courseId` |
| What does the server expect? | `{ position: number, completed: boolean }` |
| What schema column is updated? | `progress.position` (integer), `progress.completed` (0/1 boolean) |

### Step 2: Check Format Transformations

The `toMeditationCourse()` function is the main transformation point. It handles:

- `tags`: JSON string → parsed array
- `category`: backend enum → frontend display category
- `instructor`: nested object → flat string name

If you add a new field to `courses`, check whether `toMeditationCourse()` needs updating in ALL copies (this function is currently duplicated — see code reuse guide).

### Step 3: Check Both Frontends

Both `mini-app/` and `mobile-app/` consume the same API. Changes to:

- **Server response shape** → update both `CourseAPI` (mini-app) and `CoursesAPI` (mobile-app)
- **DTO types** → update both `mini-app/src/api/courses.ts` and `mobile-app/src/api/courses.ts`
- **Store models** → update both `mini-app/src/store/meditation.ts` and `mobile-app/src/store/types.ts`

### Step 4: Check the Envelope

Every API response is wrapped in `{ status: string, data: T }`. The "double data trap":

```typescript
// Server returns: { status: 'success', data: { id: '...', title: '...' } }
// Taro.request wraps it: { statusCode: 200, data: { status: 'success', data: { ... } } }

const res = await Network.request({ url: '/api/courses/1' })
// res.data = { status: 'success', data: { id: '...', title: '...' } }
// res.data.data = { id: '...', title: '...' }  ← actual course
```

Anti-pattern: Treating `res.data` as the business object.

---

## Cross-Layer Checklist

Before committing a cross-layer change:

- [ ] Drizzle schema change → migration generated?
- [ ] New column → seed file updated?
- [ ] Response shape changed → both `CourseAPI` and `CoursesAPI` updated?
- [ ] New field → `toMeditationCourse()` updated in ALL copies?
- [ ] Category/level enum changed → `CATEGORY_MAP` / `LEVEL_LABELS` updated in both stores?
- [ ] Auth requirement changed → `@Public()` decorator added/removed?
- [ ] New endpoint → documented in spec `api-design.md`?

---

## Real Bug Patterns

### Bug: Tags Not Parsed

The `courses.tags` column stores `JSON.stringify(['beginner', 'quick'])`. The `toMeditationCourse()` function parses it with `JSON.parse()`. But if a new code path reads the course without going through `toMeditationCourse()`, it gets a raw string.

**Lesson**: Always go through the transformation function, or document that a field needs parsing.

### Bug: Category Mapping Inconsistency

`toMeditationCourse()` exists in three copies across the mobile-app. The `body-scan` category maps to `'beginner'` in `HomeScreen` but to `'sleep'` in `PlayerScreen`.

**Lesson**: Single source of truth for all data transformations.

### Bug: Progress Not Saved

`usePlayerStore.reset()` in mobile-app saves progress via `CoursesAPI.updateProgress()`, but the auth token in mobile-app's `Network.request` reads from `useAuthStore.getState().token`. If the store hasn't rehydrated yet (app restart), the token is null and the request fails silently.

**Lesson**: Check auth token availability before making authenticated API calls.
