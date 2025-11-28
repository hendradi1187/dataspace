/**
 * Participant Routes - CRUD Endpoints
 */

import { FastifyInstance } from 'fastify';
import ParticipantRepository from '../repositories/participant-repository';
import { validateCreateParticipant, validateUpdateParticipant } from '../validators/participant.validator';
import { ParticipantEventHandler } from '../events/participant.event';
import { CreateParticipantRequest, UpdateParticipantRequest } from '../types/participant';

export async function registerParticipantRoutes(app: FastifyInstance, repository: ParticipantRepository) {
  /**
   * GET /participants
   * List all participants with pagination and optional search
   * Query params: page, pageSize, search
   */
  app.get<{ Querystring: { page?: string; pageSize?: string; search?: string } }>(
    '/participants',
    async (request, reply) => {
      try {
        const page = parseInt(request.query.page || '1') || 1;
        const pageSize = parseInt(request.query.pageSize || '10') || 10;
        const search = request.query.search || '';

        let result;
        if (search) {
          result = await repository.search(search, page, pageSize);
        } else {
          result = await repository.findAll(page, pageSize);
        }

        return reply.send({
          data: result.data,
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
        });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch participants',
          },
        });
      }
    }
  );

  /**
   * GET /participants/:id
   * Get a specific participant by ID
   */
  app.get<{ Params: { id: string } }>('/participants/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const participant = await repository.findById(id);

      if (!participant) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: `Participant with ID ${id} not found`,
          },
        });
      }

      return reply.send({ data: participant });
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch participant',
        },
      });
    }
  });

  /**
   * POST /participants
   * Create a new participant
   */
  app.post<{ Body: CreateParticipantRequest }>('/participants', async (request, reply) => {
    try {
      // Validate input
      const validated = await validateCreateParticipant(request.body);

      const participant = await repository.create(validated);

      // Emit event
      const eventHandler = new ParticipantEventHandler();
      await eventHandler.onParticipantCreated(participant);

      return reply.status(201).send({ data: participant });
    } catch (error: any) {
      app.log.error(error);

      if (error.message && error.message.includes('already exists')) {
        return reply.status(409).send({
          error: {
            code: 'CONFLICT',
            message: error.message,
          },
        });
      }

      if (error.message && error.message.includes('Invalid')) {
        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }

      return reply.status(500).send({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create participant',
        },
      });
    }
  });

  /**
   * PUT /participants/:id
   * Update a participant
   */
  app.put<{ Params: { id: string }; Body: UpdateParticipantRequest }>(
    '/participants/:id',
    async (request, reply) => {
      try {
        const { id } = request.params;
        const validated = await validateUpdateParticipant(request.body);

        const oldParticipant = await repository.findById(id);
        if (!oldParticipant) {
          return reply.status(404).send({
            error: {
              code: 'NOT_FOUND',
              message: `Participant with ID ${id} not found`,
            },
          });
        }

        const participant = await repository.update(id, validated);

        // Emit event
        const eventHandler = new ParticipantEventHandler();
        await eventHandler.onParticipantUpdated(oldParticipant, participant);

        return reply.send({ data: participant });
      } catch (error: any) {
        app.log.error(error);

        if (error.message && error.message.includes('Invalid')) {
          return reply.status(400).send({
            error: {
              code: 'VALIDATION_ERROR',
              message: error.message,
            },
          });
        }

        if (error.message && error.message.includes('not found')) {
          return reply.status(404).send({
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          });
        }

        return reply.status(500).send({
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update participant',
          },
        });
      }
    }
  );

  /**
   * DELETE /participants/:id
   * Delete a participant
   */
  app.delete<{ Params: { id: string } }>('/participants/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      const participant = await repository.findById(id);
      if (!participant) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: `Participant with ID ${id} not found`,
          },
        });
      }

      await repository.delete(id);

      // Emit event
      const eventHandler = new ParticipantEventHandler();
      await eventHandler.onParticipantDeleted(participant);

      return reply.status(204).send();
    } catch (error: any) {
      app.log.error(error);

      if (error.message && error.message.includes('not found')) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
      }

      return reply.status(500).send({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete participant',
        },
      });
    }
  });
}
