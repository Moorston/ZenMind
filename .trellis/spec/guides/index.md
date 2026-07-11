# Thinking Guides

> **Purpose**: Expand your thinking to catch things you might not have considered.

---

## Why Thinking Guides?

**Most bugs and tech debt come from "didn't think of that"**, not from lack of skill:

- Didn't think about what happens at layer boundaries → cross-layer bugs
- Didn't think about code patterns repeating → duplicated code everywhere
- Didn't think about edge cases → runtime errors
- Didn't think about future maintainers → unreadable code

These guides help you **ask the right questions before coding**.

---

## Available Guides

| Guide | Purpose | When to Use |
|-------|---------|-------------|
| [Code Reuse Thinking Guide](./code-reuse-thinking-guide.md) | Identify patterns and reduce duplication | When you notice repeated patterns |
| [Cross-Layer Thinking Guide](./cross-layer-thinking-guide.md) | Think through data flow across layers | Features spanning multiple layers |

---

## Quick Reference: Thinking Triggers

### When to Think About Cross-Layer Issues

- [ ] Feature touches 2+ of: server API → NestJS service → frontend store → screen component
- [ ] Data format changes between layers (e.g., `CourseDTO` → `MeditationCourse`)
- [ ] Multiple consumers need the same data (e.g., HomeScreen + DiscoverScreen + PlayerScreen)
- [ ] You're modifying the response envelope shape (`{ status, data }`)
- [ ] You're adding a new API endpoint that both mini-app and mobile-app will consume
- [ ] You're changing a Drizzle schema column that maps to a frontend type

→ Read [Cross-Layer Thinking Guide](./cross-layer-thinking-guide.md)

### When to Think About Code Reuse

- [ ] You're writing similar code to something that exists (e.g., another `toMeditationCourse()` copy)
- [ ] You see the same pattern repeated 3+ times
- [ ] You're adding a new field to both the Drizzle schema AND the frontend model
- [ ] **You're modifying a category map, level label, or constant** — check `store/constants.ts` first
- [ ] **You're creating a new utility/helper function** — search `lib/utils.ts`, `meditation.ts` helpers, and `repositories/` first
- [ ] Two screens parse the same API response with local type casts
- [ ] Multiple stores reference the same data (e.g., `useCoursesStore` + `CourseRepository` + `meditation.ts` helpers)

→ Read [Code Reuse Thinking Guide](./code-reuse-thinking-guide.md)

### When Verifying AI Cross-Review Results

- [ ] Reviewer claims "missing auth" → Check if the route uses `@Public()` decorator intentionally
- [ ] Reviewer flags "hardcoded localhost" → Is it in mobile-app/network.ts (known issue) or a new occurrence?
- [ ] Reviewer says "no error handling" → Check if the controller returns the error envelope with HTTP 200 (the project's convention)
- [ ] Reviewer identifies a "bug" in a store → Does the store use `persist` middleware? Is the data actually persisted?

**Common AI reviewer false-positive patterns for this project**:
1. **Auth confusion**: Flagging `@Public()` routes as missing authentication — public routes are intentional.
2. **HTTP status confusion**: Flagging "error returns 200" as wrong — this is the project's deliberate convention (envelope pattern).
3. **Sync/async confusion**: Flagging `await` on better-sqlite3 calls — these are synchronous but `await` is a no-op, not a bug.
4. **i18n false positives**: Flagging hardcoded strings that ARE translated via `t()` but the reviewer didn't trace the i18n call.

**Verification rule**: Every finding must be verified against the actual code before prioritizing.

---

## Pre-Modification Rule (CRITICAL)

> **Before changing ANY value, ALWAYS search first!**

```bash
# Example: before changing a category mapping
grep -r "body-scan" mini-app/src/ mobile-app/src/ server/src/
```

This single habit prevents "forgot to update X" bugs — especially across the three workspaces.

---

## How to Use This Directory

1. **Before coding**: Skim the relevant thinking guide
2. **During coding**: If something feels repetitive or complex, check the guides
3. **After bugs**: Add new insights to the relevant guide (learn from mistakes)

---

**Core Principle**: 30 minutes of thinking saves 3 hours of debugging — especially in a monorepo where changes ripple across mini-app, mobile-app, and server.

---

## Global Constraint Documents

These root-level documents define hard constraints across all three workspaces:

| Document | Purpose | When to Reference |
|----------|---------|-------------------|
| [CODE_SPECIFICATION_CONSTRAINTS.md](../../../CODE_SPECIFICATION_CONSTRAINTS.md) | Code specification rules (naming, patterns, forbidden patterns) | Before writing code in any workspace |
| [ARCHITECTURE_CONSTRAINTS.md](../../../ARCHITECTURE_CONSTRAINTS.md) | Architectural boundaries, module rules, cross-layer contracts | Before designing new modules or modifying architecture
