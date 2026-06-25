// Realtime primitives built on Postgres LISTEN/NOTIFY.
//
// This is the whole realtime layer: a writer sends NOTIFY after a mutation, and
// every live subscriber wakes up and re-reads the data it cares about. No extra
// services, no replication slots — just Postgres and a long-running server
// (which is why svelte.config.js uses adapter-node).
//
// Pair `subscribe()` with a SvelteKit `query.live` and `notify()` with a
// `command`/`form`. See src/routes/data.remote.ts for the canonical example.
import { sql } from '../../index';

/**
 * Send a Postgres `NOTIFY` on `channel`. Call this after a write so every
 * `subscribe(channel)` listener — and thus every connected `query.live` — wakes up.
 *
 * Postgres caps the payload at 8000 bytes, so prefer sending a small signal (or
 * nothing) and letting subscribers re-query, rather than shipping rows through here.
 */
export function notify(channel: string, payload = ''): Promise<unknown> {
	return sql.notify(channel, payload);
}

/**
 * Subscribe to a Postgres `LISTEN` channel as an async iterable of payloads.
 *
 * Bridges postgres.js's callback-based `sql.listen` into an async generator so it
 * can drive a SvelteKit `query.live`. Notifications that arrive between iterations
 * are buffered, so none are dropped.
 *
 * Pass the request's `AbortSignal` (`getRequestEvent().request.signal`) so the
 * underlying `LISTEN` is released the moment the client disconnects — otherwise a
 * generator parked waiting for the next notification can leak the subscription.
 */
export async function* subscribe(
	channel: string,
	options: { signal?: AbortSignal } = {}
): AsyncGenerator<string> {
	const { signal } = options;
	if (signal?.aborted) return;

	const queue: string[] = [];
	let wake: (() => void) | null = null;
	const ping = () => {
		const resume = wake;
		wake = null;
		resume?.();
	};

	signal?.addEventListener('abort', ping, { once: true });

	const subscription = await sql.listen(channel, (payload) => {
		queue.push(payload);
		ping();
	});

	try {
		while (!signal?.aborted) {
			if (queue.length === 0) {
				await new Promise<void>((resolve) => (wake = resolve));
				continue;
			}
			yield queue.shift()!;
		}
	} finally {
		signal?.removeEventListener('abort', ping);
		await subscription.unlisten();
	}
}
