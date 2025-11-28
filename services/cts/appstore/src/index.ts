import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';

const app = Fastify({
  logger: true,
});

// Register plugins
await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cors);

// Health check endpoint
app.get('/health', async (request, reply) => {
  return { status: 'healthy', service: 'appstore' };
});

// Start server
const start = async () => {
  try {
    await app.listen({ port: 3008, host: '0.0.0.0' });
    console.log('AppStore Service running on http://localhost:3008');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
