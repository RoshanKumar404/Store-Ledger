import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import helmet from '@fastify/helmet';
import { validateEnv, EnvConfig } from './config/env.js';
import { setupErrorHandler } from './errors/error-handler.js';
import { getLoggerConfig, generateRequestId } from './utils/logger.js';
import { healthRoutes } from './routes/health.route.js';

export interface BuildAppOptions extends FastifyServerOptions {
  envConfig?: EnvConfig;
}

/**
 * Fastify Application Factory (§BE-01)
 * Follows Dependency Inversion and Factory pattern.
 * Allows instantiation in tests without binding to physical sockets.
 */
export function buildApp(opts: BuildAppOptions = {}): FastifyInstance {
  const isTest = process.env.NODE_ENV === 'test' || opts.envConfig?.NODE_ENV === 'test';
  const env = opts.envConfig || validateEnv();

  const app = fastify({
    bodyLimit: env.MAX_PAYLOAD_BYTES,
    requestTimeout: env.REQUEST_TIMEOUT_MS,
    connectionTimeout: env.CONNECTION_TIMEOUT_MS,
    keepAliveTimeout: env.KEEP_ALIVE_TIMEOUT_MS,
    genReqId: generateRequestId,
    logger: opts.logger ?? getLoggerConfig(isTest),
    trustProxy: true,
    ...opts,
  });

  // 1. Security Headers via @fastify/helmet (§BE-01)
  app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });

  // 2. Global Error & 404 Handlers enforcing contract shape
  setupErrorHandler(app);

  // 3. Register Core Routes
  app.register(healthRoutes);

  return app;
}
