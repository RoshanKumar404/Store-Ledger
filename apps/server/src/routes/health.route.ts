import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { PROTOCOL_VERSION } from '@kirana/shared';

/**
 * Health Route Plugin (§BE-01)
 * Provides a lightweight, non-allocating health check endpoint.
 * Consumed by uptime monitors and mobile client diagnostics (§FE-19).
 */
export const healthRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/health', async (_request, reply) => {
    return reply.status(200).send({
      status: 'ok',
      timestamp: Date.now(),
      uptime: Math.floor(process.uptime()),
      version: PROTOCOL_VERSION,
    });
  });
};
