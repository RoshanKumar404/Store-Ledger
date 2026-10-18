import { buildApp } from './app.js';
import { validateEnv } from './config/env.js';

async function startServer(): Promise<void> {
  const env = validateEnv();
  const app = buildApp({ envConfig: env });

  try {
    const address = await app.listen({
      port: env.PORT,
      host: env.HOST,
    });
    app.log.info(`Kirana Ledger server listening on ${address} [ENV: ${env.NODE_ENV}]`);
  } catch (err) {
    app.log.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }

  // Graceful shutdown handling
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, initiating graceful shutdown...`);
      try {
        await app.close();
        app.log.info('Server gracefully closed.');
        process.exit(0);
      } catch (closeErr) {
        app.log.error({ err: closeErr }, 'Error during graceful shutdown');
        process.exit(1);
      }
    });
  }
}

// Automatically start if executed as primary module
if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Fatal bootstrap error:', err);
    process.exit(1);
  });
}

export { startServer };
