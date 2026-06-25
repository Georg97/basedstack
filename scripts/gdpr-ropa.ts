// Regenerate docs/ropa.md from the registry + config. Run: `bun scripts/gdpr-ropa.ts`.
// Pure (no DB) — safe to run anytime, e.g. after editing the registry or config.
import { writeFileSync } from "node:fs";
import { generateRopa, ropaToMarkdown } from "../src/lib/gdpr/ropa";

const markdown = ropaToMarkdown(generateRopa());
writeFileSync("docs/ropa.md", markdown);
console.log("Wrote docs/ropa.md");
