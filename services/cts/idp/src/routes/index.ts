/**
 * IDP Routes - Export all route registrations
 */

import { FastifyInstance } from 'fastify';
import CredentialRepository from '../repositories/credential-repository';
import ApiKeyRepository from '../repositories/apikey-repository';
import { registerCredentialRoutes } from './credentials';
import { registerApiKeyRoutes } from './apikeys';
import { registerTokenRoutes } from './tokens';
import { registerUserRoutes } from './users';

export async function registerRoutes(
  app: FastifyInstance,
  credentialRepo: CredentialRepository,
  apiKeyRepo: ApiKeyRepository
) {
  await registerCredentialRoutes(app, credentialRepo);
  await registerApiKeyRoutes(app, apiKeyRepo);
  await registerTokenRoutes(app, credentialRepo);
  await registerUserRoutes(app);
}
