import type { FastifyInstance } from 'fastify';
import { ClearingRepository } from '../repositories/clearing-repository.js';
import { ClearingValidator } from '../validators/clearing-validator.js';
import { clearingEventEmitter } from '../events/clearing-events.js';

export async function registerClearingRoutes(app: FastifyInstance): Promise<void> {
  const repository = new ClearingRepository();
  const validator = new ClearingValidator();

  // GET /clearing-records - List all policies with pagination
  app.get<{
    Querystring: { page?: string; pageSize?: string };
  }>('/clearing-records', async (request, reply) => {
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

  // POST /clearing-records - Create a new clearing
  app.post<{ Body: any }>('/clearing-records', async (request, reply) => {
    try {
      const input = validator.validateCreateInput(request.body);
      const clearing = await repository.create(input);
      clearingEventEmitter.emitClearingCreated(clearing);
      return reply.status(201).send(clearing);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create clearing';
      return reply.status(400).send({ error: message });
    }
  });

  // GET /clearing-records/:id - Get a single clearing
  app.get<{
    Params: { id: string };
  }>('/clearing-records/:id', async (request, reply) => {
    try {
      const clearing = await repository.findById(request.params.id);
      if (!clearing) {
        return reply.status(404).send({ error: 'Clearing not found' });
      }
      return reply.send(clearing);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get clearing';
      return reply.status(500).send({ error: message });
    }
  });

  // PUT /clearing-records/:id - Update a clearing
  app.put<{ Params: { id: string }; Body: any }>('/clearing-records/:id', async (request, reply) => {
    try {
      const input = validator.validateUpdateInput(request.body);
      const clearing = await repository.update(request.params.id, input);

      if (!clearing) {
        return reply.status(404).send({ error: 'Clearing not found' });
      }

      clearingEventEmitter.emitClearingUpdated(clearing);
      return reply.send(clearing);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update clearing';
      return reply.status(400).send({ error: message });
    }
  });

  // DELETE /clearing-records/:id - Delete a clearing
  app.delete<{
    Params: { id: string };
  }>('/clearing-records/:id', async (request, reply) => {
    try {
      const success = await repository.delete(request.params.id);
      if (!success) {
        return reply.status(404).send({ error: 'Clearing not found' });
      }

      clearingEventEmitter.emitClearingDeleted(request.params.id);
      return reply.send({ id: request.params.id, message: 'Clearing deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete clearing';
      return reply.status(500).send({ error: message });
    }
  });
}
