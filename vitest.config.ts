import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['test/**/*.test.ts'],
		// The suite hits a real Postgres (see test/README). Run files serially so
		// LISTEN/NOTIFY channels and the messages table don't interleave.
		fileParallelism: false
	}
});
