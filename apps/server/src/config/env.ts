import dotenv from 'dotenv';
import { z } from 'zod';
import { LIMITS } from '@kirana/shared';

// Load environment variables from .env file if present
dotenv.config();

export const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    HOST: z.string().default('0.0.0.0'),
    DATABASE_URL: z.string().optional(),
    JWT_SECRET: z
      .string()
      .min(32, 'JWT_SECRET must be at least 32 characters for security')
      .default('dev_insecure_jwt_secret_must_be_at_least_32_characters_long!'),
    JWT_REFRESH_SECRET: z
      .string()
      .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters for security')
      .default('dev_insecure_jwt_refresh_secret_at_least_32_chars_long!'),
    MAX_PAYLOAD_BYTES: z.coerce.number().int().positive().default(LIMITS.MAX_PAYLOAD_BYTES),
    REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
    CONNECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
    KEEP_ALIVE_TIMEOUT_MS: z.coerce.number().int().positive().default(5_000),
  })
  .superRefine((data, ctx) => {
    // In production, enforce non-default cryptographic secrets and database connection
    if (data.NODE_ENV === 'production') {
      if (
        !data.DATABASE_URL ||
        data.DATABASE_URL.includes('example.com') ||
        data.DATABASE_URL.includes('placeholder')
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DATABASE_URL'],
          message: 'DATABASE_URL is mandatory and cannot be a placeholder in production',
        });
      }

      if (data.JWT_SECRET.startsWith('dev_insecure_')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_SECRET'],
          message: 'JWT_SECRET must be configured with a production-grade secret in production',
        });
      }

      if (data.JWT_REFRESH_SECRET.startsWith('dev_insecure_')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_REFRESH_SECRET'],
          message:
            'JWT_REFRESH_SECRET must be configured with a production-grade secret in production',
        });
      }
    }
  });

export type EnvConfig = z.infer<typeof EnvSchema>;

export function validateEnv(rawEnv: Record<string, unknown> = process.env): EnvConfig {
  const result = EnvSchema.safeParse(rawEnv);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Environment validation failed at startup:\n${errorDetails}`);
  }
  return result.data;
}
