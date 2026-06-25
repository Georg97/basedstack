import { eq } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { db } from "../../index";
import { registry, type FieldStrategy } from "./registry";
import { pseudonym } from "./pseudonymize";
import { audit } from "./audit";

const REDACTED = "[redacted]";

function scrub(strategy: FieldStrategy, subjectId: string): unknown {
  switch (strategy) {
    case "pseudonymize":
      return pseudonym(subjectId);
    case "redact":
      return REDACTED;
    case "null":
      return null;
  }
}

/**
 * Erase a subject (Art. 17). Hard-deletes by default; records the registry flags
 * `erase: "anonymize"` are kept but stripped of identifying fields (e.g. the audit
 * log, retained as pseudonymised compliance evidence).
 *
 * Runs in a transaction, processing records by ascending `order` so dependents and
 * anonymisations happen before the `user` anchor is deleted.
 */
export async function eraseUserData(
  subjectId: string,
  context: { ipAddress?: string | null } = {},
): Promise<void> {
  const ordered = [...registry.records].sort((a, b) => (a.order ?? 50) - (b.order ?? 50));

  await db.transaction(async (tx) => {
    for (const rec of ordered) {
      const table = rec.table as PgTable & Record<string, PgColumn>;
      const column = table[rec.userColumn];
      const strategy = rec.erase ?? "delete";

      if (strategy === "retain") continue;

      if (strategy === "anonymize") {
        const set: Record<string, unknown> = {};
        for (const [field, fieldStrategy] of Object.entries(rec.fields ?? {})) {
          set[field] = scrub(fieldStrategy, subjectId);
        }
        if (Object.keys(set).length > 0) {
          await tx.update(table).set(set).where(eq(column, subjectId));
        }
        continue;
      }

      // strategy === "delete"
      await tx.delete(table).where(eq(column, subjectId));
    }
  });

  // Recorded after the transaction with a pseudonymised subject, so the erasure itself
  // leaves anonymised evidence rather than a fresh identifying row.
  await audit({
    subject: pseudonym(subjectId),
    event: "data.erased",
    detail: { at: new Date().toISOString() },
    ipAddress: context.ipAddress ?? null,
  });
}
