// Organisation / legal config — the single source of truth for the controller details
// that the privacy policy, the imprint, and the ROPA all render from.
//
// Placeholder values look like "[Something]". Fill them in by hand, or run the `/gdpr`
// skill's `init` command, which interviews you and rewrites this file. The legal pages
// render placeholders verbatim, so anything left unfilled is obvious.
//
// NOTE: these templates are a compliant-by-construction *starting point*, not legal
// advice. Have the generated policy/imprint reviewed before you rely on them.

export interface SubProcessor {
  /** Service name, e.g. "Hetzner" or "Resend". */
  name: string;
  /** What you use it for, e.g. "Server hosting" or "Transactional email". */
  purpose: string;
  /** Where it processes data, e.g. "Germany (EU)" or "USA". */
  location: string;
  /** Link to its DPA / privacy terms, if any. */
  dpa?: string;
  /** Transfer safeguard for non-EU processors, e.g. "EU Standard Contractual Clauses". */
  safeguard?: string;
}

export interface GdprConfig {
  /** Legal entity or sole trader name. */
  legalEntity: string;
  /** Natural person responsible (for the imprint). */
  contactName: string;
  /** Postal address, one line or with \n separators. */
  address: string;
  email: string;
  phone?: string;
  /** Data Protection Officer, if you have appointed one (most small projects don't). */
  dpo?: { name?: string; email?: string } | null;
  /** Country whose law governs, e.g. "Germany". */
  jurisdiction: string;
  /** Competent supervisory authority for complaints. */
  supervisoryAuthority?: string;
  /** Where personal data physically lives, e.g. "Germany (EU)". */
  dataLocation: string;
  /** External services that process personal data on your behalf (Art. 28). */
  subProcessors: SubProcessor[];
  /** Bumped whenever the policy materially changes; stored on each consent receipt. */
  policyVersion: string;
  /** ISO date the policy was last updated. */
  policyLastUpdated: string;
}

export const gdprConfig: GdprConfig = {
  legalEntity: "[Your legal entity]",
  contactName: "[Your name]",
  address: "[Street address]\n[Postal code, City]\n[Country]",
  email: "[privacy@your-domain.example]",
  phone: undefined,
  dpo: null,
  jurisdiction: "[Country, e.g. Germany]",
  supervisoryAuthority: "[Your data protection supervisory authority]",
  dataLocation: "[Where your data is hosted, e.g. Germany (EU)]",
  subProcessors: [
    // Example — replace with your real processors (or run `/gdpr init`):
    // { name: "Hetzner", purpose: "Server hosting", location: "Germany (EU)" },
  ],
  policyVersion: "2026-01-01",
  policyLastUpdated: "2026-01-01",
};

/** True while a value is still an unfilled "[placeholder]". Used to flag setup gaps. */
export function isPlaceholder(value: string | undefined | null): boolean {
  return typeof value === "string" && value.trim().startsWith("[");
}

/** True once the core controller identity has been filled in (not placeholders). */
export function isConfigured(config: GdprConfig = gdprConfig): boolean {
  return !isPlaceholder(config.legalEntity) && !isPlaceholder(config.email);
}
