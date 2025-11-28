import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import { initializePool } from '@dataspace/db';
import CredentialRepository from './repositories/credential-repository';
import ApiKeyRepository from './repositories/apikey-repository';
import { registerRoutes } from './routes';

const app = Fastify({
  logger: true,
});

// Register plugins
await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cors, {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
});

// Initialize database pool
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'dataspace_dev',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
};

console.log('Initializing database pool with config:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
});

try {
  initializePool(dbConfig);
  console.log('Database pool initialized successfully');
} catch (error) {
  console.error('Failed to initialize database pool:', error);
  process.exit(1);
}

// Initialize repositories
const credentialRepository = new CredentialRepository();
const apiKeyRepository = new ApiKeyRepository();

// Register routes
await registerRoutes(app, credentialRepository, apiKeyRepository);

// Health check endpoint
app.get('/health', async (request, reply) => {
  return {
    status: 'healthy',
    service: 'cts-idp',
    timestamp: new Date().toISOString(),
  };
});

// Start server
const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('IDP Service running on http://localhost:3000');
    console.log('Available endpoints:');
    console.log('  GET    /health');
    console.log('  GET    /credentials');
    console.log('  GET    /credentials/:id');
    console.log('  POST   /credentials');
    console.log('  PUT    /credentials/:id');
    console.log('  DELETE /credentials/:id');
    console.log('  GET    /apikeys');
    console.log('  GET    /apikeys/:id');
    console.log('  POST   /apikeys');
    console.log('  PUT    /apikeys/:id');
    console.log('  DELETE /apikeys/:id');
    console.log('  GET    /users');
    console.log('  GET    /users/:id');
    console.log('  POST   /users');
    console.log('  PUT    /users/:id');
    console.log('  DELETE /users/:id');
    console.log('  GET    /roles');
    console.log('  POST   /token (OAuth2 token endpoint)');
    console.log('  POST   /token/refresh');
    console.log('  POST   /token/revoke');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
