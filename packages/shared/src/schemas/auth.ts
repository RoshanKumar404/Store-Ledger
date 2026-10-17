import { z } from 'zod';
import { LIMITS } from '../constants/protocol.js';

export const RegisterRequestSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Invalid email address')
      .max(254, 'Email must not exceed 254 characters'),
    password: z
      .string()
      .min(
        LIMITS.PASSWORD_MIN_LENGTH,
        `Password must be at least ${LIMITS.PASSWORD_MIN_LENGTH} characters`,
      )
      .max(
        LIMITS.PASSWORD_MAX_LENGTH,
        `Password must not exceed ${LIMITS.PASSWORD_MAX_LENGTH} characters`,
      ),
    shopName: z
      .string()
      .trim()
      .min(LIMITS.NAME_MIN_LENGTH, 'Shop name is required')
      .max(
        LIMITS.NAME_MAX_LENGTH,
        `Shop name must not exceed ${LIMITS.NAME_MAX_LENGTH} characters`,
      ),
  })
  .strict();

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Invalid email address').max(254),
    password: z.string().min(1, 'Password is required').max(LIMITS.PASSWORD_MAX_LENGTH),
  })
  .strict();

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RefreshTokenRequestSchema = z
  .object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  })
  .strict();

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

export const DeleteAccountRequestSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password confirmation is required')
      .max(LIMITS.PASSWORD_MAX_LENGTH),
  })
  .strict();

export type DeleteAccountRequest = z.infer<typeof DeleteAccountRequestSchema>;

export const AuthResponseSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number().int().positive(),
    user: z.object({
      id: z.string().uuid(),
      shopId: z.string().uuid(),
      email: z.string().email(),
      role: z.enum(['OWNER', 'EMPLOYEE']),
    }),
    shop: z.object({
      id: z.string().uuid(),
      name: z.string(),
    }),
  })
  .strict();

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
