import type { FastifyInstance } from 'fastify';
import { PolicyRepository } from '../repositories/policy-repository.js';
import { PolicyValidator } from '../validators/policy-validator.js';
import { policyEventEmitter } from '../events/policy-events.js';

export async function registerPolicyRoutes(app: FastifyInstance): Promise<void> {
  const repository = new PolicyRepository();
  const validator = new PolicyValidator();

  // GET /policies - List all policies with pagination
  app.get<{
    Querystring: { page?: string; pageSize?: string };
  }>('/policies', async (request, reply) => {
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

  // POST /policies - Create a new policy
  app.post<{ Body: any }>('/policies', async (request, reply) => {
    try {
      const input = validator.validateCreateInput(request.body);
      const policy = await repository.create(input);
      policyEventEmitter.emitPolicyCreated(policy);
      return reply.status(201).send(policy);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create policy';
      return reply.status(400).send({ error: message });
    }
  });

  // GET /policies/:id - Get a single policy
  app.get<{
    Params: { id: string };
  }>('/policies/:id', async (request, reply) => {
    try {
      const policy = await repository.findById(request.params.id);
      if (!policy) {
        return reply.status(404).send({ error: 'Policy not found' });
      }
      return reply.send(policy);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get policy';
      return reply.status(500).send({ error: message });
    }
  });

  // PUT /policies/:id - Update a policy
  app.put<{ Params: { id: string }; Body: any }>('/policies/:id', async (request, reply) => {
    try {
      const input = validator.validateUpdateInput(request.body);
      const policy = await repository.update(request.params.id, input);

      if (!policy) {
        return reply.status(404).send({ error: 'Policy not found' });
      }

      policyEventEmitter.emitPolicyUpdated(policy);
      return reply.send(policy);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update policy';
      return reply.status(400).send({ error: message });
    }
  });

  // DELETE /policies/:id - Delete a policy
  app.delete<{
    Params: { id: string };
  }>('/policies/:id', async (request, reply) => {
    try {
      const success = await repository.delete(request.params.id);
      if (!success) {
        return reply.status(404).send({ error: 'Policy not found' });
      }

      policyEventEmitter.emitPolicyDeleted(request.params.id);
      return reply.send({ id: request.params.id, message: 'Policy deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete policy';
      return reply.status(500).send({ error: message });
    }
  });
}
