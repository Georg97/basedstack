# agent guide for BasedStack

BasedStack is an opinionated, EU-friendly full-stack starter. Goals: simple, great DX,
cheap & easy to self-host, low complexity, AI support from day one, realtime built in,
and **first-class GDPR compliance**. It is designed for one-person projects that must
stay compliant without drowning in provider contracts — hence the bias toward
self-hosting and local-first AI.

> **Coordination:** Multiple agents may work here at once. **Read `docs/manifest.md`
> first** — it owns the task board, file-ownership map, and the seams between
> workstreams (currently `realtime` and `gdpr`). Claim your files there before editing.

## Stack

- **SvelteKit 2 + Svelte 5** (runes), `adapter-node` (long-running server, needed for realtime).
- **Postgres** via `postgres.js` + **Drizzle ORM**. One client (`src/index.ts`) shared by
  queries and realtime.
- **better-auth** (email/password + Google OAuth). Tables: `user`, `session`, `account`,
  `verification` in `src/db/schema.ts`.
- **Realtime** via Postgres `LISTEN/NOTIFY` (`src/lib/server/realtime.ts`) driving SvelteKit
  `query.live` remote functions. No extra services.
- **UI:** Tailwind v4 + shadcn-svelte components in `src/lib/components/ui`, Lucide icons.

## Commands

```bash
docker compose up -d          # local Postgres
bun run dev                   # dev server
bun run db:push               # sync schema.ts to the DB (this project's workflow; drizzle/ is empty by design)
bun run check                 # svelte-check (typecheck)
```

## GDPR constitution — rules every agent MUST follow

GDPR is a first-class concern, enforced in code, not an afterthought. When you write or
change code in this repo:

1. **Register all personal data.** Any table that stores data about a user MUST have a
   record in `src/lib/gdpr/registry.ts`. The registry is the single source of truth that
   drives data export, erasure, and the processing register. A new PII table that isn't
   registered is a compliance bug.
2. **No silent third-party data flows.** Any code that sends user data to an external
   service (AI provider, email, analytics, …) MUST be gated behind a consent check and
   the provider MUST be recorded as a sub-processor. Local/browser-GPU AI is the default
   precisely because it keeps data on-device with no sub-processor.
3. **Erasure must stay correct.** "Delete my data" is driven by the registry
   (`src/lib/gdpr/erase.ts`): hard-delete by default, `anonymize` only for records under
   a legal-retention obligation. If you add a table, decide its erase strategy explicitly.
4. **The audit log is evidence.** `audit_log` is append-only and survives user erasure
   (its `subject` is pseudonymised, not deleted, and it has no FK to `user`). Don't add a
   FK to it and don't delete from it on erasure.
5. **Data minimisation by default.** Don't collect a field you don't need. Don't log PII.
   Prefer nullable/short-retention columns.
6. **Privacy-affecting changes update the manifest.** New PII tables, new sub-processors,
   or new external data flows get noted in `docs/manifest.md`.

If a task conflicts with these rules, surface it rather than silently working around it.

## Architecture pointers

- DB client + Drizzle instance: `src/index.ts` (`db`, `sql`).
- Auth: `src/lib/auth.ts` (server), `src/lib/auth-client.ts` (client),
  `src/hooks.server.ts` (session → `locals.user` / `locals.session`).
- Realtime primitives: `src/lib/server/realtime.ts` (`notify`, `subscribe`).
- GDPR engine: `src/lib/gdpr/` (registry, export, erase, audit, requests, pseudonymize).
- Data-subject dashboard: `src/routes/account/privacy/`.

