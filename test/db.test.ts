// Integration test for the drizzle/postgres data path. Requires a running
// Postgres (`docker compose up -d`) reachable via DATABASE_URL.
import { afterAll, expect, it } from 'vitest';
import { desc, eq } from 'drizzle-orm';
import { db, sql } from '../src/index';
import { messages } from '../src/db/schema';

afterAll(async () => {
	await sql.end();
});

it('inserts and reads back a message, mapping timestamp to Date', async () => {
	const id = crypto.randomUUID();
	await db.insert(messages).values({ id, author: 'vitest', text: 'hello pg' });

	const rows = await db
		.select()
		.from(messages)
		.orderBy(desc(messages.createdAt))
		.limit(20);
	const found = rows.find((r) => r.id === id);

	expect(found?.text).toBe('hello pg');
	expect(found?.author).toBe('vitest');
	expect(found?.createdAt).toBeInstanceOf(Date);

	await db.delete(messages).where(eq(messages.id, id)); // keep the table clean
});
