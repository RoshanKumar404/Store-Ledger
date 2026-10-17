/**
 * Operation Types and Enumerations
 * Single Source of Truth (§SH-02)
 */

export const OP_TYPES = {
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  PRODUCT_PATCH: 'PRODUCT_PATCH',
  PRODUCT_DELETE: 'PRODUCT_DELETE',
  CUSTOMER_CREATE: 'CUSTOMER_CREATE',
  CUSTOMER_PATCH: 'CUSTOMER_PATCH',
  CUSTOMER_DELETE: 'CUSTOMER_DELETE',
  CREATE_SALE: 'CREATE_SALE',
  ADD_STOCK: 'ADD_STOCK',
  STOCK_COUNT: 'STOCK_COUNT',
  RECORD_PAYMENT: 'RECORD_PAYMENT',
} as const;

export type OpType = (typeof OP_TYPES)[keyof typeof OP_TYPES];

export const PRODUCT_UNITS = ['pc', 'kg', 'l'] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export const PAYMENT_MODES = ['CASH', 'UPI', 'CREDIT'] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

export const STOCK_REASONS = ['SALE', 'PURCHASE', 'ADJUSTMENT', 'COUNT'] as const;
export type StockReason = (typeof STOCK_REASONS)[number];

export const LEDGER_REASONS = ['CREDIT_SALE', 'PAYMENT', 'ADJUSTMENT'] as const;
export type LedgerReason = (typeof LEDGER_REASONS)[number];

export const USER_ROLES = ['OWNER', 'EMPLOYEE'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const REVIEW_DECISIONS = ['APPROVED', 'REJECTED'] as const;
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

/**
 * Strict database column allowlists for dynamic PATCH operations (§8.2)
 */
export const PRODUCT_PATCH_ALLOWLIST = [
  'name',
  'unit',
  'price_paise',
  'low_stock_milli',
  'barcode',
] as const;

export type ProductPatchField = (typeof PRODUCT_PATCH_ALLOWLIST)[number];

export const CUSTOMER_PATCH_ALLOWLIST = ['name', 'phone'] as const;
export type CustomerPatchField = (typeof CUSTOMER_PATCH_ALLOWLIST)[number];
