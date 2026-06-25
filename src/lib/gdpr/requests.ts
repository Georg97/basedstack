import { desc, eq } from "drizzle-orm";
import { db } from "../../index";
import { dataRequest } from "../../db/gdpr.schema";

export type RequestType = "export" | "erasure" | "rectification";
export type RequestStatus = "pending" | "processing" | "completed" | "failed";

/** All data-subject requests for a user, newest first. Drives the dashboard history. */
export function listRequests(subjectId: string) {
  return db
    .select()
    .from(dataRequest)
    .where(eq(dataRequest.userId, subjectId))
    .orderBy(desc(dataRequest.requestedAt));
}

/** Record a data-subject request. Returns the new request id. */
export async function recordRequest(
  subjectId: string,
  type: RequestType,
  status: RequestStatus = "completed",
): Promise<string> {
  const id = crypto.randomUUID();
  await db.insert(dataRequest).values({
    id,
    userId: subjectId,
    type,
    status,
    completedAt: status === "completed" ? new Date() : null,
  });
  return id;
}
