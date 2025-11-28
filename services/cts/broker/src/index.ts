import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import { initializePool } from '@dataspace/db';
import ParticipantRepository from './repositories/participant-repository';
import DatasetRepository from './repositories/dataset-repository';
import { registerParticipantRoutes } from './routes/participants';
import { registerDatasetRoutes } from './routes/datasets';

const app = Fastify({
  logger: true,
});

// Register plugins
await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cors, {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
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
const participantRepository = new ParticipantRepository();
const datasetRepository = new DatasetRepository();

// Register routes
await registerParticipantRoutes(app, participantRepository);
await registerDatasetRoutes(app, datasetRepository);

// Health check endpoint
app.get('/health', async (request, reply) => {
  return { status: 'healthy', service: 'cts-broker' };
});

// Start server
const start = async () => {
  try {
    await app.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Broker Service running on http://localhost:3001');
    console.log('Available endpoints:');
    console.log('  GET    /health');
    console.log('  GET    /participants');
    console.log('  GET    /participants/:id');
    console.log('  POST   /participants');
    console.log('  PUT    /participants/:id');
    console.log('  DELETE /participants/:id');
    console.log('  GET    /datasets');
    console.log('  GET    /datasets/:id');
    console.log('  GET    /participants/:participantId/datasets');
    console.log('  POST   /datasets');
    console.log('  PUT    /datasets/:id');
    console.log('  DELETE /datasets/:id');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
