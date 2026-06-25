// Integration test for the realtime layer. Requires a running Postgres
// (`docker compose up -d`) reachable via DATABASE_URL.
import { afterAll, describe, expect, it } from 'vitest';
import { notify, subscribe } from '../src/lib/server/realtime';
import { sql } from '../src/index';

afterAll(async () => {
	await sql.end();
});

async function collect(channel: string, ac: AbortController, out: string[]) {
	for await (const payload of subscribe(channel, { signal: ac.signal })) {
		out.push(payload);
	}
}

describe('realtime LISTEN/NOTIFY', () => {
	it('fans one NOTIFY out to every subscriber, in order', async () => {
		const channel = 'realtime_test';
		const ac = new AbortController();
		const a: string[] = [];
		const b: string[] = [];
		const consumers = Promise.all([collect(channel, ac, a), collect(channel, ac, b)]);

		await new Promise((r) => setTimeout(r, 300)); // let both LISTENs register
		await notify(channel, 'first');
		await notify(channel, 'second');
		await new Promise((r) => setTimeout(r, 300));

		ac.abort();
		await consumers;

		expect(a).toEqual(['first', 'second']);
		expect(b).toEqual(['first', 'second']);
	});

	it('stops listening once the signal aborts', async () => {
		const channel = 'realtime_test';
		const ac = new AbortController();
		const received: string[] = [];
		const consumer = collect(channel, ac, received);

		ac.abort();
		await consumer;

		await notify(channel, 'after-abort');
		await new Promise((r) => setTimeout(r, 200));

		expect(received).toEqual([]);
	});
});
