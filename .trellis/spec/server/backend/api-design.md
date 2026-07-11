# API Design

## Global Prefix

All routes are prefixed with `/api` via `app.setGlobalPrefix('api')` in `server/src/main.ts`.

**CRITICAL**: Never add `api` to controller path decorators.

```typescript
// ✅ Correct — actual route: /api/courses
@Controller('courses')
export class CoursesController { ... }

// ❌ Wrong — actual route: /api/api/courses
@Controller('api/courses')
export class CoursesController { ... }
```

## Response Envelope

Every endpoint returns a consistent envelope:

```typescript
// Success
{ status: 'success', data: <payload> }

// Error
{ status: 'error', message: '<description>', errors?: <details> }
```

This is implemented directly in controller methods, not via a serializer. Reference: every controller in `server/src/modules/*/`.

```typescript
// Typical controller response pattern
@Get(':id')
async findOne(@Param('id') id: string) {
  const course = await this.coursesService.findById(id)
  if (!course) {
    return { status: 'error', message: 'Course not found' }
  }
  return { status: 'success', data: course }
}
```

## HTTP Status Codes

- **All responses return HTTP 200** — even POST creates and error responses.
- The `HttpStatusInterceptor` (`server/src/interceptors/http-status.interceptor.ts`) forces POST 201→200 globally.
- The `AllExceptionsFilter` returns 200 for thrown `HttpException` instances with error payloads.
- Client-side code must check `status` field in the response body, not HTTP status codes.

Anti-pattern: Using `@HttpCode(201)` on create endpoints — the interceptor overrides it. The decorator is dead code.

## Endpoint Conventions

| Operation | Method | Path | Auth |
|-----------|--------|------|------|
| List all | GET | `/api/<resource>` | Public |
| Get by ID | GET | `/api/<resource>/:id` | Public |
| Create | POST | `/api/<resource>` | Admin |
| Update | PUT | `/api/<resource>/:id` | Admin |
| Delete | DELETE | `/api/<resource>/:id` | Admin |

- Uses **PUT** for updates (not PATCH).
- DELETE returns HTTP 200 (not 204).
- Query parameters for filtering/pagination via `?key=value`.

## Current API Surface

### Courses (`/api/courses`)
- `GET /courses` — list with pagination and filtering (category, level, seriesId, instructorId, search)
- `GET /courses/:id` — single course with instructor and series populated
- `GET /courses/series/:seriesId` — courses belonging to a series
- `POST /courses` — create (Admin)
- `PUT /courses/:id` — update (Admin)
- `DELETE /courses/:id` — delete (Admin)

### Series (`/api/series`)
- `GET /series` — list all with courses populated
- `GET /series/recommended` — recommended series only
- `GET /series/:id` — single series with courses
- `POST /series` — create (Admin)
- `PUT /series/:id` — update (Admin)
- `DELETE /series/:id` — delete (Admin)
- `POST /series/:id/courses` — add courses to series (Admin)

### Instructors (`/api/instructors`)
- `GET /instructors` — list all
- `GET /instructors/:id` — single
- CRUD with Admin guard

### Progress (`/api/progress`)
- `GET /progress/:userId` — all progress for a user
- `GET /progress/:userId/:courseId` — specific course progress
- `PUT /progress/:userId/:courseId` — update position/completed
- `POST /progress/:userId/:courseId/complete` — mark completed

### Auth (`/api/auth`) — all `@Public()`
- `POST /auth/send-code` — email verification code
- `POST /auth/register` — email + password + verification code
- `POST /auth/login` — email + password
- `POST /auth/wechat-login` — WeChat OAuth

### Push (`/api/push`)
- `POST /push/preferences` — save push preferences
- `GET /push/preferences/:userId` — get preferences

### Storage (`/api/storage`)
- `POST /storage/upload-url` — get public URL for a storage key

## CORS Configuration

- **Production**: Restricted to `ALLOWED_ORIGINS` env var (comma-separated origins).
- **Non-production**: All origins allowed (`origin: true`).
- Credentials enabled.

## Static File Serving

In development, `server/media/` is served at `/media` with 1-day cache.
In production, media is served from TOS CDN via `TOS_PUBLIC_URL`.
