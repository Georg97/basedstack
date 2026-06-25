import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './db/schema';

// Single postgres.js client, shared by Drizzle (queries) and the realtime
// helper (LISTEN/NOTIFY). postgres.js manages a dedicated connection for
// listeners internally, so reusing this instance is safe.
export const sql = postgres(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
