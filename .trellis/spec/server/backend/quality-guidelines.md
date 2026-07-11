# Quality Guidelines

## Required Patterns

### Controller Structure

Every controller method must:
1. Validate input (Zod `safeParse` for bodies/queries, `@Param()` for path params).
2. Delegate to a service method for business logic.
3. Return the standard envelope `{ status, data?, message? }`.

Anti-pattern: Injecting `DRIZZLE` directly into controllers. Business logic belongs in services. Exception: `PushController` currently does this — it should be refactored.

### Service Structure

Services handle all business logic and database access:
- Inject the Drizzle instance via `@Inject(DRIZZLE)`.
- Use typed Drizzle queries (not raw SQL strings).
- Return plain objects or `undefined`/`null` for not-found cases.

### DTO Validation

- Use Zod schemas in `dto/` subdirectories.
- Use `safeParse()` in controllers (never `parse()` which throws).
- Define shared schemas (create/update) in the same file when they share fields.

## Forbidden Patterns

| Pattern | Why |
|---------|-----|
| `@Controller('api/...')` | Global prefix adds `/api` — this doubles it |
| `class-validator` decorators | Project uses Zod exclusively |
| JWT libraries | Auth uses custom token storage, not JWT |
| Raw SQL strings | Use Drizzle's query builder for type safety |
| `@HttpCode(201)` | The interceptor overrides it — dead code |
| `process.env` in services | Works but no ConfigModule — access in constructor or top-level only |

## Testing

- Test framework: **Vitest** (`server/vitest.config.ts`).
- Test files: `__tests__/<name>.service.test.ts` co-located with modules.
- Run tests: `pnpm test` from `server/` or `pnpm --filter server test`.
- Current test coverage is minimal — `auth.service.test.ts`, `courses.service.test.ts`, `progress.service.test.ts`.

## Environment Variables

All accessed via `process.env` (no `@nestjs/config` ConfigModule):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLite file path (default `./data/meditation.db`) |
| `TOS_ENDPOINT`, `TOS_ACCESS_KEY`, `TOS_SECRET_KEY`, `TOS_BUCKET`, `TOS_PUBLIC_URL`, `TOS_REGION` | S3/TOS storage config |
| `WECHAT_APPID`, `WECHAT_SECRET` | WeChat mini-program OAuth |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Email sending (optional) |
| `ALLOWED_ORIGINS` | CORS origins for production (comma-separated) |

## Known Issues

1. **`uploadDirectory` is broken**: `StorageService.uploadDirectory()` calls `uploadFileSync()` which throws immediately.
2. **No foreign key on `progress.user_id` and `push_tokens.user_id`**: Allows orphaned records.
3. **`ilike` used with SQLite**: Works for ASCII incidentally but is semantically wrong.
4. **Duplicate seed files**: `seed.ts` and `seed.js` overlap with different completeness levels. Prefer `seed.ts`.
5. **WeChat users have empty password**: Safe for bcrypt but fragile pattern.
6. **Synchronous DB calls in async methods**: better-sqlite3 is synchronous — `await` on `.get()`/`.all()` is a no-op.
