import type { FastifyInstance } from 'fastify';
import { ConnectorRepository } from '../repositories/connector-repository.js';
import { ConnectorValidator } from '../validators/connector-validator.js';
import { connectorEventEmitter } from '../events/connector-events.js';

export async function registerConnectorRoutes(app: FastifyInstance): Promise<void> {
  const repository = new ConnectorRepository();
  const validator = new ConnectorValidator();

  // GET /connectors - List all policies with pagination
  app.get<{
    Querystring: { page?: string; pageSize?: string };
  }>('/connectors', async (request, reply) => {
    try {
      const page = request.query.page ? parseInt(request.query.page) : 1;
      const pageSize = request.query.pageSize ? parseInt(request.query.pageSize) : 10;

      const result = await repository.findAll(page, pageSize);
      return reply.send(result.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list policies';
      return reply.status(500).send({ error: message });
    }
  });

  // POST /connectors - Create a new connector
  app.post<{ Body: any }>('/connectors', async (request, reply) => {
    try {
      const input = validator.validateCreateInput(request.body);
      const connector = await repository.create(input);
      connectorEventEmitter.emitConnectorCreated(connector);
      return reply.status(201).send(connector);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create connector';
      return reply.status(400).send({ error: message });
    }
  });

  // GET /connectors/:id - Get a single connector
  app.get<{
    Params: { id: string };
  }>('/connectors/:id', async (request, reply) => {
    try {
      const connector = await repository.findById(request.params.id);
      if (!connector) {
        return reply.status(404).send({ error: 'Connector not found' });
      }
      return reply.send(connector);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get connector';
      return reply.status(500).send({ error: message });
    }
  });

  // PUT /connectors/:id - Update a connector
  app.put<{ Params: { id: string }; Body: any }>('/connectors/:id', async (request, reply) => {
    try {
      const input = validator.validateUpdateInput(request.body);
      const connector = await repository.update(request.params.id, input);

      if (!connector) {
        return reply.status(404).send({ error: 'Connector not found' });
      }

      connectorEventEmitter.emitConnectorUpdated(connector);
      return reply.send(connector);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update connector';
      return reply.status(400).send({ error: message });
    }
  });

  // DELETE /connectors/:id - Delete a connector
  app.delete<{
    Params: { id: string };
  }>('/connectors/:id', async (request, reply) => {
    try {
      const success = await repository.delete(request.params.id);
      if (!success) {
        return reply.status(404).send({ error: 'Connector not found' });
      }

      connectorEventEmitter.emitConnectorDeleted(request.params.id);
      return reply.send({ id: request.params.id, message: 'Connector deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete connector';
      return reply.status(500).send({ error: message });
    }
  });
}
