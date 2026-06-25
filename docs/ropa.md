# Record of Processing Activities (ROPA)

> Auto-generated from `src/lib/gdpr/registry.ts` + `src/lib/gdpr/config.ts`.
> Regenerate with `bun scripts/gdpr-ropa.ts`. Do not edit by hand.

_Generated: 2026-06-25T21:36:58.444Z_

## Controller

- **Entity:** [Your legal entity]
- **Contact:** [Your name] — [privacy@your-domain.example]
- **Jurisdiction:** [Country, e.g. Germany]
- **Data location:** [Where your data is hosted, e.g. Germany (EU)]

## Processing activities

| Activity | Table | Data categories | Purpose | Lawful basis | Retention | On erasure |
|---|---|---|---|---|---|---|
| profile | `user` | id, name, email, emailVerified, image, createdAt, updatedAt | Account and authentication | Contract (Art. 6(1)(b)) | For the lifetime of the account | delete |
| sessions | `session` | id, expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId | Keeping you signed in | Contract (Art. 6(1)(b)) | Until expiry or sign-out | delete |
| linkedAccounts | `account` | id, accountId, providerId, userId, accessToken, refreshToken, idToken, accessTokenExpiresAt, refreshTokenExpiresAt, scope, password, createdAt, updatedAt | Social and password login | Contract (Art. 6(1)(b)) | Until you unlink or delete the account | delete |
| consents | `consent` | id, userId, purpose, granted, policyVersion, ipAddress, userAgent, createdAt, withdrawnAt | Recording your consent choices | Legal obligation (Art. 6(1)(c)) | Until account deletion | delete |
| dataRequests | `data_request` | id, userId, type, status, requestedAt, completedAt, artifactPath, expiresAt | Handling your privacy requests | Legal obligation (Art. 6(1)(c)) | Until account deletion | delete |
| auditLog | `audit_log` | id, subject, event, detail, ipAddress, createdAt | Proving we honoured your privacy requests | Legal obligation (Art. 6(1)(c)) | Retained as anonymised evidence | anonymize |

## Recipients / sub-processors

_None recorded._ Self-hosted with no external processors keeps this empty —
the simplest GDPR posture.

## International transfers

_No transfers outside the EU/EEA._
