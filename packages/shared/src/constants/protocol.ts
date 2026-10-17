/**
 * Protocol Constants for Kirana Ledger Sync Engine
 * Single Source of Truth (§SH-02)
 */

export const PROTOCOL_VERSION = 1;
export const PROTOCOL_HEADER = 'x-protocol-version';

export const SYNC_STATUS = {
  APPLIED: 'APPLIED',
  DUPLICATE: 'DUPLICATE',
  REJECTED: 'REJECTED',
} as const;

export type SyncStatus = (typeof SYNC_STATUS)[keyof typeof SYNC_STATUS];

export const REJECT_REASON = {
  VALIDATION: 'VALIDATION',
  TOTAL_MISMATCH: 'TOTAL_MISMATCH',
  OP_ID_REUSE: 'OP_ID_REUSE',
  CONSTRAINT: 'CONSTRAINT',
  FORBIDDEN: 'FORBIDDEN',
} as const;

export type RejectReason = (typeof REJECT_REASON)[keyof typeof REJECT_REASON];

/**
 * Numeric constraints and payload limits
 */
export const LIMITS = {
  MAX_PRICE_PAISE: 100_000_000, // ₹10,00,000.00
  MAX_QUANTITY_MILLI: 1_000_000_000, // 1,000,000.000 units/kg/l
  MAX_OPS_PER_PUSH: 50,
  MAX_PULL_LIMIT: 500,
  DEFAULT_PULL_LIMIT: 500,
  MAX_PAYLOAD_BYTES: 1024 * 1024, // 1 MB
  MAX_FUTURE_DRIFT_MS: 5 * 60 * 1000, // 5 minutes max future drift for sold_at
  RETENTION_PERIOD_DAYS: 90,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 120,
  BARCODE_MAX_LENGTH: 64,
  PHONE_MAX_LENGTH: 20,
} as const;
