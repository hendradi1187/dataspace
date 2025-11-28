/**
 * Credential Repository - PostgreSQL Database
 * Handles all credential data persistence operations
 */

import { query } from '@dataspace/db';
import { Credential, CreateCredentialRequest, UpdateCredentialRequest } from '../types';

class CredentialRepository {
  /**
   * Find all credentials with pagination
   */
  async findAll(page: number = 1, pageSize: number = 10) {
    try {
      // Get total count
      const countResult = await query('SELECT COUNT(*) FROM credentials');
      const total = parseInt(countResult.rows[0].count, 10);

      // Get paginated data
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, client_id as "clientId", client_secret_hash as "clientSecret",
                participant_id as "participantId", scope, status,
                created_at as "createdAt", updated_at as "updatedAt",
                expires_at as "expiresAt"
         FROM credentials
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );

      const data = result.rows.map((row: any) => this.mapRowToCredential(row));
      const totalPages = Math.ceil(total / pageSize);

      return { data, total, page, pageSize, totalPages };
    } catch (error) {
      console.error('Error fetching all credentials:', error);
      throw error;
    }
  }

  /**
   * Find credential by ID
   */
  async findById(id: string): Promise<Credential | null> {
    try {
      const result = await query(
        `SELECT id, client_id as "clientId", client_secret_hash as "clientSecret",
                participant_id as "participantId", scope, status,
                created_at as "createdAt", updated_at as "updatedAt",
                expires_at as "expiresAt"
         FROM credentials
         WHERE id = $1`,
        [id]
      );

      return result.rows.length > 0 ? this.mapRowToCredential(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching credential by ID:', error);
      throw error;
    }
  }

  /**
   * Find credential by client ID
   */
  async findByClientId(clientId: string): Promise<Credential | null> {
    try {
      const result = await query(
        `SELECT id, client_id as "clientId", client_secret_hash as "clientSecret",
                participant_id as "participantId", scope, status,
                created_at as "createdAt", updated_at as "updatedAt",
                expires_at as "expiresAt"
         FROM credentials
         WHERE client_id = $1`,
        [clientId]
      );

      return result.rows.length > 0 ? this.mapRowToCredential(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching credential by client ID:', error);
      throw error;
    }
  }

  /**
   * Find credentials by participant ID
   */
  async findByParticipantId(participantId: string, page: number = 1, pageSize: number = 10) {
    try {
      // Get total count
      const countResult = await query(
        'SELECT COUNT(*) FROM credentials WHERE participant_id = $1',
        [participantId]
      );
      const total = parseInt(countResult.rows[0].count, 10);

      // Get paginated data
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, client_id as "clientId", client_secret_hash as "clientSecret",
                participant_id as "participantId", scope, status,
                created_at as "createdAt", updated_at as "updatedAt",
                expires_at as "expiresAt"
         FROM credentials
         WHERE participant_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [participantId, pageSize, offset]
      );

      const data = result.rows.map((row: any) => this.mapRowToCredential(row));
      const totalPages = Math.ceil(total / pageSize);

      return { data, total, page, pageSize, totalPages };
    } catch (error) {
      console.error('Error fetching credentials by participant:', error);
      throw error;
    }
  }

  /**
   * Create new credential
   */
  async create(request: CreateCredentialRequest): Promise<Credential> {
    try {
      const existing = await this.findByClientId(request.clientId);
      if (existing) {
        throw new Error(`Credential with clientId ${request.clientId} already exists`);
      }

      const clientSecret = `secret-${Date.now()}`;
      const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      const result = await query(
        `INSERT INTO credentials
         (client_id, client_secret_hash, user_id, participant_id, scope, status, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, client_id as "clientId", client_secret_hash as "clientSecret",
                   participant_id as "participantId", scope, status,
                   created_at as "createdAt", updated_at as "updatedAt",
                   expires_at as "expiresAt"`,
        [request.clientId, clientSecret, request.participantId, request.participantId, request.scope || ['read:*'], 'active', expiresAt]
      );

      return this.mapRowToCredential(result.rows[0]);
    } catch (error) {
      console.error('Error creating credential:', error);
      throw error;
    }
  }

  /**
   * Update credential
   */
  async update(id: string, request: UpdateCredentialRequest): Promise<Credential> {
    try {
      const credential = await this.findById(id);
      if (!credential) {
        throw new Error(`Credential with ID ${id} not found`);
      }

      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

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
        return credential;
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE credentials
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, client_id as "clientId", client_secret_hash as "clientSecret",
                   participant_id as "participantId", scope, status,
                   created_at as "createdAt", updated_at as "updatedAt",
                   expires_at as "expiresAt"`,
        values
      );

      return this.mapRowToCredential(result.rows[0]);
    } catch (error) {
      console.error('Error updating credential:', error);
      throw error;
    }
  }

  /**
   * Delete credential
   */
  async delete(id: string): Promise<void> {
    try {
      const credential = await this.findById(id);
      if (!credential) {
        throw new Error(`Credential with ID ${id} not found`);
      }

      await query('DELETE FROM credentials WHERE id = $1', [id]);
    } catch (error) {
      console.error('Error deleting credential:', error);
      throw error;
    }
  }

  /**
   * Revoke all credentials for a participant
   */
  async revokeByParticipantId(participantId: string): Promise<number> {
    try {
      const result = await query(
        'UPDATE credentials SET status = $1 WHERE participant_id = $2',
        ['revoked', participantId]
      );
      return result.rowCount || 0;
    } catch (error) {
      console.error('Error revoking credentials:', error);
      throw error;
    }
  }

  /**
   * Map database row to Credential object
   */
  private mapRowToCredential(row: any): Credential {
    return {
      id: row.id,
      clientId: row.clientId,
      clientSecret: row.clientSecret,
      participantId: row.participantId,
      scope: row.scope || ['read:*'],
      status: row.status,
      createdAt: row.createdAt?.toISOString ? row.createdAt.toISOString() : row.createdAt,
      updatedAt: row.updatedAt?.toISOString ? row.updatedAt.toISOString() : row.updatedAt,
      expiresAt: row.expiresAt?.toISOString ? row.expiresAt.toISOString() : row.expiresAt,
    };
  }
}

export default CredentialRepository;
