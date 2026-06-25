---
name: gdpr
description: >-
  Initialize and maintain this project's GDPR compliance. Use when the user wants to set
  up their privacy policy / imprint, add a new table to the data registry, audit the
  codebase for unregistered personal data or ungated third-party data flows, or
  regenerate the ROPA. Subcommands: init, add-table, audit, ropa.
argument-hint: "[init | add-table <name> | audit | ropa]"
---

# GDPR skill

This project treats GDPR as a first-class, code-enforced concern. The rules live in
`AGENTS.md` (the "GDPR constitution"). The moving parts:

- `src/lib/gdpr/registry.ts` — **the single source of truth** for personal data. Every
  table with PII has a record here. Drives export, erasure, and the ROPA.
- `src/lib/gdpr/config.ts` — controller / org details (entity, address, sub-processors).
- `src/lib/gdpr/{export,erase,audit,requests}.ts` — the engine (don't rewrite; extend
  the registry instead).
- `src/lib/gdpr/ropa.ts` + `scripts/gdpr-ropa.ts` — generate `docs/ropa.md`.
- `src/routes/legal/{privacy,imprint}/` — public legal pages, rendered from config + registry.
- `src/routes/account/privacy/` — the data-subject self-service dashboard.

**Always finish by reminding the user that these templates are a compliant-by-construction
starting point, not legal advice — the generated policy/imprint should be reviewed before
they rely on it.**

Route on the argument after `/gdpr`. If it's empty, print the help summary at the bottom.

---

## `init` — set up the controller details + legal pages

1. Interview the user for the controller details. Prefer the `AskUserQuestion` tool for
   discrete choices, plain questions otherwise. Collect:
   - Legal entity / sole-trader name
   - Responsible natural person (for the imprint)
   - Full postal address
   - Contact email (ideally a privacy@ address)
   - Phone (optional)
   - Whether a Data Protection Officer is appointed (most small projects: no)
   - Jurisdiction / country
   - Competent supervisory authority (for complaints)
   - Where data is hosted (e.g. "Germany (EU)")
   - **Sub-processors**: every external service that touches personal data (hosting,
     email, analytics, external AI, payments…). For each: name, purpose, location, and —
     if outside the EU/EEA — the transfer safeguard (e.g. "EU Standard Contractual Clauses").
2. Write the answers into `src/lib/gdpr/config.ts`, replacing the `[placeholder]` values.
   Populate the `subProcessors` array. Set `policyVersion` and `policyLastUpdated` to today.
3. Regenerate the ROPA: run `bun scripts/gdpr-ropa.ts`.
4. Tell the user to review `/legal/privacy` and `/legal/imprint` (now filled in) and the
   refreshed `docs/ropa.md`.
5. Note: if they added external sub-processors, the relevant data flows should be
   consent-gated (see the constitution) — offer to wire that when the feature exists.

## `add-table <name>` — register a new table that holds personal data

Use this whenever a feature adds a table containing data about a user.

1. Locate the table definition (search `src/db/*.schema.ts` / `src/db/schema.ts`). Read its
   columns and find the column that references the user id (often `userId`).
2. Ask the user for: the processing **purpose**, the **lawful basis** (contract / consent /
   legal obligation / legitimate interest), and the **retention** period. Ask whether any
   column is a secret/credential that must be excluded from exports, and whether the record
   is under a legal-retention obligation (→ `erase: "anonymize"` instead of `delete`).
3. Add a `PersonalDataRecord` to the `records` array in `src/lib/gdpr/registry.ts`, mirroring
   the existing entries (key, table, userColumn, export, erase, fields, purpose, lawfulBasis,
   retention, order). Import the table at the top of the file.
4. Remind the user to apply the schema (`bun run db:push`) and regenerate the ROPA
   (`bun scripts/gdpr-ropa.ts`). Verify with `bun run check`.

## `audit` — find compliance gaps

Produce a report, not silent fixes. Steps:

1. Read every Drizzle table (`src/db/*.ts`). Build the list of (table, columns).
2. Flag tables containing **PII-looking columns** — `email`, `name`, `phone`, `address`,
   `ip`/`ip_address`, `user_agent`, `dob`/`birth`, `location`, `lat`/`lng`, free-text notes —
   that are **not** present in `src/lib/gdpr/registry.ts`. Each is a likely compliance bug
   (constitution rule 1).
3. Grep for **ungated third-party data flows**: `fetch(`, `axios`, and known provider SDKs
   (e.g. `openai`, `anthropic`, `resend`, `stripe`) in server code. For each, check whether
   it's behind a consent check; report any that send user data without one (rule 2).
4. Check **registry ↔ schema drift**: every table referenced in the registry should still
   exist; report stale entries.
5. Output a concise checklist of findings with the concrete fix for each (usually
   "run `/gdpr add-table <name>`" or "add a consent gate").

## `ropa` — regenerate the Record of Processing Activities

1. Run `bun scripts/gdpr-ropa.ts`.
2. Confirm `docs/ropa.md` updated and summarise what changed (e.g. new activity, new
   sub-processor). If the controller block still shows placeholders, suggest `/gdpr init`.

---

## Help (no/unknown argument)

Show this:

```
/gdpr — GDPR compliance for this project

  init              Interview + fill controller details, policy, imprint, ROPA
  add-table <name>  Register a new personal-data table into the registry
  audit             Scan for unregistered PII and ungated third-party data flows
  ropa              Regenerate docs/ropa.md from the registry + config
```
