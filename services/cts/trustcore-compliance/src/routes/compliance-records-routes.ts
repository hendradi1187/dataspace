import type { FastifyInstance } from 'fastify';
import { ComplianceRepository } from '../repositories/compliance-repository.js';
import { ComplianceValidator } from '../validators/compliance-validator.js';
import { complianceEventEmitter } from '../events/compliance-events.js';

export async function registerComplianceRoutes(app: FastifyInstance): Promise<void> {
  const repository = new ComplianceRepository();
  const validator = new ComplianceValidator();

  // GET /compliance-records - List all policies with pagination
  app.get<{
    Querystring: { page?: string; pageSize?: string };
  }>('/compliance-records', async (request, reply) => {
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

  // POST /compliance-records - Create a new compliance
  app.post<{ Body: any }>('/compliance-records', async (request, reply) => {
    try {
      const input = validator.validateCreateInput(request.body);
      const compliance = await repository.create(input);
      complianceEventEmitter.emitComplianceCreated(compliance);
      return reply.status(201).send(compliance);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create compliance';
      return reply.status(400).send({ error: message });
    }
  });

  // GET /compliance-records/:id - Get a single compliance
  app.get<{
    Params: { id: string };
  }>('/compliance-records/:id', async (request, reply) => {
    try {
      const compliance = await repository.findById(request.params.id);
      if (!compliance) {
        return reply.status(404).send({ error: 'Compliance not found' });
      }
      return reply.send(compliance);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get compliance';
      return reply.status(500).send({ error: message });
    }
  });

  // PUT /compliance-records/:id - Update a compliance
  app.put<{ Params: { id: string }; Body: any }>('/compliance-records/:id', async (request, reply) => {
    try {
      const input = validator.validateUpdateInput(request.body);
      const compliance = await repository.update(request.params.id, input);

      if (!compliance) {
        return reply.status(404).send({ error: 'Compliance not found' });
      }

      complianceEventEmitter.emitComplianceUpdated(compliance);
      return reply.send(compliance);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update compliance';
      return reply.status(400).send({ error: message });
    }
  });

  // DELETE /compliance-records/:id - Delete a compliance
  app.delete<{
    Params: { id: string };
  }>('/compliance-records/:id', async (request, reply) => {
    try {
      const success = await repository.delete(request.params.id);
      if (!success) {
        return reply.status(404).send({ error: 'Compliance not found' });
      }

      complianceEventEmitter.emitComplianceDeleted(request.params.id);
      return reply.send({ id: request.params.id, message: 'Compliance deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete compliance';
      return reply.status(500).send({ error: message });
    }
  });
}
