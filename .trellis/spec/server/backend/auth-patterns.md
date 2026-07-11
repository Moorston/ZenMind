# Auth Patterns

## Custom Token-Based Authentication

The server does **NOT use JWT**. Auth tokens are plain UUIDs stored in the `users.token` column.

### Token Generation

```typescript
const token = 'token_' + crypto.randomUUID()
```

Tokens are stored directly in the database. Each login/register replaces the previous token (single-session model).

### AuthGuard (Global)

Reference: `server/src/modules/auth/auth.guard.ts`

Registered as a **global guard** via `APP_GUARD` in `AuthModule`. Every route requires authentication unless explicitly marked `@Public()`.

How it works:
1. Reads `Authorization: Bearer <token>` header.
2. Looks up the token in the `users` table.
3. Attaches `request.user = { id, email, nickname, role }`.
4. Returns 401 if token is missing or invalid.

### Public Routes

Use the `@Public()` decorator to skip auth on specific endpoints:

```typescript
import { Public } from '@/modules/auth/auth.guard'

@Public()
@Get('health')
getHealth() {
  return { status: 'success', data: { timestamp: Date.now() } }
}
```

All auth endpoints (`/api/auth/*`) are `@Public()`.

### AdminGuard (Per-Route)

Reference: `server/src/modules/auth/auth-admin.guard.ts`

Not global — applied per-route. Must be used **after** AuthGuard (which sets `request.user`).

```typescript
import { Admin } from '@/modules/auth/auth-admin.guard'

@Post()
@Admin()
async create(@Body() body: CreateCourseDto) { ... }
```

Checks `request.user.role` is `'admin'` or `'editor'`. Returns 403 otherwise.

### Auth Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/send-code` | POST | Send 6-digit email verification code |
| `/api/auth/register` | POST | Register with email + password + verification code |
| `/api/auth/login` | POST | Login with email + password |
| `/api/auth/wechat-login` | POST | WeChat mini-program OAuth (code2session) |

### Email Verification

- 6-digit code, 10-minute expiry.
- Previous unused codes for the same email are marked `used` before creating a new one.
- SMTP sending is optional — falls back to console logging when SMTP is not configured.

### WeChat Login

Uses WeChat's `code2session` API flow. Creates users with an empty password field — such users cannot use email/password login (bcrypt comparison safely returns false).

### Known Limitations

- **No token expiry**: Tokens live forever until replaced by a new login.
- **No refresh mechanism**: Single-session only — new login invalidates old session.
- **DB lookup per request**: Every authenticated request queries the `users` table for the token.
- **No rate limiting**: Auth endpoints have no rate limiting — vulnerable to brute force.
