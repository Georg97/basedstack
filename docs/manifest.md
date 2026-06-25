# BasedStack — Build Manifest

**This is the single source of truth for in-flight work.** When more than one agent
(or person) is changing the repo at once, read this file first, claim what you're
touching, and update the status as you go. It keeps parallel efforts from colliding
on the same files.

> Convention for agents: before editing, check the **File ownership map** below. If a
> file is owned by another workstream, only touch it through the agreed seam (e.g.
> append-only re-export), and note it in that workstream's task list.

---

## Workstreams

| ID | Workstream | Owner | Branch | Status |
|----|-----------|-------|--------|--------|
| `realtime` | Postgres migration + LISTEN/NOTIFY realtime layer | Agent A | `feat/pg-realtime` | ✅ done |
| `gdpr` | GDPR / data-protection framework | Agent B (this) | `feat/pg-realtime` (shared) | 🟡 in progress (Phase 1 done) |

The `realtime` workstream is complete, so the collision-avoidance dance is no longer
load-bearing — the seams below still document how the pieces fit, but `gdpr` can now
edit freely without coordinating around a live parallel agent.

---

## File ownership map

Ownership = "who may make structural changes." Anyone may read anything.

| Path | Owner | Notes |
|------|-------|-------|
| `src/db/schema.ts` | `realtime` | **Shared seam:** `gdpr` is allowed exactly ONE append-only line at the end — `export * from './gdpr.schema';` — so migrations see the GDPR tables. No other `gdpr` edits here. |
| `src/db/gdpr.schema.ts` | `gdpr` | All GDPR tables live here, isolated from the auth/realtime tables. |
| `src/index.ts` | `realtime` | DB + `sql` client. `gdpr` imports `db`/`sql`, does not edit. |
| `src/lib/server/realtime.ts` | `realtime` | `gdpr` imports `notify()`, does not edit. |
| `src/lib/auth.ts` | `realtime` / auth | `gdpr` does not edit (better-auth picks up new schema exports automatically). |
| `src/lib/gdpr/**` | `gdpr` | The engine. |
| `src/routes/account/**` | `gdpr` | Privacy dashboard + data-export endpoint. |
| `src/routes/legal/**` | `gdpr` | Privacy policy / imprint (later phase). |
| `CLAUDE.md`, `AGENTS.md`, `docs/**` | shared | Coordinate edits; append where possible. |
| `drizzle/**` (migrations) | shared | See **Migrations** below — generate together, never two uncoordinated `generate` runs. |

---

## Shared interface contracts

These are the agreed seams between `realtime` and `gdpr`. Don't change one side
without updating this section.

1. **Schema seam.** GDPR tables are defined in `src/db/gdpr.schema.ts` and surfaced to
   drizzle-kit via a single `export * from './gdpr.schema';` appended to
   `src/db/schema.ts`. This is the only `gdpr` write to a `realtime`-owned file.
2. **Realtime audit channel.** GDPR emits `notify('audit', <event>)` after privacy
   events (export, erasure, consent change). A future admin dashboard can
   `subscribe('audit')`. The `audit` channel name is reserved for GDPR.
3. **Pseudonymisation salt.** GDPR reuses `BETTER_AUTH_SECRET` as the hash salt for
   pseudonyms (override with `GDPR_PSEUDONYM_SALT`). No new required env var.
4. **No FK from `audit_log` to `user`.** The audit log must survive user erasure, so
   `audit_log.subject` is a plain column, not a foreign key. Do not add a FK.

---

## Decisions log

Locked decisions for the GDPR workstream (so they aren't re-litigated):

- **D1 — Manifest location:** in-repo `docs/manifest.md` is canonical (this file).
- **D2 — Erasure default:** hard-delete + per-record `anonymize` override. Records
  under legal retention are flagged `erase: 'anonymize'` in the registry; everything
  else is deleted. The `audit_log` is the canonical anonymise-override (kept as
  pseudonymised compliance evidence).
- **D3 — First-pass scope:** coordination layer + core engine (registry, export,
  erasure) + `/account/privacy` page. No consent banner / legal pages / skill yet.
- **D4 — Scaffolder mode:** GDPR is **always-on** in the base template (no opt-in
  flag). `create-basedstack` must stop deleting the GDPR `.claude`/docs and must
  point at `basedstack` (not the old `dabsstack`).

---

## Migrations

This project syncs the schema with `drizzle-kit push` (`bun run db:push`) rather than
generated migration files — `drizzle/` is intentionally empty. `drizzle.config.ts` reads
`./src/db/schema.ts`, which re-exports the GDPR tables, so a single push covers both
workstreams.

**Status:** the GDPR tables (`consent`, `data_request`, `audit_log`) have been pushed and
are live in the local DB, alongside the auth + realtime (`messages`) tables. The engine
has been verified end-to-end against the real DB (export returns the registered records,
erasure deletes + pseudonymises the audit trail).

If you later want versioned migrations for production, switch to `db:generate` +
`db:migrate` — but that's a deliberate change, not the current setup.

---

## GDPR workstream — task board

Status: ⬜ todo · 🟡 in progress · ✅ done · 🚧 blocked

### Phase 0 — Coordination (this pass)
- ✅ `docs/manifest.md` — this file
- ✅ `CLAUDE.md` + `AGENTS.md` — GDPR constitution + repo guide
- ✅ Decisions D1–D4 recorded

### Phase 1 — Core engine (this pass)
- ✅ `src/db/gdpr.schema.ts` — `consent`, `data_request`, `audit_log` tables
- ✅ Schema seam — append `export * from './gdpr.schema';` to `schema.ts`
- ✅ `src/lib/gdpr/registry.ts` — the declarative PII registry (single source of truth)
- ✅ `src/lib/gdpr/export.ts` — registry-driven data export (Art. 15/20)
- ✅ `src/lib/gdpr/erase.ts` — registry-driven erasure (Art. 17)
- ✅ `src/lib/gdpr/audit.ts` — append-only audit log + realtime ping
- ✅ `src/lib/gdpr/requests.ts` — DSAR record helpers
- ✅ `src/lib/gdpr/pseudonymize.ts` — stable non-reversible subject tokens
- ✅ `src/routes/account/privacy/+page.{server.ts,svelte}` — self-service dashboard
- ✅ `src/routes/account/privacy/export/+server.ts` — JSON download endpoint
- ✅ Pushed GDPR tables to the local DB (`bun run db:push`)
- ✅ Verified end-to-end: export returns data, erasure deletes + anonymises audit log

### Phase 2 — Consent + AI gate (next pass)
- ⬜ `<ConsentBanner>` component + granular categories
- ⬜ `requireConsent('ai-external')` gate for external AI escalation
- ⬜ Consent write/withdraw wired to the `consent` table + audit log

### Phase 3 — Legal templates + ROPA ✅ done
- ✅ `src/lib/gdpr/config.ts` — controller/org config (single source for legal pages + ROPA)
- ✅ `src/lib/gdpr/ropa.ts` + `scripts/gdpr-ropa.ts` — ROPA generated from registry + config
- ✅ `docs/ropa.md` — generated Record of Processing Activities
- ✅ `/legal/privacy` — policy rendered from config + the registry's processing table
- ✅ `/legal/imprint` — Impressum rendered from config
- ✅ Sub-processor registry in config (feeds policy + ROPA + international-transfer detection)
- ✅ Footer + login links to the legal pages (transparency / easy accessibility)

### Phase 4 — Retention jobs (next pass)
- ⬜ In-process scheduled purge of expired sessions, verifications, export artifacts
- ⬜ Grace-period purge of soft-deleted accounts

### Phase 5 — The GDPR skill ✅ done
- ✅ `scaffold/.claude/skills/gdpr/SKILL.md` — `init`, `add-table`, `audit`, `ropa`
- ✅ `init` interviews the user → fills config → regenerates policy/imprint/ROPA
- ✅ Lives under `scaffold/` (the clean project template), **not** this repo's dev
  `.claude/` — it's a tool for *using* the stack, not *developing* it. Phase 6 promotes it.

### Phase 6 — Scaffolder wiring (`create-basedstack`)
Decision (per maintainer): **construct a clean `.claude` for generated projects from the
`scaffold/` template — do NOT ship this repo's dev `.claude`/manifest.** The dev tooling is
bound to *developing* the stack; a generated project needs project-facing assets only.
- ⬜ Repoint `giget` source `dabsstack` → `basedstack`; rename package `create-dabsstack` → `create-basedstack`
- ⬜ Promote `scaffold/.claude` → `.claude` in the new project, then delete `scaffold/`
- ⬜ Strip dev-only material from the generated project: `docs/manifest.md`, and swap the
  dev `CLAUDE.md`/`AGENTS.md` for clean project-facing versions (add those under `scaffold/`)
- ⬜ Keep the existing `.claude`-removal step for the dev repo's own (untracked) `.claude`
