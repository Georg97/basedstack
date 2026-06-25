# Tests

These are integration tests that exercise the real data + realtime layer, so
they need a Postgres instance reachable via `DATABASE_URL`.

```bash
docker compose up -d   # start local Postgres
bun run db:push        # ensure the schema exists
bun run test           # run once
bun run test:watch     # watch mode
```

- `db.test.ts` — drizzle insert/select round-trip against Postgres.
- `realtime.test.ts` — `subscribe`/`notify` fan-out over LISTEN/NOTIFY.
