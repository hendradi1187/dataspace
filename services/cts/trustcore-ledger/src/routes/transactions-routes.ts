import type { FastifyInstance } from 'fastify';
import { LedgerRepository } from '../repositories/ledger-repository.js';
import { LedgerValidator } from '../validators/ledger-validator.js';
import { ledgerEventEmitter } from '../events/ledger-events.js';

export async function registerLedgerRoutes(app: FastifyInstance): Promise<void> {
  const repository = new LedgerRepository();
  const validator = new LedgerValidator();

  // GET /transactions - List all policies with pagination
  app.get<{
    Querystring: { page?: string; pageSize?: string };
  }>('/transactions', async (request, reply) => {
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

  // POST /transactions - Create a new ledger
  app.post<{ Body: any }>('/transactions', async (request, reply) => {
    try {
      const input = validator.validateCreateInput(request.body);
      const ledger = await repository.create(input);
      ledgerEventEmitter.emitLedgerCreated(ledger);
      return reply.status(201).send(ledger);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create ledger';
      return reply.status(400).send({ error: message });
    }
  });

  // GET /transactions/:id - Get a single ledger
  app.get<{
    Params: { id: string };
  }>('/transactions/:id', async (request, reply) => {
    try {
      const ledger = await repository.findById(request.params.id);
      if (!ledger) {
        return reply.status(404).send({ error: 'Ledger not found' });
      }
      return reply.send(ledger);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get ledger';
      return reply.status(500).send({ error: message });
    }
  });

  // PUT /transactions/:id - Update a ledger
  app.put<{ Params: { id: string }; Body: any }>('/transactions/:id', async (request, reply) => {
    try {
      const input = validator.validateUpdateInput(request.body);
      const ledger = await repository.update(request.params.id, input);

      if (!ledger) {
        return reply.status(404).send({ error: 'Ledger not found' });
      }

      ledgerEventEmitter.emitLedgerUpdated(ledger);
      return reply.send(ledger);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update ledger';
      return reply.status(400).send({ error: message });
    }
  });

  // DELETE /transactions/:id - Delete a ledger
  app.delete<{
    Params: { id: string };
  }>('/transactions/:id', async (request, reply) => {
    try {
      const success = await repository.delete(request.params.id);
      if (!success) {
        return reply.status(404).send({ error: 'Ledger not found' });
      }

      ledgerEventEmitter.emitLedgerDeleted(request.params.id);
      return reply.send({ id: request.params.id, message: 'Ledger deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete ledger';
      return reply.status(500).send({ error: message });
    }
  });
}
