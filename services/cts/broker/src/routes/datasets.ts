/**
 * Dataset Routes - CRUD Endpoints
 */

import { FastifyInstance } from 'fastify';
import DatasetRepository from '../repositories/dataset-repository';
import { validateCreateDataset, validateUpdateDataset } from '../validators/dataset.validator';
import { DatasetEventHandler } from '../events/dataset.event';
import { CreateDatasetRequest, UpdateDatasetRequest } from '../types/dataset';

export async function registerDatasetRoutes(app: FastifyInstance, repository: DatasetRepository) {
  /**
   * GET /datasets
   * List all datasets with pagination and optional search
   * Query params: page, pageSize, search
   */
  app.get<{ Querystring: { page?: string; pageSize?: string; search?: string } }>(
    '/datasets',
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
            message: 'Failed to fetch datasets',
          },
        });
      }
    }
  );

  /**
   * GET /datasets/:id
   * Get a specific dataset by ID
   */
  app.get<{ Params: { id: string } }>('/datasets/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const dataset = await repository.findById(id);

      if (!dataset) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: `Dataset with ID ${id} not found`,
          },
        });
      }

      return reply.send({ data: dataset });
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dataset',
        },
      });
    }
  });

  /**
   * GET /participants/:participantId/datasets
   * Get all datasets for a specific participant
   */
  app.get<{ Params: { participantId: string }; Querystring: { page?: string; pageSize?: string } }>(
    '/participants/:participantId/datasets',
    async (request, reply) => {
      try {
        const { participantId } = request.params;
        const page = parseInt(request.query.page || '1') || 1;
        const pageSize = parseInt(request.query.pageSize || '10') || 10;

        const result = await repository.findByParticipantId(participantId, page, pageSize);

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
            message: 'Failed to fetch datasets for participant',
          },
        });
      }
    }
  );

  /**
   * POST /datasets
   * Create a new dataset
   */
  app.post<{ Body: CreateDatasetRequest }>('/datasets', async (request, reply) => {
    try {
      // Validate input
      const validated = await validateCreateDataset(request.body);

      const dataset = await repository.create(validated);

      // Emit event
      const eventHandler = new DatasetEventHandler();
      await eventHandler.onDatasetCreated(dataset);

      return reply.status(201).send({ data: dataset });
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

      return reply.status(500).send({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create dataset',
        },
      });
    }
  });

  /**
   * PUT /datasets/:id
   * Update a dataset
   */
  app.put<{ Params: { id: string }; Body: UpdateDatasetRequest }>(
    '/datasets/:id',
    async (request, reply) => {
      try {
        const { id } = request.params;
        const updates = request.body;

        const dataset = await repository.update(id, updates);

        return reply.send({ data: dataset });
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
            message: 'Failed to update dataset',
          },
        });
      }
    }
  );

  /**
   * DELETE /datasets/:id
   * Delete a dataset
   */
  app.delete<{ Params: { id: string } }>('/datasets/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      await repository.delete(id);

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
          message: 'Failed to delete dataset',
        },
      });
    }
  });
}
