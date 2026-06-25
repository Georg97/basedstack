// The PII registry — the single source of truth for personal data in this app.
//
// Every table that stores data about a user is listed here. THREE things read this
// registry, so one entry keeps them all in sync:
//   - export.ts  → "download my data" (Art. 15 access / Art. 20 portability)
//   - erase.ts   → "delete my data"   (Art. 17 erasure)
//   - (later) the ROPA generator     (Art. 30 records of processing)
//
// When you add a feature table that holds personal data, add a record below. The
// CLAUDE.md GDPR constitution requires it; an unregistered PII table is a compliance bug.
import type { PgTable } from "drizzle-orm/pg-core";
import { user, session, account } from "../../db/schema";
import { consent, dataRequest, auditLog } from "../../db/gdpr.schema";

/** What "delete my data" does to a record. */
export type EraseStrategy =
  | "delete" // remove the rows entirely (default)
  | "anonymize" // keep the rows but strip identifying fields (for legal-retention data)
  | "retain"; // leave untouched (use sparingly — must be legally justified)

/** How a single column is scrubbed when its record is anonymised. */
export type FieldStrategy =
  | "redact" // replace with a fixed placeholder
  | "pseudonymize" // replace with a stable, non-reversible token for this subject
  | "null"; // set to NULL (column must be nullable)

export interface PersonalDataRecord {
  /** Friendly key used in export bundles and the privacy dashboard. */
  key: string;
  /** The Drizzle table holding the data. */
  table: PgTable;
  /** Column on `table` that references the data subject's user id. */
  userColumn: string;
  /** True for the row that *is* the subject (the `user` row). */
  anchor?: boolean;
  /** Include in export bundles. `{ exclude }` drops sensitive columns (tokens, etc.). */
  export?: boolean | { exclude: string[] };
  /** Erase strategy. Defaults to "delete". */
  erase?: EraseStrategy;
  /** Per-column scrubbing when `erase === "anonymize"`. */
  fields?: Record<string, FieldStrategy>;
  // --- ROPA metadata (Art. 30), also surfaced in the privacy dashboard ---
  purpose?: string;
  lawfulBasis?: string;
  retention?: string;
  /** Erasure order: lower runs first (dependents before the user anchor). */
  order?: number;
}

export interface Registry {
  /** How a data subject is identified. */
  subject: { table: PgTable; idColumn: string };
  records: PersonalDataRecord[];
}

export const registry: Registry = {
  subject: { table: user, idColumn: "id" },
  records: [
    {
      key: "profile",
      table: user,
      userColumn: "id",
      anchor: true,
      export: { exclude: [] },
      erase: "delete",
      purpose: "Account and authentication",
      lawfulBasis: "Contract (Art. 6(1)(b))",
      retention: "For the lifetime of the account",
      order: 100, // anchor deleted last
    },
    {
      key: "sessions",
      table: session,
      userColumn: "userId",
      export: { exclude: ["token"] },
      erase: "delete",
      purpose: "Keeping you signed in",
      lawfulBasis: "Contract (Art. 6(1)(b))",
      retention: "Until expiry or sign-out",
      order: 10,
    },
    {
      key: "linkedAccounts",
      table: account,
      userColumn: "userId",
      export: { exclude: ["password", "accessToken", "refreshToken", "idToken", "scope"] },
      erase: "delete",
      purpose: "Social and password login",
      lawfulBasis: "Contract (Art. 6(1)(b))",
      retention: "Until you unlink or delete the account",
      order: 10,
    },
    {
      key: "consents",
      table: consent,
      userColumn: "userId",
      export: true,
      erase: "delete",
      purpose: "Recording your consent choices",
      lawfulBasis: "Legal obligation (Art. 6(1)(c))",
      retention: "Until account deletion",
      order: 10,
    },
    {
      key: "dataRequests",
      table: dataRequest,
      userColumn: "userId",
      export: true,
      erase: "delete",
      purpose: "Handling your privacy requests",
      lawfulBasis: "Legal obligation (Art. 6(1)(c))",
      retention: "Until account deletion",
      order: 10,
    },
    {
      // The canonical "anonymize override": the audit log is kept as compliance
      // evidence and pseudonymised on erasure rather than deleted.
      key: "auditLog",
      table: auditLog,
      userColumn: "subject",
      export: false,
      erase: "anonymize",
      fields: { subject: "pseudonymize" },
      purpose: "Proving we honoured your privacy requests",
      lawfulBasis: "Legal obligation (Art. 6(1)(c))",
      retention: "Retained as anonymised evidence",
      order: 1, // anonymised first, before any deletes
    },
  ],
};
