import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import { registerAppstoreRoutes } from './routes/apps-routes.js';

const app = Fastify({
  logger: true,
});

// Register plugins
await app.register(helmet);
await app.register(cors);

// Health check endpoint
app.get('/health', async (request, reply) => {
  return { status: 'healthy', service: 'trustcore-appstore' };
});

// Register routes
await registerAppstoreRoutes(app);

// Start server
const start = async () => {
  try {
    await app.listen({ port: 3008, host: '0.0.0.0' });
    console.log('TrustCore Appstore Service running on http://localhost:3008');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
