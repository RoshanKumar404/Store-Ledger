import { z } from 'zod';
import { OP_TYPES } from '../constants/ops.js';
import { SYNC_STATUS, REJECT_REASON, LIMITS } from '../constants/protocol.js';
import {
  ProductCreatePayloadSchema,
  ProductPatchPayloadSchema,
  ProductDeletePayloadSchema,
  CustomerCreatePayloadSchema,
  CustomerPatchPayloadSchema,
  CustomerDeletePayloadSchema,
  CreateSalePayloadSchema,
  AddStockPayloadSchema,
  StockCountPayloadSchema,
  RecordPaymentPayloadSchema,
} from './ops.js';

export const PushOpSchema = z.discriminatedUnion('type', [
  z
    .object({
      opId: z.string().uuid(),
      type: z.literal(OP_TYPES.PRODUCT_CREATE),
      payload: ProductCreatePayloadSchema,
    })
    .strict(),
  z
    .object({
      opId: z.string().uuid(),
      type: z.literal(OP_TYPES.PRODUCT_PATCH),
      payload: ProductPatchPayloadSchema,
    })
    .strict(),
  z
    .object({
      opId: z.string().uuid(),
      type: z.literal(OP_TYPES.PRODUCT_DELETE),
      payload: ProductDeletePayloadSchema,
    })
    .strict(),
  z
    .object({
      opId: z.string().uuid(),
      type: z.literal(OP_TYPES.CUSTOMER_CREATE),
      payload: CustomerCreatePayloadSchema,
    })
    .strict(),
  z
    .object({
      opId: z.string().uuid(),
      type: z.literal(OP_TYPES.CUSTOMER_PATCH),
      payload: CustomerPatchPayloadSchema,
    })
    .strict(),
  z
    .object({
      opId: z.string().uuid(),
      type: z.literal(OP_TYPES.CUSTOMER_DELETE),
      payload: CustomerDeletePayloadSchema,
    })
    .strict(),
  z
    .object({
      opId: z.string().uuid(),
      type: z.literal(OP_TYPES.CREATE_SALE),
      payload: CreateSalePayloadSchema,
    })
    .strict(),
  z
    .object({
      opId: z.string().uuid(),
      type: z.literal(OP_TYPES.ADD_STOCK),
      payload: AddStockPayloadSchema,
    })
    .strict(),
  z
    .object({
      opId: z.string().uuid(),
      type: z.literal(OP_TYPES.STOCK_COUNT),
      payload: StockCountPayloadSchema,
    })
    .strict(),
  z
    .object({
      opId: z.string().uuid(),
      type: z.literal(OP_TYPES.RECORD_PAYMENT),
      payload: RecordPaymentPayloadSchema,
    })
    .strict(),
]);

export type PushOp = z.infer<typeof PushOpSchema>;

export const PushRequestSchema = z
  .object({
    deviceId: z.string().min(1).max(120),
    ops: z
      .array(PushOpSchema)
      .min(1, 'Push batch must contain at least one operation')
      .max(
        LIMITS.MAX_OPS_PER_PUSH,
        `Push batch exceeds maximum of ${LIMITS.MAX_OPS_PER_PUSH} operations`,
      ),
  })
  .strict();

export type PushRequest = z.infer<typeof PushRequestSchema>;

export const OpResultSchema = z
  .object({
    opId: z.string().uuid(),
    status: z.enum([SYNC_STATUS.APPLIED, SYNC_STATUS.DUPLICATE, SYNC_STATUS.REJECTED]),
    reason: z
      .enum([
        REJECT_REASON.VALIDATION,
        REJECT_REASON.TOTAL_MISMATCH,
        REJECT_REASON.OP_ID_REUSE,
        REJECT_REASON.CONSTRAINT,
        REJECT_REASON.FORBIDDEN,
      ])
      .optional(),
    conflicts: z.array(z.string()).optional(),
  })
  .strict();

export type OpResult = z.infer<typeof OpResultSchema>;

export const PushResponseSchema = z
  .object({
    results: z.array(OpResultSchema),
  })
  .strict();

export type PushResponse = z.infer<typeof PushResponseSchema>;

export const PullQuerySchema = z
  .object({
    cursor: z.coerce.number().int().nonnegative().default(0),
    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(LIMITS.MAX_PULL_LIMIT)
      .default(LIMITS.DEFAULT_PULL_LIMIT),
  })
  .strict();

export type PullQuery = z.infer<typeof PullQuerySchema>;

export const PullChangeSchema = z
  .object({
    entity: z.enum([
      'product',
      'customer',
      'sale',
      'sale_item',
      'stock_movement',
      'ledger_entry',
      'movement_review',
    ]),
    row: z.record(z.any()),
  })
  .strict();

export type PullChange = z.infer<typeof PullChangeSchema>;

export const PullResponseSchema = z
  .object({
    changes: z.array(PullChangeSchema),
    nextCursor: z.number().int().nonnegative(),
    hasMore: z.boolean(),
  })
  .strict();

export type PullResponse = z.infer<typeof PullResponseSchema>;
