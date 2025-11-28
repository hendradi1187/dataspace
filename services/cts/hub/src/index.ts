import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import { initializePool } from '@dataspace/db';
import SchemaRepository from './repositories/schema-repository';
import VocabularyRepository from './repositories/vocabulary-repository';
import { registerRoutes } from './routes';

const app = Fastify({ logger: true });

await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cors);

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

const schemaRepo = new SchemaRepository();
const vocabRepo = new VocabularyRepository();
await registerRoutes(app, schemaRepo, vocabRepo);

app.get('/health', async (request, reply) => {
  return { status: 'healthy', service: 'cts-hub', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    await app.listen({ port: 3002, host: '0.0.0.0' });
    console.log('Hub Service running on http://localhost:3002');
    console.log('Endpoints: GET /schemas, POST /schemas, GET /vocabularies, POST /vocabularies');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
