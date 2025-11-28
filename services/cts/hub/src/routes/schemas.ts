import { FastifyInstance } from 'fastify';
import SchemaRepository from '../repositories/schema-repository';
import { SchemaEventHandler } from '../events/schema.event';
import { CreateSchemaRequest, UpdateSchemaRequest } from '../types';

export async function registerSchemaRoutes(app: FastifyInstance, repo: SchemaRepository) {
  app.get<{ Querystring: { page?: string; pageSize?: string } }>('/schemas', async (req, reply) => {
    const page = parseInt(req.query.page || '1') || 1;
    const pageSize = parseInt(req.query.pageSize || '10') || 10;
    return reply.send(await repo.findAll(page, pageSize));
  });

  app.get<{ Params: { id: string } }>('/schemas/:id', async (req, reply) => {
    const schema = await repo.findById(req.params.id);
    return schema ? reply.send({ data: schema }) : reply.status(404).send({ error: 'Not found' });
  });

  app.post<{ Body: CreateSchemaRequest }>('/schemas', async (req, reply) => {
    const schema = await repo.create(req.body);
    new SchemaEventHandler().onSchemaCreated(schema);
    return reply.status(201).send({ data: schema });
  });

  app.put<{ Params: { id: string }; Body: UpdateSchemaRequest }>('/schemas/:id', async (req, reply) => {
    const schema = await repo.update(req.params.id, req.body);
    return reply.send({ data: schema });
  });

  app.delete<{ Params: { id: string } }>('/schemas/:id', async (req, reply) => {
    await repo.delete(req.params.id);
    return reply.status(204).send();
  });
}
