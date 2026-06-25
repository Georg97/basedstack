# scaffold/ — the clean project template

This directory holds assets that belong to a **scaffolded project** (someone *using*
basedstack), not to the work of *developing* basedstack itself. The `create-basedstack`
CLI promotes the contents of `scaffold/` into the new project and then removes this
directory (Phase 6 in `docs/manifest.md`).

The split exists on purpose: this repo's own `.claude/`, `docs/manifest.md`, and the
dev-oriented `CLAUDE.md`/`AGENTS.md` are about *building the stack* and should never ship
to a generated app. A fresh project instead gets a **clean** `.claude` and project-facing
docs from here.

## Contents

```
scaffold/
  .claude/
    skills/
      gdpr/
        SKILL.md     # the /gdpr skill end users run to set up & maintain compliance
```

## How the scaffolder uses it (planned, Phase 6)

1. Clone basedstack into the target directory.
2. Move `scaffold/.claude` → `.claude` (the clean, project-facing `.claude`).
3. Remove dev-only material that shouldn't ship: this repo's own untracked `.claude/`,
   `docs/manifest.md`, and replace `CLAUDE.md`/`AGENTS.md` with clean project-facing
   versions (to be added here).
4. Delete `scaffold/` itself.

## Adding to the template

Anything a *generated project* should have but the *stack-dev workflow* should not — put
it here. Candidates beyond the `gdpr` skill: a project-facing `CLAUDE.md`/`AGENTS.md`, and
any other end-user skills.
