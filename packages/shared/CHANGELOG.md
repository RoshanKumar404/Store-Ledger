# Changelog - @kirana/shared

All notable contract changes to op schemas, protocol constants, and synchronization models will be documented here.

## [1.0.0] - 2026-10-17

### Added

- Protocol constants: `PROTOCOL_VERSION = 1`, `PROTOCOL_HEADER = 'x-protocol-version'`, status codes (`APPLIED`, `DUPLICATE`, `REJECTED`), reject reason codes (`VALIDATION`, `TOTAL_MISMATCH`, `OP_ID_REUSE`, `CONSTRAINT`, `FORBIDDEN`).
- Zod `.strict()` schemas for all 10 operation payloads: `PRODUCT_CREATE`, `PRODUCT_PATCH` (with `baseSeq`, `deviceId`, allowlisted `fields`), `PRODUCT_DELETE`, `CUSTOMER_CREATE`, `CUSTOMER_PATCH`, `CUSTOMER_DELETE`, `CREATE_SALE` (composite sale, line items, stock movements, and optional ledger entry), `ADD_STOCK`, `STOCK_COUNT`, `RECORD_PAYMENT`.
- Synchronous math helpers: Round-Half-Up line total calculation (`calculateLineTotal`), sale total sum (`calculateSaleTotal`), paise formatting, and IST day-boundary helpers (`getIstDayStart`, `getIstDayEnd`).
- JSON test fixtures in `fixtures/valid-ops.json` and `fixtures/invalid-ops.json`.
- Strict auth schemas (`RegisterRequestSchema`, `LoginRequestSchema`, `RefreshTokenRequestSchema`, `DeleteAccountRequestSchema`).
- Standardized error response contract (`ErrorResponseSchema`, `ErrorBodySchema`) returning `{ error: { code, message } }`.
