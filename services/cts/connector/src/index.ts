import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { query, initializePool } from '@dataspace/db';
import { v4 as uuidv4 } from 'uuid';

const PORT = parseInt(process.env.PORT || '3009', 10);
const HOST = process.env.HOST || '0.0.0.0';

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

interface Connector {
  id: string;
  name: string;
  description?: string;
  connectorType?: string;
  config?: any;
  status: string;
  createdAt: string;
  updatedAt: string;
}

async function start() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors);
  await fastify.register(helmet);

  fastify.get('/health', async (request, reply) => {
    return { status: 'ok' };
  });

  /**
   * GET /connectors
   * List all connectors with pagination
   */
  fastify.get<{ Querystring: { page?: string; pageSize?: string } }>(
    '/connectors',
    async (request, reply) => {
      try {
        const page = parseInt(request.query.page || '1') || 1;
        const pageSize = parseInt(request.query.pageSize || '10') || 10;

        const countResult = await query('SELECT COUNT(*) FROM connectors');
        const total = parseInt(countResult.rows[0].count, 10);

        const offset = (page - 1) * pageSize;
        const result = await query(
          `SELECT id, name, description, connector_type as "connectorType", config,
                  status, created_at as "createdAt", updated_at as "updatedAt"
           FROM connectors
           ORDER BY created_at DESC
           LIMIT $1 OFFSET $2`,
          [pageSize, offset]
        );

        const totalPages = Math.ceil(total / pageSize);
        return reply.send({
          data: result.rows.map((row: any) => ({
            ...row,
            config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
          })),
          total,
          page,
          pageSize,
          totalPages,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch connectors',
          },
        });
      }
    }
  );

  /**
   * GET /connectors/:id
   * Get single connector
   */
  fastify.get<{ Params: { id: string } }>(
    '/connectors/:id',
    async (request, reply) => {
      try {
        const { id } = request.params;
        const result = await query(
          `SELECT id, name, description, connector_type as "connectorType", config,
                  status, created_at as "createdAt", updated_at as "updatedAt"
           FROM connectors
           WHERE id = $1`,
          [id]
        );

        if (result.rows.length === 0) {
          return reply.status(404).send({
            error: {
              code: 'NOT_FOUND',
              message: `Connector with ID ${id} not found`,
            },
          });
        }

        const row = result.rows[0];
        return reply.send({
          data: {
            ...row,
            config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch connector',
          },
        });
      }
    }
  );

  /**
   * POST /connectors
   * Create new connector
   */
  fastify.post<{ Body: any }>(
    '/connectors',
    async (request, reply) => {
      try {
        const { name, description, connectorType, config, status } = request.body;

        if (!name) {
          return reply.status(400).send({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'name is required',
            },
          });
        }

        const id = uuidv4();
        const result = await query(
          `INSERT INTO connectors
           (id, name, description, connector_type, config, status)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, name, description, connector_type as "connectorType", config,
                     status, created_at as "createdAt", updated_at as "updatedAt"`,
          [id, name, description || '', connectorType || '', JSON.stringify(config || {}), status || 'draft']
        );

        const row = result.rows[0];
        return reply.status(201).send({
          data: {
            ...row,
            config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create connector',
          },
        });
      }
    }
  );

  /**
   * PUT /connectors/:id
   * Update connector
   */
  fastify.put<{ Params: { id: string }; Body: any }>(
    '/connectors/:id',
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { name, description, connectorType, config, status } = request.body;

        const updateFields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (name !== undefined) {
          updateFields.push(`name = $${paramIndex}`);
          values.push(name);
          paramIndex++;
        }

        if (description !== undefined) {
          updateFields.push(`description = $${paramIndex}`);
          values.push(description);
          paramIndex++;
        }

        if (connectorType !== undefined) {
          updateFields.push(`connector_type = $${paramIndex}`);
          values.push(connectorType);
          paramIndex++;
        }

        if (config !== undefined) {
          updateFields.push(`config = $${paramIndex}`);
          values.push(JSON.stringify(config));
          paramIndex++;
        }

        if (status !== undefined) {
          updateFields.push(`status = $${paramIndex}`);
          values.push(status);
          paramIndex++;
        }

        if (updateFields.length === 0) {
          return reply.status(400).send({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'No fields to update',
            },
          });
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const result = await query(
          `UPDATE connectors
           SET ${updateFields.join(', ')}
           WHERE id = $${paramIndex}
           RETURNING id, name, description, connector_type as "connectorType", config,
                     status, created_at as "createdAt", updated_at as "updatedAt"`,
          values
        );

        if (result.rows.length === 0) {
          return reply.status(404).send({
            error: {
              code: 'NOT_FOUND',
              message: `Connector with ID ${id} not found`,
            },
          });
        }

        const row = result.rows[0];
        return reply.send({
          data: {
            ...row,
            config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update connector',
          },
        });
      }
    }
  );

  /**
   * DELETE /connectors/:id
   * Delete connector
   */
  fastify.delete<{ Params: { id: string } }>(
    '/connectors/:id',
    async (request, reply) => {
      try {
        const { id } = request.params;

        const checkResult = await query(
          'SELECT id FROM connectors WHERE id = $1',
          [id]
        );

        if (checkResult.rows.length === 0) {
          return reply.status(404).send({
            error: {
              code: 'NOT_FOUND',
              message: `Connector with ID ${id} not found`,
            },
          });
        }

        await query('DELETE FROM connectors WHERE id = $1', [id]);

        return reply.status(204).send();
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete connector',
          },
        });
      }
    }
  );

  fastify.get('/credentials', async (request, reply) => {
    return { message: 'Connector service is running' };
  });

  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Connector service listening on ${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
