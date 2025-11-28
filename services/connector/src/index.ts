import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';

const app = Fastify({
  logger: true,
});

// Register plugins
await app.register(helmet);
await app.register(cors);
await app.register(multipart);

// Health check endpoint
app.get('/connector/health', async (request, reply) => {
  return { status: 'healthy', service: 'connector' };
});

// Module routes (placeholder)
// Metadata routes - /connector/metadata/*
// Policy-Contract routes - /connector/policy-contract/*
// Auth-Protocol routes - /connector/auth-protocol/*
// App-Management routes - /connector/app-management/*
// Delivery routes - /connector/delivery/*

// Start server
const start = async () => {
  try {
    await app.listen({ port: 3009, host: '0.0.0.0' });
    console.log('Connector Service running on http://localhost:3009');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
