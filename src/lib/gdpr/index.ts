// GDPR engine — see CLAUDE.md "GDPR constitution" and docs/manifest.md.
//
// The registry is the single source of truth; the export/erase engines and the
// request helpers all read from it.
export { registry } from "./registry";
export type {
  Registry,
  PersonalDataRecord,
  EraseStrategy,
  FieldStrategy,
} from "./registry";
export { exportUserData, type DataExport } from "./export";
export { eraseUserData } from "./erase";
export { audit, type AuditInput } from "./audit";
export { pseudonym } from "./pseudonymize";
export {
  listRequests,
  recordRequest,
  type RequestType,
  type RequestStatus,
} from "./requests";
