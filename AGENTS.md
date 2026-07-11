<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->

---

# CodeBuddy Guide

This section augments the Trellis instructions above with project-specific commands and architecture. It lives outside the Trellis-managed block so `trellis update` won't overwrite it.

## Package Manager

**pnpm 9** monorepo. Workspaces defined in `pnpm-workspace.yaml`: `mini-app`, `server`, `mobile-app`. Always use pnpm — never npm or yarn. Root `package.json` orchestrates via `pnpm --filter <workspace>`.

## Common Commands

### Development
```bash
pnpm dev          # concurrently: H5 frontend (port 5000) + backend API (port 3000)
pnpm dev:web      # mini-app H5 only
pnpm dev:weapp    # mini-app WeChat mini-program (Taro --watch)
pnpm dev:server   # backend only (builds, then runs dist/main)
pnpm dev:mobile   # Expo dev server (press i / a for simulators)
```
Backend port override: `node dist/main -p <port>` (see `server/src/main.ts:9`). Use `pnpm kill:all` to clean up stray dev processes.

### Build
```bash
pnpm build              # build all workspaces (pnpm -r build)
pnpm build:web          # mini-app H5 → mini-app/dist-web
pnpm build:weapp        # mini-app WeChat → mini-app/dist
pnpm build:server       # NestJS → server/dist (tsc --build + scripts/postbuild.mjs)
pnpm prebuild:mobile    # generate native ios/android projects
pnpm build:mobile:ios   # build iOS
pnpm build:mobile:android  # build Android
```

### Lint & Type-check
```bash
pnpm lint         # eslint on mini-app/src (only mini-app exposes lint at root)
pnpm lint:fix     # eslint --fix on mini-app
pnpm validate     # concurrently: mini-app lint:build (--max-warnings=0) + tsc --noEmit
```
Per-workspace type-check: `pnpm --filter mini-app tsc`, `pnpm --filter mobile-app tsc`.

**There is no test suite in this repo** — do not fabricate test commands. If asked to "run tests", clarify this with the user.

### Database (server)
```bash
cd server
npx drizzle-kit generate   # generate migrations from schema
npx drizzle-kit migrate    # apply migrations
pnpm seed                  # seed initial data (tsx src/seed.ts)
pnpm seed:media            # seed media metadata (tsx src/seed-media.ts)
```

## Architecture

Three workspaces sharing one TypeScript codebase, talking over a REST API under `/api`.

| Workspace | Stack | Targets |
|---|---|---|
| `mini-app/` | Taro 4.1.9 + React 18 + Tailwind 4 + Zustand 5 | H5, WeChat (weapp), TikTok (tt) |
| `mobile-app/` | Expo SDK 50 + React Native 0.73 + Zustand 5 | Android, iOS |
| `server/` | NestJS 10 + Express 5 + Drizzle ORM + better-sqlite3 | API on port 3000 |

### Backend (`server/`)
- **Entry** `server/src/main.ts`: boots NestFactory, sets global prefix `/api`, registers `HttpStatusInterceptor` + `AllExceptionsFilter` globally, enables CORS (prod: `ALLOWED_ORIGINS` env), serves `server/media/` statically at `/media` in dev (TOS CDN in prod via `TOS_PUBLIC_URL`).
- **Path alias** `@/` → `server/src/` (see `tsconfig.json` paths).
- **Modules** (`server/src/modules/`, wired in `app.module.ts`): `auth`, `courses`, `series`, `instructors`, `progress`, `storage` (TOS/S3 upload URLs), `db` (Drizzle connection). The README's "6 modules" is stale — `auth` was added.
- **Schema** (`server/src/db/schema/`): `courses`, `series`, `series_courses` (join), `instructors`, `progress` (userId+courseId composite PK), `users`, `email-verification-codes`. The README's "5 tables" is stale.
- Relationship: `instructors 1—N courses N—N series` (via `series_courses`); `progress` is keyed per user+course.
- All routes are `GET/POST/PUT /api/<resource>/...`. See the README's API endpoint table for the canonical list.

### Frontend (`mini-app/`, Taro)
- **Pages** in `mini-app/src/pages/` (index, discover, player, profile, quiz, stats, settings, reminder); routes in `app.config.ts`.
- **UI**: shadcn/ui-style components in `mini-app/src/components/ui/` — **prefer these over custom components**. Icons from `lucide-react-taro`.
- **State**: Zustand stores in `mini-app/src/store/`.
- **API layer**: `mini-app/src/api/` + `mini-app/src/network.ts` (`Network.request/uploadFile/downloadFile`; base URL comes from the `PROJECT_DOMAIN` compile-time define, not an env var at runtime).
- **Path alias** `@/` → `mini-app/src/`.
- **H5 compat presets** in `mini-app/src/presets/`.

### Mobile (`mobile-app/`, Expo)
- Screens in `mobile-app/src/screens/`, bottom-tab + stack navigation in `src/navigation/`, API in `src/api/`, Zustand in `src/store/`. Entry: `App.tsx`.

### Cross-platform conventions (mini-app)
- Detect platform with `Taro.getEnv() === Taro.ENV_TYPE.WEAPP` — do **not** use `process.env`.
- Native `Text` needs a `block` class; wrap `Input`/`Textarea` in `View` and put styles on the wrapper.
- Fixed + Flex layouts use inline styles; bottom-fixed elements add `bottom: 50` to clear the TabBar.
- **No hardcoded `px` in Tailwind classes** (e.g. `w-[340px]` is forbidden) — use Tailwind design tokens.

## Spec & Workflow Tooling

- `.trellis/` — Trellis workflow (see the block above). Spec guidelines live in `.trellis/spec/{server,mini-app,mobile-app,guides}/` and are mostly scaffolded "To fill". Consult the relevant layer's `index.md` before writing code, and update it (Phase 3.3) when you discover new conventions.
- `openspec/` — spec-driven workflow tooling (config in `openspec/config.yaml`, currently empty).
- `style-guide.md` (repo root) — additional frontend style guidance; consult before UI work.
