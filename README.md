# basedstack

A simple, self-hostable SvelteKit stack with realtime built in — no extra services.

- **SvelteKit** (remote functions, incl. experimental `query.live`) + **Svelte 5**
- **Postgres** via **Drizzle ORM** — also the realtime layer, via `LISTEN`/`NOTIFY`
- **Better Auth** (email/password + Google)
- **Tailwind CSS v4** + **shadcn-svelte** / bits-ui
- **SuperForms** + **Zod**
- **adapter-node** — runs anywhere a Node process can: a single VPS or a home server

## Getting started

```sh
cp .env.template .env   # then set BETTER_AUTH_SECRET
docker compose up -d    # local Postgres (matches DATABASE_URL in .env.template)
bun install
bun run db:push         # create the schema
bun run dev
```

## Realtime

Realtime is just Postgres. A `query.live` reads data and re-reads it whenever a
`NOTIFY` fires; a `command`/`form` writes and then notifies. Every connected
client shares one server-side stream, so one write fans out to all of them.

```ts
// src/routes/data.remote.ts
export const liveMessages = query.live(async function* () {
	const { request } = getRequestEvent();
	yield await recentMessages();
	for await (const _ of subscribe('messages', { signal: request.signal })) {
		yield await recentMessages();
	}
});

export const sendMessage = command(schema, async (text) => {
	await db.insert(messages).values({ /* ... */ });
	await notify('messages'); // wakes every liveMessages stream
});
```

The primitives live in [`src/lib/server/realtime.ts`](src/lib/server/realtime.ts)
(`subscribe`, `notify`). Because `LISTEN`/`NOTIFY` needs a persistent connection,
point `DATABASE_URL` at Postgres directly — not at a transaction-mode pooler — and
keep the Node server long-running (hence adapter-node).

See the landing page's "Realtime" section for a working live-chat demo.

## Testing

Integration tests run against a real Postgres (see [`test/`](test/)):

```sh
docker compose up -d
bun run test
```

## Building

```sh
bun run build      # outputs a Node server (adapter-node)
bun run preview
```
