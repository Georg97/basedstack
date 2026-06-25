// GDPR workstream schema — owned by the `gdpr` workstream (see docs/manifest.md).
//
// Kept separate from schema.ts so the `gdpr` and `realtime` efforts don't collide on
// the same file. schema.ts re-exports this module (one appended line) so drizzle-kit
// migrations pick these tables up.
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { user } from "./schema";

// Consent receipts (Art. 6/7). One row per (subject, purpose) decision. We keep
// withdrawn rows rather than deleting them so there's an auditable consent history.
export const consent = pgTable(
  "consent",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    purpose: text("purpose").notNull(), // e.g. "ai-external", "analytics", "marketing"
    granted: boolean("granted").default(false).notNull(),
    policyVersion: text("policy_version"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    withdrawnAt: timestamp("withdrawn_at"),
  },
  (table) => [index("consent_userId_idx").on(table.userId)],
);

// Data-subject requests (Art. 15 access / 17 erasure / 20 portability). Tracks the
// lifecycle of each request so there's a record of what was asked and when it was done.
export const dataRequest = pgTable(
  "data_request",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // "export" | "erasure" | "rectification"
    status: text("status").default("pending").notNull(), // pending|processing|completed|failed
    requestedAt: timestamp("requested_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    artifactPath: text("artifact_path"), // where an export bundle was written, if any
    expiresAt: timestamp("expires_at"), // when an export artifact should be purged
  },
  (table) => [index("data_request_userId_idx").on(table.userId)],
);

// Append-only audit log of privacy-relevant events. `subject` holds the user id while
// the user exists and is PSEUDONYMISED on erasure, so the log survives as compliance
// evidence without identifying the person (the "anonymize override", see registry.ts).
// Deliberately NOT a foreign key, so erasing the user does not cascade-delete the trail.
export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    subject: text("subject"), // user id, or pseudonym after erasure, or null (system)
    event: text("event").notNull(), // "consent.granted", "data.exported", "data.erased", ...
    detail: jsonb("detail"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("audit_log_subject_idx").on(table.subject),
    index("audit_log_created_at_idx").on(table.createdAt),
  ],
);

// Relations are declared one-directional (child → user) on purpose: adding the reverse
// (`user` → many consent/...) would require editing schema.ts's userRelations, which is
// owned by the `realtime` workstream. The engine only needs these directions.
export const consentRelations = relations(consent, ({ one }) => ({
  user: one(user, { fields: [consent.userId], references: [user.id] }),
}));

export const dataRequestRelations = relations(dataRequest, ({ one }) => ({
  user: one(user, { fields: [dataRequest.userId], references: [user.id] }),
}));
