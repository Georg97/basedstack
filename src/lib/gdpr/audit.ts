import { db } from "../../index";
import { auditLog } from "../../db/gdpr.schema";
import { notify } from "../server/realtime";

export interface AuditInput {
  /** Subject id while the user exists, or a pseudonym after erasure, or null (system). */
  subject: string | null;
  /** Dotted event name, e.g. "data.exported", "data.erased", "consent.granted". */
  event: string;
  detail?: unknown;
  ipAddress?: string | null;
}

/**
 * Append a privacy event to the (append-only) audit log and ping the realtime `audit`
 * channel so any admin dashboard listening via `subscribe('audit')` updates live.
 */
export async function audit({ subject, event, detail, ipAddress }: AuditInput): Promise<void> {
  await db.insert(auditLog).values({
    id: crypto.randomUUID(),
    subject,
    event,
    detail: detail ?? null,
    ipAddress: ipAddress ?? null,
  });
  // Fire-and-forget: a failed notify must not fail the audited operation.
  void notify("audit", event);
}
