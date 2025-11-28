/**
 * API Key Routes - CRUD Endpoints
 */

import { FastifyInstance } from 'fastify';
import ApiKeyRepository from '../repositories/apikey-repository';
import { validateCreateApiKey, validateUpdateApiKey } from '../validators/apikey.validator';
import { ApiKeyEventHandler } from '../events/apikey.event';

export async function registerApiKeyRoutes(
  app: FastifyInstance,
  repository: ApiKeyRepository
) {
  /**
   * GET /apikeys
   * List all API keys
   */
  app.get<{ Querystring: { page?: string; pageSize?: string; participantId?: string } }>(
    '/apikeys',
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
        return reply.status(500).send({ error: 'Failed to fetch API keys' });
      }
    }
  );

  /**
   * GET /apikeys/:id
   * Get a specific API key
   */
  app.get<{ Params: { id: string } }>('/apikeys/:id', async (request, reply) => {
    try {
      const apiKey = await repository.findById(request.params.id);
      if (!apiKey) {
        return reply.status(404).send({ error: 'API Key not found' });
      }
      return reply.send({ data: apiKey });
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch API key' });
    }
  });

  /**
   * POST /apikeys
   * Create a new API key
   */
  app.post<{ Body: any }>('/apikeys', async (request, reply) => {
    try {
      const validated = await validateCreateApiKey(request.body);
      const apiKey = await repository.create(validated);

      const eventHandler = new ApiKeyEventHandler();
      await eventHandler.onApiKeyCreated(apiKey);

      return reply.status(201).send({ data: apiKey });
    } catch (error: any) {
      app.log.error(error);

      if (error.message?.includes('Invalid')) {
        return reply.status(400).send({ error: error.message });
      }

      return reply.status(500).send({ error: 'Failed to create API key' });
    }
  });

  /**
   * PUT /apikeys/:id
   * Update an API key
   */
  app.put<{ Params: { id: string }; Body: any }>(
    '/apikeys/:id',
    async (request, reply) => {
      try {
        const validated = await validateUpdateApiKey(request.body);
        const apiKey = await repository.update(request.params.id, validated);

        return reply.send({ data: apiKey });
      } catch (error: any) {
        app.log.error(error);

        if (error.message?.includes('Invalid')) {
          return reply.status(400).send({ error: error.message });
        }
        if (error.message?.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }

        return reply.status(500).send({ error: 'Failed to update API key' });
      }
    }
  );

  /**
   * DELETE /apikeys/:id
   * Revoke/delete an API key
   */
  app.delete<{ Params: { id: string } }>('/apikeys/:id', async (request, reply) => {
    try {
      const apiKey = await repository.findById(request.params.id);
      if (!apiKey) {
        return reply.status(404).send({ error: 'API Key not found' });
      }

      await repository.delete(request.params.id);

      const eventHandler = new ApiKeyEventHandler();
      await eventHandler.onApiKeyRevoked(apiKey);

      return reply.status(204).send();
    } catch (error: any) {
      app.log.error(error);

      if (error.message?.includes('not found')) {
        return reply.status(404).send({ error: error.message });
      }

      return reply.status(500).send({ error: 'Failed to delete API key' });
    }
  });
}
