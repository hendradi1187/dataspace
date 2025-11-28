import { FastifyInstance } from 'fastify';
import SchemaRepository from '../repositories/schema-repository';
import VocabularyRepository from '../repositories/vocabulary-repository';
import { registerSchemaRoutes } from './schemas';
import { registerVocabularyRoutes } from './vocabularies';

export async function registerRoutes(app: FastifyInstance, schemaRepo: SchemaRepository, vocabRepo: VocabularyRepository) {
  await registerSchemaRoutes(app, schemaRepo);
  await registerVocabularyRoutes(app, vocabRepo);
}
