import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from './app-error.js';

/**
 * Standardized Global Fastify Error Handler (§BE-01)
 * Enforces contract shape: { error: { code: string, message: string } }
 * Guarantees zero stack trace leakage and structured request correlation.
 */
export function setupErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(
    (error: FastifyError | AppError | Error, request: FastifyRequest, reply: FastifyReply) => {
      // 1. Domain AppErrors
      if (error instanceof AppError) {
        request.log.warn(
          {
            errCode: error.code,
            statusCode: error.statusCode,
            message: error.message,
          },
          'Application domain error handled',
        );

        return reply.status(error.statusCode).send({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      // 2. Fastify Payload Too Large (1 MB cap exceeded)
      if ('statusCode' in error && error.statusCode === 413) {
        request.log.warn(
          {
            statusCode: 413,
            url: request.url,
          },
          'Request payload exceeded maximum size limit',
        );

        return reply.status(413).send({
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Request payload exceeds maximum allowed size limit of 1 MB',
          },
        });
      }

      // 3. Fastify Validation Errors
      if ('validation' in error && error.validation) {
        request.log.warn(
          {
            validation: error.validation,
          },
          'Fastify schema validation failed',
        );

        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message || 'Request validation failed',
          },
        });
      }

      // 4. Zod Schema Validation Errors
      if (error instanceof ZodError) {
        const formattedMessage = error.issues
          .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
          .join('; ');

        request.log.warn(
          {
            zodIssues: error.issues,
          },
          'Zod schema validation failed',
        );

        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: formattedMessage || 'Validation failed against schema',
          },
        });
      }

      // 5. Fastify 404 from routes
      if ('statusCode' in error && error.statusCode === 404) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: error.message || 'Resource not found',
          },
        });
      }

      // 6. Generic/Unhandled 500 Errors - Zero Stack Trace Disclosure
      const rawStatusCode =
        'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500;
      const finalStatusCode = rawStatusCode >= 400 && rawStatusCode < 600 ? rawStatusCode : 500;

      request.log.error(
        {
          err: {
            name: error.name,
            message: error.message,
          },
          statusCode: finalStatusCode,
          url: request.url,
          method: request.method,
        },
        'Unhandled server exception caught by error handler',
      );

      return reply.status(finalStatusCode).send({
        error: {
          code: finalStatusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR',
          message: finalStatusCode === 500 ? 'An internal server error occurred' : error.message,
        },
      });
    },
  );

  // Not Found Route Handler (404)
  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    request.log.info({ url: request.url, method: request.method }, 'Route not found');
    return reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
      },
    });
  });
}
