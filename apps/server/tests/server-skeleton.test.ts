import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { validateEnv } from '../src/config/env.js';
import { BadRequestError, ForbiddenError } from '../src/errors/app-error.js';
import { ErrorResponseSchema, PROTOCOL_VERSION } from '@kirana/shared';

function createTestApp() {
  const app = buildApp({
    logger: false,
    envConfig: {
      NODE_ENV: 'test',
      PORT: 3000,
      HOST: '0.0.0.0',
      JWT_SECRET: 'test_jwt_secret_must_be_at_least_32_characters_long!',
      JWT_REFRESH_SECRET: 'test_jwt_refresh_secret_at_least_32_chars_long!',
      MAX_PAYLOAD_BYTES: 1024 * 1024, // 1 MB
      REQUEST_TIMEOUT_MS: 15_000,
      CONNECTION_TIMEOUT_MS: 10_000,
      KEEP_ALIVE_TIMEOUT_MS: 5_000,
    },
  });

  // Register mock routes for testing error handling and limits before booting
  app.post('/test/upload', async (_req, reply) => reply.send({ success: true }));

  app.get('/test/domain-error', async () => {
    throw new BadRequestError('Invalid store currency unit');
  });

  app.get('/test/forbidden-error', async () => {
    throw new ForbiddenError('Shop tenant cross-access rejected');
  });

  app.get('/test/unhandled-crash', async () => {
    throw new Error('Database connection pool exhausted password=SuperSecret');
  });

  return app;
}

describe('BE-01: Server Skeleton & Security Invariants', () => {
  const app = createTestApp();

  // Acceptance Criterion 1: /health returns 200 with a tiny body
  describe('GET /health endpoint', () => {
    it('should return 200 OK with lightweight health payload and protocol version', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      assert.equal(response.statusCode, 200);
      assert.match(response.headers['content-type'] || '', /application\/json/);

      const body = JSON.parse(response.body);
      assert.equal(body.status, 'ok');
      assert.equal(typeof body.timestamp, 'number');
      assert.equal(typeof body.uptime, 'number');
      assert.equal(body.version, PROTOCOL_VERSION);

      // Verify payload is tiny (< 150 bytes)
      assert.ok(
        response.body.length < 150,
        `Health payload was unexpectedly large: ${response.body.length} bytes`,
      );
    });
  });

  // Acceptance Criterion 2: An oversized body returns 413
  describe('Payload Body Size Cap (1 MB limit)', () => {
    it('should reject request bodies exceeding 1 MB with HTTP 413 Payload Too Large', async () => {
      // 1 MB + 1024 bytes payload
      const oversizedPayload = Buffer.alloc(1024 * 1024 + 1024, 'a').toString();

      const response = await app.inject({
        method: 'POST',
        url: '/test/upload',
        headers: { 'content-type': 'text/plain' },
        payload: oversizedPayload,
      });

      assert.equal(response.statusCode, 413);

      const body = JSON.parse(response.body);
      const parsed = ErrorResponseSchema.safeParse(body);
      assert.ok(
        parsed.success,
        `Expected 413 response to match ErrorResponseSchema, got: ${response.body}`,
      );
      assert.equal(body.error.code, 'PAYLOAD_TOO_LARGE');
      assert.ok(body.error.message.includes('1 MB'));
      assert.equal(body.stack, undefined, 'Stack trace must NEVER be returned');
    });

    it('should accept payloads within the 1 MB limit', async () => {
      const allowedPayload = Buffer.alloc(500 * 1024, 'a').toString();

      const response = await app.inject({
        method: 'POST',
        url: '/test/upload',
        headers: { 'content-type': 'text/plain' },
        payload: allowedPayload,
      });

      assert.equal(response.statusCode, 200);
      const body = JSON.parse(response.body);
      assert.equal(body.success, true);
    });
  });

  // Acceptance Criterion 3: The error-shape test passes
  describe('Standardized Error Shape Contract ({ error: { code, message } })', () => {
    it('should return 404 NOT_FOUND conforming to ErrorResponseSchema for unknown routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/non-existent-route-404',
      });

      assert.equal(response.statusCode, 404);

      const body = JSON.parse(response.body);
      const validation = ErrorResponseSchema.safeParse(body);
      assert.ok(validation.success, `404 body does not conform to contract: ${response.body}`);
      assert.equal(body.error.code, 'NOT_FOUND');
      assert.ok(body.error.message.includes('/non-existent-route-404'));
      assert.equal(body.stack, undefined);
    });

    it('should format domain AppErrors into the contract format without leaking internals', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/test/domain-error',
      });

      assert.equal(response.statusCode, 400);

      const body = JSON.parse(response.body);
      const validation = ErrorResponseSchema.safeParse(body);
      assert.ok(validation.success);
      assert.equal(body.error.code, 'BAD_REQUEST');
      assert.equal(body.error.message, 'Invalid store currency unit');
      assert.equal(body.stack, undefined);
    });

    it('should format forbidden domain errors accurately', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/test/forbidden-error',
      });

      assert.equal(response.statusCode, 403);
      const body = JSON.parse(response.body);
      assert.equal(body.error.code, 'FORBIDDEN');
      assert.equal(body.error.message, 'Shop tenant cross-access rejected');
      assert.equal(body.stack, undefined);
    });

    it('should scrub unhandled 500 exceptions and omit stack traces completely', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/test/unhandled-crash',
      });

      assert.equal(response.statusCode, 500);

      const body = JSON.parse(response.body);
      const validation = ErrorResponseSchema.safeParse(body);
      assert.ok(validation.success);
      assert.equal(body.error.code, 'INTERNAL_SERVER_ERROR');
      assert.equal(body.error.message, 'An internal server error occurred');
      assert.equal(body.stack, undefined, 'Stack trace must be strictly absent in response');
      assert.ok(!response.body.includes('SuperSecret'), 'Sensitive error details must not leak');
    });
  });

  // Security Headers (@fastify/helmet)
  describe('Security Headers', () => {
    it('should set Helmet security headers on responses', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      assert.equal(response.headers['x-content-type-options'], 'nosniff');
      assert.ok(response.headers['content-security-policy'], 'CSP header should be present');
      assert.equal(response.headers['x-frame-options'], 'SAMEORIGIN');
    });
  });

  // Environment Validation
  describe('Environment Validation (§BE-01)', () => {
    it('should validate valid environment configuration successfully', () => {
      const validConfig = validateEnv({
        NODE_ENV: 'test',
        PORT: '8080',
        HOST: '127.0.0.1',
        JWT_SECRET: 'a_very_secure_random_key_with_over_32_characters_123',
        JWT_REFRESH_SECRET: 'another_secure_refresh_key_with_over_32_characters_123',
      });

      assert.equal(validConfig.PORT, 8080);
      assert.equal(validConfig.HOST, '127.0.0.1');
      assert.equal(validConfig.NODE_ENV, 'test');
    });

    it('should reject production configuration if secrets are insecure or missing', () => {
      assert.throws(() => {
        validateEnv({
          NODE_ENV: 'production',
          DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/kirana',
          JWT_SECRET: 'dev_insecure_jwt_secret_must_be_at_least_32_characters_long!',
        });
      }, /Environment validation failed/);
    });

    it('should reject production configuration if DATABASE_URL is missing', () => {
      assert.throws(() => {
        validateEnv({
          NODE_ENV: 'production',
          JWT_SECRET: 'a_very_secure_random_key_with_over_32_characters_123',
          JWT_REFRESH_SECRET: 'another_secure_refresh_key_with_over_32_characters_123',
        });
      }, /DATABASE_URL is mandatory/);
    });
  });
});
