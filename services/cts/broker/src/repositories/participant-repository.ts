/**
 * Participant Repository - PostgreSQL Database
 * Handles all participant data persistence operations
 */

import { query } from '@dataspace/db';
import { Participant, CreateParticipantRequest, UpdateParticipantRequest } from '../types/participant';

class ParticipantRepository {
  /**
   * Find all participants with pagination
   */
  async findAll(page: number = 1, pageSize: number = 10): Promise<{
    data: Participant[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    try {
      // Get total count
      const countResult = await query('SELECT COUNT(*) FROM participants');
      const total = parseInt(countResult.rows[0].count, 10);

      // Get paginated data
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, did, name, description, endpoint_url as "endpointUrl",
                public_key as "publicKey", status, created_at as "createdAt",
                updated_at as "updatedAt"
         FROM participants
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );

      const data = result.rows.map((row: any) => this.mapRowToParticipant(row));
      const totalPages = Math.ceil(total / pageSize);

      return { data, total, page, pageSize, totalPages };
    } catch (error) {
      console.error('Error fetching all participants:', error);
      throw error;
    }
  }

  /**
   * Find participant by ID
   */
  async findById(id: string): Promise<Participant | null> {
    try {
      const result = await query(
        `SELECT id, did, name, description, endpoint_url as "endpointUrl",
                public_key as "publicKey", status, created_at as "createdAt",
                updated_at as "updatedAt"
         FROM participants
         WHERE id = $1`,
        [id]
      );

      return result.rows.length > 0 ? this.mapRowToParticipant(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching participant by ID:', error);
      throw error;
    }
  }

  /**
   * Find participant by DID
   */
  async findByDid(did: string): Promise<Participant | null> {
    try {
      const result = await query(
        `SELECT id, did, name, description, endpoint_url as "endpointUrl",
                public_key as "publicKey", status, created_at as "createdAt",
                updated_at as "updatedAt"
         FROM participants
         WHERE did = $1`,
        [did]
      );

      return result.rows.length > 0 ? this.mapRowToParticipant(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching participant by DID:', error);
      throw error;
    }
  }

  /**
   * Create new participant
   */
  async create(request: CreateParticipantRequest): Promise<Participant> {
    try {
      // Check for duplicate DID
      const existing = await this.findByDid(request.did);
      if (existing) {
        throw new Error(`Participant with DID ${request.did} already exists`);
      }

      const result = await query(
        `INSERT INTO participants
         (did, name, description, endpoint_url, public_key, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, did, name, description, endpoint_url as "endpointUrl",
                   public_key as "publicKey", status, created_at as "createdAt",
                   updated_at as "updatedAt"`,
        [request.did, request.name, request.description || null, request.endpointUrl || null, request.publicKey || null, 'active']
      );

      return this.mapRowToParticipant(result.rows[0]);
    } catch (error) {
      console.error('Error creating participant:', error);
      throw error;
    }
  }

  /**
   * Update participant
   */
  async update(id: string, request: UpdateParticipantRequest): Promise<Participant> {
    try {
      const participant = await this.findById(id);
      if (!participant) {
        throw new Error(`Participant with ID ${id} not found`);
      }

      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (request.name !== undefined) {
        updateFields.push(`name = $${paramIndex}`);
        values.push(request.name);
        paramIndex++;
      }

      if (request.description !== undefined) {
        updateFields.push(`description = $${paramIndex}`);
        values.push(request.description);
        paramIndex++;
      }

      if (request.endpointUrl !== undefined) {
        updateFields.push(`endpoint_url = $${paramIndex}`);
        values.push(request.endpointUrl);
        paramIndex++;
      }

      if (request.publicKey !== undefined) {
        updateFields.push(`public_key = $${paramIndex}`);
        values.push(request.publicKey);
        paramIndex++;
      }

      if (request.status !== undefined) {
        updateFields.push(`status = $${paramIndex}`);
        values.push(request.status);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return participant;
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE participants
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, did, name, description, endpoint_url as "endpointUrl",
                   public_key as "publicKey", status, created_at as "createdAt",
                   updated_at as "updatedAt"`,
        values
      );

      return this.mapRowToParticipant(result.rows[0]);
    } catch (error) {
      console.error('Error updating participant:', error);
      throw error;
    }
  }

  /**
   * Delete participant
   */
  async delete(id: string): Promise<boolean> {
    try {
      const participant = await this.findById(id);
      if (!participant) {
        throw new Error(`Participant with ID ${id} not found`);
      }

      const result = await query('DELETE FROM participants WHERE id = $1', [id]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error deleting participant:', error);
      throw error;
    }
  }

  /**
   * Search participants by query
   */
  async search(query_text: string, page: number = 1, pageSize: number = 10): Promise<{
    data: Participant[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    try {
      const searchQuery = `%${query_text}%`;

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) FROM participants
         WHERE name ILIKE $1 OR did ILIKE $1 OR description ILIKE $1`,
        [searchQuery]
      );
      const total = parseInt(countResult.rows[0].count, 10);

      // Get paginated search results
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, did, name, description, endpoint_url as "endpointUrl",
                public_key as "publicKey", status, created_at as "createdAt",
                updated_at as "updatedAt"
         FROM participants
         WHERE name ILIKE $1 OR did ILIKE $1 OR description ILIKE $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [searchQuery, pageSize, offset]
      );

      const data = result.rows.map((row: any) => this.mapRowToParticipant(row));
      const totalPages = Math.ceil(total / pageSize);

      return { data, total, page, pageSize, totalPages };
    } catch (error) {
      console.error('Error searching participants:', error);
      throw error;
    }
  }

  /**
   * Map database row to Participant object
   */
  private mapRowToParticipant(row: any): Participant {
    return {
      id: row.id,
      did: row.did,
      name: row.name,
      description: row.description,
      endpointUrl: row.endpointUrl,
      publicKey: row.publicKey,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}

export default ParticipantRepository;
