# Directory Structure

## Module Layout

Each NestJS module follows this structure under `server/src/modules/<name>/`:

```
modules/<name>/
  <name>.module.ts      # NestJS module definition
  <name>.controller.ts  # Route handlers
  <name>.service.ts     # Business logic
  dto/                  # Zod schemas for input validation (optional)
    create-<name>.dto.ts
  __tests__/            # Vitest tests (optional)
    <name>.service.test.ts
```

Reference: `server/src/modules/courses/` follows this pattern with DTOs in a `dto/` subdirectory.

## Current Modules

| Module | Directory | Purpose |
|--------|-----------|---------|
| `DbModule` | `modules/db/` | Global module providing the Drizzle `DRIZZLE` token |
| `AuthModule` | `modules/auth/` | Email/WeChat auth, token management, guards |
| `CoursesModule` | `modules/courses/` | Course CRUD with filtering and pagination |
| `SeriesModule` | `modules/series/` | Series CRUD, course-series relationships |
| `InstructorsModule` | `modules/instructors/` | Instructor CRUD |
| `ProgressModule` | `modules/progress/` | Per-user course progress tracking |
| `StorageModule` | `modules/storage/` | TOS/S3 presigned URL generation |
| `PushModule` | `modules/push/` | Push notification preferences and scheduling |

## Schema Files

Database tables are defined in `server/src/db/schema/` — one file per table:

- `users.ts` — user accounts with roles
- `courses.ts` — meditation courses with metadata
- `series.ts` — course series/collections + `series_courses` join table
- `instructors.ts` — course instructors
- `progress.ts` — per-user per-course progress (composite PK)
- `push-tokens.ts` — push notification tokens and preferences
- `email-verification-codes.ts` — email verification flow
- `index.ts` — re-exports all schemas

## Cross-Cutting Files

| File | Purpose |
|------|---------|
| `server/src/main.ts` | App bootstrap, CORS, global prefix, static serving |
| `server/src/app.module.ts` | Root module wiring all feature modules |
| `server/src/filters/all-exceptions.filter.ts` | Global exception filter |
| `server/src/interceptors/http-status.interceptor.ts` | POST 201→200 interceptor |
| `server/src/seed.ts` | Idempotent database seeding (tables + data) |
| `server/src/seed-media.ts` | Media URL seeding (local dev or TOS upload) |
| `server/drizzle.config.ts` | Drizzle Kit configuration |

## Path Alias

`tsconfig.json` maps `@/*` to `src/*`. Use this consistently:

```typescript
import { CoursesService } from '@/modules/courses/courses.service'
import { users } from '@/db/schema'
```

Anti-pattern: using relative `../../` paths that cross module boundaries.
