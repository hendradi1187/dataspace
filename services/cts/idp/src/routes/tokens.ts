/**
 * Token Routes - Token Issuance & Refresh Endpoints
 */

import { FastifyInstance } from 'fastify';
import CredentialRepository from '../repositories/credential-repository';
import { validateIssueToken } from '../validators/credential.validator';
import { TokenEventHandler } from '../events/token.event';
import { Token, TokenResponse } from '../types';

export async function registerTokenRoutes(
  app: FastifyInstance,
  credentialRepository: CredentialRepository
) {
  /**
   * POST /token
   * Issue a new access token
   * Implements OAuth2 client_credentials grant type
   */
  app.post<{ Body: any }>('/token', async (request, reply) => {
    try {
      const validated = await validateIssueToken(request.body);

      // Find credential by clientId
      const credential = await credentialRepository.findByClientId(validated.clientId);
      if (!credential) {
        return reply.status(401).send({ error: 'Invalid client credentials' });
      }

      // Verify client secret (in production, use bcrypt/argon2)
      if (credential.clientSecret !== validated.clientSecret) {
        return reply.status(401).send({ error: 'Invalid client credentials' });
      }

      // Check credential status
      if (credential.status !== 'active') {
        return reply.status(403).send({ error: 'Credential is not active' });
      }

      // Generate token (mock implementation)
      const now = new Date();
      const expiresIn = 3600; // 1 hour
      const token: Token = {
        id: `token_${Date.now()}`,
        accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Date.now()}.${Math.random()}`,
        tokenType: 'Bearer',
        credentialId: credential.id,
        issuedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + expiresIn * 1000).toISOString(),
        scope: validated.scope || credential.scope,
      };

      // Generate refresh token if scope allows
      if (validated.scope?.includes('refresh') || credential.scope.includes('refresh')) {
        token.refreshToken = `refresh_${Date.now()}.${Math.random()}`;
      }

      // Emit event
      const eventHandler = new TokenEventHandler();
      await eventHandler.onTokenIssued(token);

      const response: TokenResponse = {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        tokenType: token.tokenType,
        expiresIn,
        scope: token.scope,
      };

      return reply.send(response);
    } catch (error: any) {
      app.log.error(error);

      if (error.message?.includes('Invalid')) {
        return reply.status(400).send({ error: error.message });
      }

      return reply.status(500).send({ error: 'Failed to issue token' });
    }
  });

  /**
   * POST /token/refresh
   * Refresh an access token
   */
  app.post<{ Body: { refreshToken: string } }>('/token/refresh', async (request, reply) => {
    try {
      if (!request.body.refreshToken) {
        return reply.status(400).send({ error: 'refreshToken is required' });
      }

      // In production, validate and decode the refresh token from database
      // For now, just mock the behavior
      const now = new Date();
      const expiresIn = 3600;
      const newToken: Token = {
        id: `token_${Date.now()}`,
        accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Date.now()}.${Math.random()}`,
        refreshToken: `refresh_${Date.now()}.${Math.random()}`,
        tokenType: 'Bearer',
        credentialId: 'credential-id',
        issuedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + expiresIn * 1000).toISOString(),
        scope: ['read:*'],
      };

      const eventHandler = new TokenEventHandler();
      await eventHandler.onTokenRefreshed(
        { ...newToken, accessToken: request.body.refreshToken },
        newToken
      );

      const response: TokenResponse = {
        accessToken: newToken.accessToken,
        refreshToken: newToken.refreshToken,
        tokenType: newToken.tokenType,
        expiresIn,
        scope: newToken.scope,
      };

      return reply.send(response);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Failed to refresh token' });
    }
  });

  /**
   * POST /token/revoke
   * Revoke an access token
   */
  app.post<{ Body: { token: string } }>('/token/revoke', async (request, reply) => {
    try {
      if (!request.body.token) {
        return reply.status(400).send({ error: 'token is required' });
      }

      // In production, find and invalidate the token
      const eventHandler = new TokenEventHandler();
      await eventHandler.onTokenRevoked({
        id: 'token-id',
        accessToken: request.body.token,
        tokenType: 'Bearer',
        credentialId: 'credential-id',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
        scope: [],
      });

      return reply.status(204).send();
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Failed to revoke token' });
    }
  });
}
