import type { FastifyInstance } from 'fastify';
import { ContractRepository } from '../repositories/contract-repository.js';
import { ContractValidator } from '../validators/contract-validator.js';
import { contractEventEmitter } from '../events/contract-events.js';

export async function registerContractRoutes(app: FastifyInstance): Promise<void> {
  const repository = new ContractRepository();
  const validator = new ContractValidator();

  // GET /contracts - List all contracts with pagination
  app.get<{
    Querystring: { page?: string; pageSize?: string };
  }>('/contracts', async (request, reply) => {
    try {
      const page = request.query.page ? parseInt(request.query.page) : 1;
      const pageSize = request.query.pageSize ? parseInt(request.query.pageSize) : 10;

      const result = await repository.findAll(page, pageSize);
      return reply.send(result.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list contracts';
      return reply.status(500).send({ error: message });
    }
  });

  // POST /contracts - Create a new contract
  app.post<{ Body: any }>('/contracts', async (request, reply) => {
    try {
      const input = validator.validateCreateInput(request.body);
      const contract = await repository.create(input);
      contractEventEmitter.emitContractCreated(contract);
      return reply.status(201).send(contract);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create contract';
      return reply.status(400).send({ error: message });
    }
  });

  // GET /contracts/:id - Get a single contract
  app.get<{
    Params: { id: string };
  }>('/contracts/:id', async (request, reply) => {
    try {
      const contract = await repository.findById(request.params.id);
      if (!contract) {
        return reply.status(404).send({ error: 'Contract not found' });
      }
      return reply.send(contract);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get contract';
      return reply.status(500).send({ error: message });
    }
  });

  // PUT /contracts/:id - Update a contract
  app.put<{ Params: { id: string }; Body: any }>('/contracts/:id', async (request, reply) => {
    try {
      const input = validator.validateUpdateInput(request.body);
      const contract = await repository.update(request.params.id, input);

      if (!contract) {
        return reply.status(404).send({ error: 'Contract not found' });
      }

      contractEventEmitter.emitContractUpdated(contract);
      return reply.send(contract);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update contract';
      return reply.status(400).send({ error: message });
    }
  });

  // DELETE /contracts/:id - Delete a contract
  app.delete<{
    Params: { id: string };
  }>('/contracts/:id', async (request, reply) => {
    try {
      const success = await repository.delete(request.params.id);
      if (!success) {
        return reply.status(404).send({ error: 'Contract not found' });
      }

      contractEventEmitter.emitContractDeleted(request.params.id);
      return reply.send({ id: request.params.id, message: 'Contract deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete contract';
      return reply.status(500).send({ error: message });
    }
  });
}
