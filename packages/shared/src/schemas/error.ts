import { z } from 'zod';

export const ErrorBodySchema = z
  .object({
    code: z.string().min(1),
    message: z.string().min(1),
  })
  .strict();

export type ErrorBody = z.infer<typeof ErrorBodySchema>;

export const ErrorResponseSchema = z
  .object({
    error: ErrorBodySchema,
  })
  .strict();

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
