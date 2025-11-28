import { FastifyInstance } from 'fastify';
import VocabularyRepository from '../repositories/vocabulary-repository';
import { VocabularyEventHandler } from '../events/vocabulary.event';
import { CreateVocabularyRequest, UpdateVocabularyRequest } from '../types';

export async function registerVocabularyRoutes(app: FastifyInstance, repo: VocabularyRepository) {
  app.get<{ Querystring: { page?: string; pageSize?: string } }>('/vocabularies', async (req, reply) => {
    const page = parseInt(req.query.page || '1') || 1;
    const pageSize = parseInt(req.query.pageSize || '10') || 10;
    return reply.send(await repo.findAll(page, pageSize));
  });

  app.get<{ Params: { id: string } }>('/vocabularies/:id', async (req, reply) => {
    const vocab = await repo.findById(req.params.id);
    return vocab ? reply.send({ data: vocab }) : reply.status(404).send({ error: 'Not found' });
  });

  app.post<{ Body: CreateVocabularyRequest }>('/vocabularies', async (req, reply) => {
    const vocab = await repo.create(req.body);
    new VocabularyEventHandler().onVocabularyCreated(vocab);
    return reply.status(201).send({ data: vocab });
  });

  app.put<{ Params: { id: string }; Body: UpdateVocabularyRequest }>('/vocabularies/:id', async (req, reply) => {
    const vocab = await repo.update(req.params.id, req.body);
    return reply.send({ data: vocab });
  });

  app.delete<{ Params: { id: string } }>('/vocabularies/:id', async (req, reply) => {
    await repo.delete(req.params.id);
    return reply.status(204).send();
  });
}
