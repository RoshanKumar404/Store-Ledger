import { randomUUID } from 'node:crypto';
import { FastifyServerOptions } from 'fastify';

/**
 * Privacy-Preserving Structured Logger Options (§BE-01)
 * Enforces zero PII / token leakage while providing full request-ID correlation.
 */
export function getLoggerConfig(isTest: boolean): FastifyServerOptions['logger'] {
  if (isTest) {
    return false;
  }

  return {
    level: process.env.LOG_LEVEL || 'info',
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.headers["x-refresh-token"]',
        '*.password',
        '*.passwordHash',
        '*.refreshToken',
        '*.token',
        '*.phone',
        '*.email',
      ],
      censor: '[REDACTED]',
    },
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
          remoteAddress: req.ip,
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  };
}

/**
 * Generates cryptographically random UUIDv4 request identifiers
 */
export function generateRequestId(): string {
  return randomUUID();
}
