/**
 * API Key Repository - PostgreSQL Database
 * Handles all API key data persistence operations
 */

import { query } from '@dataspace/db';
import { ApiKey, CreateApiKeyRequest, UpdateApiKeyRequest } from '../types';
import { randomUUID } from 'crypto';

class ApiKeyRepository {
  /**
   * Find all API keys with pagination
   */
  async findAll(page: number = 1, pageSize: number = 10) {
    try {
      // Get total count
      const countResult = await query('SELECT COUNT(*) FROM api_keys');
      const total = parseInt(countResult.rows[0].count, 10);

      // Get paginated data
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, key, name, participant_id as "participantId",
                scope, status, created_at as "createdAt",
                updated_at as "updatedAt", last_used_at as "lastUsedAt",
                expires_at as "expiresAt"
         FROM api_keys
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );

      const data = result.rows.map((row: any) => this.mapRowToApiKey(row));
      const totalPages = Math.ceil(total / pageSize);

      return { data, total, page, pageSize, totalPages };
    } catch (error) {
      console.error('Error fetching all API keys:', error);
      throw error;
    }
  }

  /**
   * Find API key by ID
   */
  async findById(id: string): Promise<ApiKey | null> {
    try {
      const result = await query(
        `SELECT id, key, name, participant_id as "participantId",
                scope, status, created_at as "createdAt",
                updated_at as "updatedAt", last_used_at as "lastUsedAt",
                expires_at as "expiresAt"
         FROM api_keys
         WHERE id = $1`,
        [id]
      );

      return result.rows.length > 0 ? this.mapRowToApiKey(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching API key by ID:', error);
      throw error;
    }
  }

  /**
   * Find API key by key value
   */
  async findByKey(key: string): Promise<ApiKey | null> {
    try {
      const result = await query(
        `SELECT id, key, name, participant_id as "participantId",
                scope, status, created_at as "createdAt",
                updated_at as "updatedAt", last_used_at as "lastUsedAt",
                expires_at as "expiresAt"
         FROM api_keys
         WHERE key = $1`,
        [key]
      );

      return result.rows.length > 0 ? this.mapRowToApiKey(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching API key by key:', error);
      throw error;
    }
  }

  /**
   * Find API keys by participant ID
   */
  async findByParticipantId(participantId: string, page: number = 1, pageSize: number = 10) {
    try {
      // Get total count
      const countResult = await query(
        'SELECT COUNT(*) FROM api_keys WHERE participant_id = $1',
        [participantId]
      );
      const total = parseInt(countResult.rows[0].count, 10);

      // Get paginated data
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, key, name, participant_id as "participantId",
                scope, status, created_at as "createdAt",
                updated_at as "updatedAt", last_used_at as "lastUsedAt",
                expires_at as "expiresAt"
         FROM api_keys
         WHERE participant_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [participantId, pageSize, offset]
      );

      const data = result.rows.map((row: any) => this.mapRowToApiKey(row));
      const totalPages = Math.ceil(total / pageSize);

      return { data, total, page, pageSize, totalPages };
    } catch (error) {
      console.error('Error fetching API keys by participant:', error);
      throw error;
    }
  }

  /**
   * Create new API key
   */
  async create(request: CreateApiKeyRequest): Promise<ApiKey> {
    try {
      const apiKeyValue = `key_${randomUUID().replace(/-/g, '')}`;
      const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      const result = await query(
        `INSERT INTO api_keys
         (key, name, participant_id, scope, status, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, key, name, participant_id as "participantId",
                   scope, status, created_at as "createdAt",
                   updated_at as "updatedAt", last_used_at as "lastUsedAt",
                   expires_at as "expiresAt"`,
        [apiKeyValue, request.name, request.participantId, request.scope || ['read:*'], 'active', expiresAt]
      );

      return this.mapRowToApiKey(result.rows[0]);
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  }

  /**
   * Update API key
   */
  async update(id: string, request: UpdateApiKeyRequest): Promise<ApiKey> {
    try {
      const apiKey = await this.findById(id);
      if (!apiKey) {
        throw new Error(`API Key with ID ${id} not found`);
      }

      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (request.name !== undefined) {
        updateFields.push(`name = $${paramIndex}`);
        values.push(request.name);
        paramIndex++;
      }

      if (request.scope !== undefined) {
        updateFields.push(`scope = $${paramIndex}`);
        values.push(request.scope);
        paramIndex++;
      }

      if (request.status !== undefined) {
        updateFields.push(`status = $${paramIndex}`);
        values.push(request.status);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return apiKey;
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE api_keys
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, key, name, participant_id as "participantId",
                   scope, status, created_at as "createdAt",
                   updated_at as "updatedAt", last_used_at as "lastUsedAt",
                   expires_at as "expiresAt"`,
        values
      );

      return this.mapRowToApiKey(result.rows[0]);
    } catch (error) {
      console.error('Error updating API key:', error);
      throw error;
    }
  }

  /**
   * Delete API key
   */
  async delete(id: string): Promise<void> {
    try {
      const apiKey = await this.findById(id);
      if (!apiKey) {
        throw new Error(`API Key with ID ${id} not found`);
      }

      await query('DELETE FROM api_keys WHERE id = $1', [id]);
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  }

  /**
   * Update last used timestamp
   */
  async updateLastUsed(id: string): Promise<void> {
    try {
      await query(
        'UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
    } catch (error) {
      console.error('Error updating last used:', error);
      throw error;
    }
  }

  /**
   * Revoke all API keys for a participant
   */
  async revokeByParticipantId(participantId: string): Promise<number> {
    try {
      const result = await query(
        'UPDATE api_keys SET status = $1 WHERE participant_id = $2',
        ['revoked', participantId]
      );
      return result.rowCount || 0;
    } catch (error) {
      console.error('Error revoking API keys:', error);
      throw error;
    }
  }

  /**
   * Map database row to ApiKey object
   */
  private mapRowToApiKey(row: any): ApiKey {
    return {
      id: row.id,
      key: row.key,
      name: row.name,
      participantId: row.participantId,
      scope: row.scope || ['read:*'],
      status: row.status,
      createdAt: row.createdAt?.toISOString ? row.createdAt.toISOString() : row.createdAt,
      updatedAt: row.updatedAt?.toISOString ? row.updatedAt.toISOString() : row.updatedAt,
      lastUsedAt: row.lastUsedAt?.toISOString ? row.lastUsedAt.toISOString() : row.lastUsedAt,
      expiresAt: row.expiresAt?.toISOString ? row.expiresAt.toISOString() : row.expiresAt,
    };
  }
}

export default ApiKeyRepository;
