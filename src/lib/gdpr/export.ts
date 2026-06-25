import { eq, getTableColumns } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { db } from "../../index";
import { registry } from "./registry";

export interface DataExport {
  subjectId: string;
  generatedAt: string;
  notice: string;
  /** One entry per registered, exportable record, keyed by its registry `key`. */
  records: Record<string, unknown[]>;
}

/**
 * Collect everything we hold about a subject into a portable JSON structure
 * (Art. 15 access / Art. 20 portability). Walks the registry, so a newly-registered
 * table is included automatically — excluded columns (tokens, password hashes) are
 * stripped per the registry's `export` rule.
 */
export async function exportUserData(subjectId: string): Promise<DataExport> {
  const records: Record<string, unknown[]> = {};

  for (const rec of registry.records) {
    if (rec.export === false) continue;
    const exclude = new Set(typeof rec.export === "object" ? rec.export.exclude : []);

    const table = rec.table as PgTable & Record<string, PgColumn>;
    const columns = getTableColumns(table);
    const rows = (await db
      .select()
      .from(table)
      .where(eq(table[rec.userColumn], subjectId))) as Record<string, unknown>[];

    records[rec.key] = rows.map((row) => {
      const clean: Record<string, unknown> = {};
      for (const name of Object.keys(columns)) {
        if (!exclude.has(name)) clean[name] = row[name];
      }
      return clean;
    });
  }

  return {
    subjectId,
    generatedAt: new Date().toISOString(),
    notice:
      "This file contains the personal data we hold about you, exported under GDPR " +
      "Articles 15 and 20. Keep it somewhere safe.",
    records,
  };
}
