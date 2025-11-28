/**
 * Credential Routes - CRUD Endpoints
 */

import { FastifyInstance } from 'fastify';
import CredentialRepository from '../repositories/credential-repository';
import { validateCreateCredential, validateUpdateCredential } from '../validators/credential.validator';
import { CredentialEventHandler } from '../events/credential.event';

export async function registerCredentialRoutes(
  app: FastifyInstance,
  repository: CredentialRepository
) {
  /**
   * GET /credentials
   * List all credentials
   */
  app.get<{ Querystring: { page?: string; pageSize?: string; participantId?: string } }>(
    '/credentials',
    async (request, reply) => {
      try {
        const page = parseInt(request.query.page || '1') || 1;
        const pageSize = parseInt(request.query.pageSize || '10') || 10;
        const participantId = request.query.participantId;

        let result;
        if (participantId) {
          result = await repository.findByParticipantId(participantId, page, pageSize);
        } else {
          result = await repository.findAll(page, pageSize);
        }

        return reply.send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch credentials' });
      }
    }
  );

  /**
   * GET /credentials/:id
   * Get a specific credential
   */
  app.get<{ Params: { id: string } }>('/credentials/:id', async (request, reply) => {
    try {
      const credential = await repository.findById(request.params.id);
      if (!credential) {
        return reply.status(404).send({ error: 'Credential not found' });
      }
      return reply.send({ data: credential });
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch credential' });
    }
  });

  /**
   * POST /credentials
   * Create a new credential
   */
  app.post<{ Body: any }>('/credentials', async (request, reply) => {
    try {
      const validated = await validateCreateCredential(request.body);
      const credential = await repository.create(validated);

      const eventHandler = new CredentialEventHandler();
      await eventHandler.onCredentialCreated(credential);

      return reply.status(201).send({ data: credential });
    } catch (error: any) {
      app.log.error(error);

      if (error.message?.includes('Invalid')) {
        return reply.status(400).send({ error: error.message });
      }
      if (error.message?.includes('already exists')) {
        return reply.status(409).send({ error: error.message });
      }

      return reply.status(500).send({ error: 'Failed to create credential' });
    }
  });

  /**
   * PUT /credentials/:id
   * Update a credential
   */
  app.put<{ Params: { id: string }; Body: any }>(
    '/credentials/:id',
    async (request, reply) => {
      try {
        const validated = await validateUpdateCredential(request.body);
        const oldCredential = await repository.findById(request.params.id);

        if (!oldCredential) {
          return reply.status(404).send({ error: 'Credential not found' });
        }

        const credential = await repository.update(request.params.id, validated);

        const eventHandler = new CredentialEventHandler();
        if (oldCredential.scope !== credential.scope) {
          await eventHandler.onScopeChanged(credential, oldCredential.scope, credential.scope);
        }

        return reply.send({ data: credential });
      } catch (error: any) {
        app.log.error(error);

        if (error.message?.includes('Invalid')) {
          return reply.status(400).send({ error: error.message });
        }
        if (error.message?.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }

        return reply.status(500).send({ error: 'Failed to update credential' });
      }
    }
  );

  /**
   * DELETE /credentials/:id
   * Revoke/delete a credential
   */
  app.delete<{ Params: { id: string } }>('/credentials/:id', async (request, reply) => {
    try {
      const credential = await repository.findById(request.params.id);
      if (!credential) {
        return reply.status(404).send({ error: 'Credential not found' });
      }

      await repository.delete(request.params.id);

      const eventHandler = new CredentialEventHandler();
      await eventHandler.onCredentialRevoked(credential);

      return reply.status(204).send();
    } catch (error: any) {
      app.log.error(error);

      if (error.message?.includes('not found')) {
        return reply.status(404).send({ error: error.message });
      }

      return reply.status(500).send({ error: 'Failed to delete credential' });
    }
  });
}
