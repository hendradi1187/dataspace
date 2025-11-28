import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import CredentialRepository from '../repositories/credential-repository.js';

/**
 * Users Routes
 * Handles user profile and user management endpoints
 */

export async function registerUserRoutes(app: FastifyInstance) {
  const credentialRepository = new CredentialRepository();

  /**
   * GET /users
   * List all users/credentials with proper response format
   */
  app.get('/users', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { page = 1, pageSize = 10 } = request.query as any;
      const pageNum = parseInt(page) || 1;
      const pageSizeNum = parseInt(pageSize) || 10;

      const result = await credentialRepository.findAll(pageNum, pageSizeNum);

      const users = result.data.map(c => ({
        id: c.id,
        name: c.clientId,
        email: `${c.clientId}@dataspace.local`,
        role: c.clientId === 'admin-client' ? 'admin' : 'participant',
        status: c.status,
        department: c.participantId || 'N/A',
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        lastLogin: null,
      }));

      return reply.send({
        data: users,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      });
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({
        error: 'server_error',
        message: 'Internal server error'
      });
    }
  });

  /**
   * POST /users
   * Create new user/credential
   */
  app.post('/users', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { clientId, participantId, scope, email, name, role } = request.body as any;

      // Validate input
      if (!clientId) {
        return reply.status(400).send({
          error: 'invalid_request',
          message: 'Client ID is required'
        });
      }

      // Create new credential
      const newCredential = await credentialRepository.create({
        clientId,
        participantId,
        scope: scope || ['read:data'],
      });

      return reply.status(201).send({
        id: newCredential.id,
        name: newCredential.clientId,
        email: `${newCredential.clientId}@dataspace.local`,
        role: newCredential.clientId === 'admin-client' ? 'admin' : 'participant',
        status: newCredential.status,
        department: newCredential.participantId || 'N/A',
        createdAt: newCredential.createdAt,
        updatedAt: newCredential.updatedAt,
        lastLogin: null,
      });
    } catch (error: any) {
      app.log.error(error);
      
      if (error.message.includes('already exists')) {
        return reply.status(409).send({
          error: 'conflict',
          message: error.message
        });
      }

      return reply.status(500).send({
        error: 'server_error',
        message: 'Internal server error'
      });
    }
  });

  /**
   * GET /users/:id
   * Get user by ID
   */
  app.get('/users/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;

      const credential = await credentialRepository.findById(id);
      if (!credential) {
        return reply.status(404).send({
          error: 'not_found',
          message: 'User not found'
        });
      }

      return reply.send({
        id: credential.id,
        name: credential.clientId,
        email: `${credential.clientId}@dataspace.local`,
        role: credential.clientId === 'admin-client' ? 'admin' : 'participant',
        status: credential.status,
        department: credential.participantId || 'N/A',
        createdAt: credential.createdAt,
        updatedAt: credential.updatedAt,
        lastLogin: null,
      });
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({
        error: 'server_error',
        message: 'Internal server error'
      });
    }
  });

  /**
   * PUT /users/:id
   * Update user
   */
  app.put('/users/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const { scope, status, role, department } = request.body as any;

      const credential = await credentialRepository.findById(id);
      if (!credential) {
        return reply.status(404).send({
          error: 'not_found',
          message: 'User not found'
        });
      }

      const updated = await credentialRepository.update(id, {
        ...(scope && { scope }),
        ...(status && { status }),
      });

      return reply.send({
        id: updated.id,
        name: updated.clientId,
        email: `${updated.clientId}@dataspace.local`,
        role: updated.clientId === 'admin-client' ? 'admin' : 'participant',
        status: updated.status,
        department: updated.participantId || 'N/A',
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        lastLogin: null,
      });
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({
        error: 'server_error',
        message: 'Internal server error'
      });
    }
  });

  /**
   * DELETE /users/:id
   * Delete user
   */
  app.delete('/users/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;

      const credential = await credentialRepository.findById(id);
      if (!credential) {
        return reply.status(404).send({
          error: 'not_found',
          message: 'User not found'
        });
      }

      await credentialRepository.delete(id);

      return reply.send({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({
        error: 'server_error',
        message: 'Internal server error'
      });
    }
  });

  /**
   * GET /roles
   * Get available roles
   */
  app.get('/roles', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const roles = [
        {
          id: '1',
          name: 'admin',
          description: 'Administrator - Full system access',
          permissions: [
            'read:all',
            'write:all',
            'admin:system',
            'manage:users',
            'manage:roles',
            'view:audit',
            'view:health',
          ]
        },
        {
          id: '2',
          name: 'participant',
          description: 'Participant - Read and write own data',
          permissions: [
            'read:data',
            'write:data',
            'read:datasets',
            'read:contracts',
            'view:dashboard',
          ]
        },
        {
          id: '3',
          name: 'viewer',
          description: 'Viewer - Read-only access',
          permissions: [
            'read:data',
            'read:datasets',
            'view:dashboard',
          ]
        }
      ];

      return reply.send(roles);
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({
        error: 'server_error',
        message: 'Internal server error'
      });
    }
  });
}
