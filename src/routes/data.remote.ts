import { query, command, getRequestEvent } from '$app/server';
import { desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../index';
import { messages } from '../db/schema';
import { subscribe, notify } from '$lib/server/realtime';

const MESSAGES_CHANNEL = 'messages';

// Simple SSR demo: resolved on the server before the page renders.
export const getTags = query(async () => {
	return ['Postgres', 'LISTEN/NOTIFY', 'query.live', 'SvelteKit'];
});

async function recentMessages() {
	const rows = await db
		.select()
		.from(messages)
		.orderBy(desc(messages.createdAt))
		.limit(20);
	// newest-first from the DB, oldest-first for a chat transcript
	return rows.reverse();
}

// Realtime query: yields the current messages, then re-yields whenever a
// NOTIFY fires on the channel. Every connected client shares one server-side
// stream, so a single write fans out to all of them.
export const liveMessages = query.live(async function* () {
	const { request } = getRequestEvent();
	yield await recentMessages();
	for await (const _ of subscribe(MESSAGES_CHANNEL, { signal: request.signal })) {
		yield await recentMessages();
	}
});

// Mutation: insert a row, then NOTIFY so every liveMessages stream refreshes.
export const sendMessage = command(z.string().trim().min(1).max(500), async (text) => {
	const { locals } = getRequestEvent();
	await db.insert(messages).values({
		id: crypto.randomUUID(),
		author: locals.user?.name ?? 'anon',
		text
	});
	await notify(MESSAGES_CHANNEL);
});
