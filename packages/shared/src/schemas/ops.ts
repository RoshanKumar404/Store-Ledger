import { z } from 'zod';
import { PRODUCT_UNITS, PAYMENT_MODES, STOCK_REASONS, LEDGER_REASONS } from '../constants/ops.js';
import { LIMITS } from '../constants/protocol.js';

// ==========================================
// 1. PRODUCT OPS
// ==========================================

export const ProductCreatePayloadSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().trim().min(LIMITS.NAME_MIN_LENGTH).max(LIMITS.NAME_MAX_LENGTH),
    unit: z.enum(PRODUCT_UNITS),
    price_paise: z.number().int().min(0).max(LIMITS.MAX_PRICE_PAISE),
    low_stock_milli: z.number().int().min(0).max(LIMITS.MAX_QUANTITY_MILLI).default(0),
    barcode: z.string().trim().max(LIMITS.BARCODE_MAX_LENGTH).nullable().optional(),
  })
  .strict();

export type ProductCreatePayload = z.infer<typeof ProductCreatePayloadSchema>;

export const ProductPatchFieldsSchema = z
  .object({
    name: z.string().trim().min(LIMITS.NAME_MIN_LENGTH).max(LIMITS.NAME_MAX_LENGTH).optional(),
    unit: z.enum(PRODUCT_UNITS).optional(),
    price_paise: z.number().int().min(0).max(LIMITS.MAX_PRICE_PAISE).optional(),
    low_stock_milli: z.number().int().min(0).max(LIMITS.MAX_QUANTITY_MILLI).optional(),
    barcode: z.string().trim().max(LIMITS.BARCODE_MAX_LENGTH).nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Patch must contain at least one field to update',
  });

export const ProductPatchPayloadSchema = z
  .object({
    id: z.string().uuid(),
    baseSeq: z.number().int().nonnegative(),
    deviceId: z.string().min(1).max(120),
    fields: ProductPatchFieldsSchema,
  })
  .strict();

export type ProductPatchPayload = z.infer<typeof ProductPatchPayloadSchema>;

export const ProductDeletePayloadSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();

export type ProductDeletePayload = z.infer<typeof ProductDeletePayloadSchema>;

// ==========================================
// 2. CUSTOMER OPS
// ==========================================

export const CustomerCreatePayloadSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().trim().min(LIMITS.NAME_MIN_LENGTH).max(LIMITS.NAME_MAX_LENGTH),
    phone: z.string().trim().max(LIMITS.PHONE_MAX_LENGTH).nullable().optional(),
  })
  .strict();

export type CustomerCreatePayload = z.infer<typeof CustomerCreatePayloadSchema>;

export const CustomerPatchFieldsSchema = z
  .object({
    name: z.string().trim().min(LIMITS.NAME_MIN_LENGTH).max(LIMITS.NAME_MAX_LENGTH).optional(),
    phone: z.string().trim().max(LIMITS.PHONE_MAX_LENGTH).nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Patch must contain at least one field to update',
  });

export const CustomerPatchPayloadSchema = z
  .object({
    id: z.string().uuid(),
    baseSeq: z.number().int().nonnegative(),
    deviceId: z.string().min(1).max(120),
    fields: CustomerPatchFieldsSchema,
  })
  .strict();

export type CustomerPatchPayload = z.infer<typeof CustomerPatchPayloadSchema>;

export const CustomerDeletePayloadSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();

export type CustomerDeletePayload = z.infer<typeof CustomerDeletePayloadSchema>;

// ==========================================
// 3. TRANSACTION OPS: CREATE_SALE
// ==========================================

export const SaleItemSchema = z
  .object({
    id: z.string().uuid(),
    sale_id: z.string().uuid(),
    product_id: z.string().uuid(),
    qty_milli: z.number().int().positive().max(LIMITS.MAX_QUANTITY_MILLI),
    unit_price_paise: z.number().int().nonnegative().max(LIMITS.MAX_PRICE_PAISE),
    line_total_paise: z.number().int().nonnegative().max(LIMITS.MAX_PRICE_PAISE),
  })
  .strict();

export type SaleItem = z.infer<typeof SaleItemSchema>;

export const StockMovementSchema = z
  .object({
    id: z.string().uuid(),
    product_id: z.string().uuid(),
    delta_milli: z
      .number()
      .int()
      .refine((val) => val !== 0, { message: 'delta_milli cannot be zero' }),
    reason: z.enum(STOCK_REASONS),
    ref_id: z.string().nullable().optional(),
    at: z.number().int(),
  })
  .strict();

export type StockMovement = z.infer<typeof StockMovementSchema>;

export const LedgerEntrySchema = z
  .object({
    id: z.string().uuid(),
    customer_id: z.string().uuid(),
    delta_paise: z
      .number()
      .int()
      .refine((val) => val !== 0, { message: 'delta_paise cannot be zero' }),
    reason: z.enum(LEDGER_REASONS),
    ref_id: z.string().nullable().optional(),
    at: z.number().int(),
  })
  .strict();

export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;

export const CreateSalePayloadSchema = z
  .object({
    sale: z
      .object({
        id: z.string().uuid(),
        customer_id: z.string().uuid().nullable().optional(),
        total_paise: z.number().int().nonnegative().max(LIMITS.MAX_PRICE_PAISE),
        payment: z.enum(PAYMENT_MODES),
        sold_at: z.number().int(),
      })
      .strict(),
    items: z.array(SaleItemSchema).min(1, 'Sale must contain at least one item'),
    movements: z.array(StockMovementSchema).min(1, 'Sale must contain at least one stock movement'),
    ledger_entry: LedgerEntrySchema.nullable().optional(),
  })
  .strict();

export type CreateSalePayload = z.infer<typeof CreateSalePayloadSchema>;

// ==========================================
// 4. STOCK & PAYMENT OPS
// ==========================================

export const AddStockPayloadSchema = z
  .object({
    id: z.string().uuid(),
    product_id: z.string().uuid(),
    delta_milli: z.number().int().positive().max(LIMITS.MAX_QUANTITY_MILLI),
    reason: z.enum(['PURCHASE', 'ADJUSTMENT']).default('PURCHASE'),
    at: z.number().int(),
  })
  .strict();

export type AddStockPayload = z.infer<typeof AddStockPayloadSchema>;

export const StockCountPayloadSchema = z
  .object({
    productId: z.string().uuid(),
    countedMilli: z.number().int().nonnegative().max(LIMITS.MAX_QUANTITY_MILLI),
  })
  .strict();

export type StockCountPayload = z.infer<typeof StockCountPayloadSchema>;

export const RecordPaymentPayloadSchema = z
  .object({
    id: z.string().uuid(),
    customer_id: z.string().uuid(),
    amount_paise: z.number().int().positive().max(LIMITS.MAX_PRICE_PAISE),
    at: z.number().int(),
    ref_id: z.string().nullable().optional(),
  })
  .strict();

export type RecordPaymentPayload = z.infer<typeof RecordPaymentPayloadSchema>;
