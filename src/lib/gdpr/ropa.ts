// ROPA — Record of Processing Activities (Art. 30).
//
// Generated entirely from two sources you already maintain: the PII registry
// (what data, why, on what basis, kept how long) and the org config (who the
// controller is, which sub-processors are involved). Keeping ROPA generated means it
// can never silently drift from the code.
import { getTableColumns, getTableName } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { registry } from "./registry";
import { gdprConfig, type GdprConfig, type SubProcessor } from "./config";

export interface RopaActivity {
  /** Friendly name (the registry key). */
  name: string;
  /** Underlying SQL table. */
  table: string;
  /** Categories of personal data — the table's columns. */
  dataFields: string[];
  purpose: string;
  lawfulBasis: string;
  retention: string;
  /** How "delete my data" treats this record. */
  erasure: string;
}

export interface Ropa {
  generatedAt: string;
  controller: GdprConfig;
  activities: RopaActivity[];
  /** All sub-processors. */
  recipients: SubProcessor[];
  /** Sub-processors outside the EU/EEA — the ones needing a transfer safeguard. */
  internationalTransfers: SubProcessor[];
}

const EU_HINTS = ["eu", "eea", "germany", "france", "ireland", "netherlands", "europe"];

function isOutsideEu(location: string): boolean {
  const l = location.toLowerCase();
  return !EU_HINTS.some((hint) => l.includes(hint));
}

/** Build the ROPA from the registry + config. Pure — no DB access. */
export function generateRopa(): Ropa {
  const activities: RopaActivity[] = registry.records.map((rec) => {
    const table = rec.table as PgTable;
    return {
      name: rec.key,
      table: getTableName(table),
      dataFields: Object.keys(getTableColumns(table)),
      purpose: rec.purpose ?? "—",
      lawfulBasis: rec.lawfulBasis ?? "—",
      retention: rec.retention ?? "—",
      erasure: rec.erase ?? "delete",
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    controller: gdprConfig,
    activities,
    recipients: gdprConfig.subProcessors,
    internationalTransfers: gdprConfig.subProcessors.filter((s) => isOutsideEu(s.location)),
  };
}

/** Render a ROPA as a self-contained Markdown document (for docs/ropa.md). */
export function ropaToMarkdown(ropa: Ropa): string {
  const c = ropa.controller;
  const lines: string[] = [];

  lines.push("# Record of Processing Activities (ROPA)");
  lines.push("");
  lines.push("> Auto-generated from `src/lib/gdpr/registry.ts` + `src/lib/gdpr/config.ts`.");
  lines.push("> Regenerate with `bun scripts/gdpr-ropa.ts`. Do not edit by hand.");
  lines.push("");
  lines.push(`_Generated: ${ropa.generatedAt}_`);
  lines.push("");

  lines.push("## Controller");
  lines.push("");
  lines.push(`- **Entity:** ${c.legalEntity}`);
  lines.push(`- **Contact:** ${c.contactName} — ${c.email}`);
  lines.push(`- **Jurisdiction:** ${c.jurisdiction}`);
  lines.push(`- **Data location:** ${c.dataLocation}`);
  if (c.dpo?.email) lines.push(`- **DPO:** ${c.dpo.name ?? ""} (${c.dpo.email})`);
  lines.push("");

  lines.push("## Processing activities");
  lines.push("");
  lines.push("| Activity | Table | Data categories | Purpose | Lawful basis | Retention | On erasure |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const a of ropa.activities) {
    lines.push(
      `| ${a.name} | \`${a.table}\` | ${a.dataFields.join(", ")} | ${a.purpose} | ${a.lawfulBasis} | ${a.retention} | ${a.erasure} |`,
    );
  }
  lines.push("");

  lines.push("## Recipients / sub-processors");
  lines.push("");
  if (ropa.recipients.length === 0) {
    lines.push("_None recorded._ Self-hosted with no external processors keeps this empty —");
    lines.push("the simplest GDPR posture.");
  } else {
    lines.push("| Processor | Purpose | Location | Safeguard |");
    lines.push("|---|---|---|---|");
    for (const r of ropa.recipients) {
      lines.push(`| ${r.name} | ${r.purpose} | ${r.location} | ${r.safeguard ?? "—"} |`);
    }
  }
  lines.push("");

  lines.push("## International transfers");
  lines.push("");
  if (ropa.internationalTransfers.length === 0) {
    lines.push("_No transfers outside the EU/EEA._");
  } else {
    for (const t of ropa.internationalTransfers) {
      lines.push(`- **${t.name}** (${t.location}) — safeguard: ${t.safeguard ?? "⚠️ none recorded"}`);
    }
  }
  lines.push("");

  return lines.join("\n");
}
