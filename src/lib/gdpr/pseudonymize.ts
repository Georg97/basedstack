import { createHash } from "node:crypto";

// Salt for pseudonyms. Reuses BETTER_AUTH_SECRET so there's no new required env var;
// override with GDPR_PSEUDONYM_SALT if you want them on separate rotation schedules.
const salt = process.env.GDPR_PSEUDONYM_SALT ?? process.env.BETTER_AUTH_SECRET ?? "";

/**
 * Stable, non-reversible token for a subject id. The same input always maps to the
 * same token (so an anonymised audit trail still correlates with itself), but the
 * original id can't be recovered without the salt.
 */
export function pseudonym(value: string): string {
  return "anon_" + createHash("sha256").update(`${salt}:${value}`).digest("hex").slice(0, 24);
}
