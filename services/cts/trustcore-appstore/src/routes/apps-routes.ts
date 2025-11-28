import type { FastifyInstance } from 'fastify';
import { AppstoreRepository } from '../repositories/appstore-repository.js';
import { AppstoreValidator } from '../validators/appstore-validator.js';
import { appstoreEventEmitter } from '../events/appstore-events.js';

export async function registerAppstoreRoutes(app: FastifyInstance): Promise<void> {
  const repository = new AppstoreRepository();
  const validator = new AppstoreValidator();

  // GET /apps - List all policies with pagination
  app.get<{
    Querystring: { page?: string; pageSize?: string };
  }>('/apps', async (request, reply) => {
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

  // POST /apps - Create a new appstore
  app.post<{ Body: any }>('/apps', async (request, reply) => {
    try {
      const input = validator.validateCreateInput(request.body);
      const appstore = await repository.create(input);
      appstoreEventEmitter.emitAppstoreCreated(appstore);
      return reply.status(201).send(appstore);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create appstore';
      return reply.status(400).send({ error: message });
    }
  });

  // GET /apps/:id - Get a single appstore
  app.get<{
    Params: { id: string };
  }>('/apps/:id', async (request, reply) => {
    try {
      const appstore = await repository.findById(request.params.id);
      if (!appstore) {
        return reply.status(404).send({ error: 'Appstore not found' });
      }
      return reply.send(appstore);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get appstore';
      return reply.status(500).send({ error: message });
    }
  });

  // PUT /apps/:id - Update a appstore
  app.put<{ Params: { id: string }; Body: any }>('/apps/:id', async (request, reply) => {
    try {
      const input = validator.validateUpdateInput(request.body);
      const appstore = await repository.update(request.params.id, input);

      if (!appstore) {
        return reply.status(404).send({ error: 'Appstore not found' });
      }

      appstoreEventEmitter.emitAppstoreUpdated(appstore);
      return reply.send(appstore);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update appstore';
      return reply.status(400).send({ error: message });
    }
  });

  // DELETE /apps/:id - Delete a appstore
  app.delete<{
    Params: { id: string };
  }>('/apps/:id', async (request, reply) => {
    try {
      const success = await repository.delete(request.params.id);
      if (!success) {
        return reply.status(404).send({ error: 'Appstore not found' });
      }

      appstoreEventEmitter.emitAppstoreDeleted(request.params.id);
      return reply.send({ id: request.params.id, message: 'Appstore deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete appstore';
      return reply.status(500).send({ error: message });
    }
  });
}
