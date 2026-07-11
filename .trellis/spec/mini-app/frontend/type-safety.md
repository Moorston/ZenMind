# Type Safety

## TypeScript Configuration

- Strict mode enabled (`mini-app/tsconfig.json`).
- Path alias: `@/*` → `src/*`.
- Type check: `pnpm --filter mini-app tsc` (no emit, skip lib check).

## DTO Types

API response types are defined in `src/api/courses.ts`:

```typescript
export type CourseDTO = {
  id: string
  title: string
  description: string
  category: string
  level: string
  duration: number
  cover_url: string
  audio_url: string
  tags: string          // JSON string — parse before use
  instructor_id: string | null
  series_id: string | null
  created_at: string
}

export type PaginatedResponse<T> = {
  status: string
  data: T[]
  total: number
  page: number
  pageSize: number
}
```

## Frontend Model Types

The `meditation.ts` store defines frontend model types:

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

## DTO → Frontend Mapping

The `toMeditationCourse()` function in `meditation.ts` maps API DTOs to frontend models:

```typescript
export function toMeditationCourse(dto: CourseDTO): MeditationCourse {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    duration: dto.duration,
    category: getDisplayCategory(dto.category),
    cover_url: dto.cover_url,
    audio_url: dto.audio_url,
    instructor: dto.instructor?.nickname ?? '',
    level: dto.level,
    tags: typeof dto.tags === 'string' ? JSON.parse(dto.tags) : dto.tags,
  }
}
```

Anti-pattern: Duplicating `toMeditationCourse()` across multiple files. This function exists in `meditation.ts` — import it from there.

## i18n Types

```typescript
export type LanguageCode = 'zh' | 'zh-Hant' | 'en' | 'es' | 'ja' | 'ko' | 'fr' | 'de' | 'pt' | 'ru' | 'ar' | 'it' | 'hi' | 'vi' | 'th'
```

Defined in `src/i18n/index.ts` alongside the `LANGUAGE_LIST` array.

## Enum Handling

Backend enums are stored as strings. Frontend maps them to display values via constants:

```typescript
// src/store/constants.ts
export const CATEGORY_MAP: Record<string, string> = {
  breathing: 'beginner',
  'body-scan': 'sleep',
  visualization: 'relax',
  'loving-kindness': 'focus',
  mindfulness: 'focus',
}
```

Anti-pattern: Hardcoding category/level display strings in pages — use the constants and i18n keys.

## Forbidden Patterns

- `any` type — use proper types or `unknown` with type guards.
- Type assertions (`as`) without documentation — prefer narrowing or generics.
- Untyped `Network.request()` calls — always provide the response type parameter.
