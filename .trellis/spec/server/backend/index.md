# Server Backend Specs

Coding guidelines for the NestJS backend (`server/`).

## Stack

| Layer | Tool |
|-------|------|
| Framework | NestJS 10 + Express 5 |
| ORM | Drizzle ORM + better-sqlite3 |
| Validation | Zod (via drizzle-zod) |
| Auth | Custom token-based (no JWT) |
| Storage | TOS/S3 via AWS SDK v3 |
| Testing | Vitest |

## Spec Files

- [directory-structure.md](directory-structure.md) — module layout and file naming
- [database-guidelines.md](database-guidelines.md) — Drizzle schema, queries, and migrations
- [api-design.md](api-design.md) — routing, response envelope, and endpoint conventions
- [validation.md](validation.md) — Zod DTO patterns and input validation
- [auth-patterns.md](auth-patterns.md) — token auth, guards, and role-based access
- [error-handling.md](error-handling.md) — exception filter, interceptor, and error responses
- [logging-guidelines.md](logging-guidelines.md) — logging patterns and gaps
- [quality-guidelines.md](quality-guidelines.md) — code quality, testing, and known issues

## Quick Reference

- Entry: `server/src/main.ts`
- Path alias: `@/` → `server/src/`
- Global prefix: `/api` (do NOT add `api` to controller paths)
- Database: SQLite file at `DATABASE_URL` env var (default `./data/meditation.db`)
- Run dev: `pnpm dev:server` from repo root
- Seed: `pnpm seed`, `pnpm seed:media`
