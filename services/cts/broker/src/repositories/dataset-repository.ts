/**
 * Dataset Repository - PostgreSQL Database
 * Handles all dataset data persistence operations
 */

import { query } from '@dataspace/db';
import { Dataset, CreateDatasetRequest, UpdateDatasetRequest } from '../types/dataset';

class DatasetRepository {
  /**
   * Find all datasets with pagination
   */
  async findAll(page: number = 1, pageSize: number = 10): Promise<{
    data: Dataset[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    try {
      // Get total count
      const countResult = await query('SELECT COUNT(*) FROM datasets');
      const total = parseInt(countResult.rows[0].count, 10);

      // Get paginated data
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, participant_id as "participantId", name, description,
                schema_ref as "schemaRef", status,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM datasets
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );

      const data = result.rows.map((row: any) => this.mapRowToDataset(row));
      const totalPages = Math.ceil(total / pageSize);

      return { data, total, page, pageSize, totalPages };
    } catch (error) {
      console.error('Error fetching all datasets:', error);
      throw error;
    }
  }

  /**
   * Find dataset by ID
   */
  async findById(id: string): Promise<Dataset | null> {
    try {
      const result = await query(
        `SELECT id, participant_id as "participantId", name, description,
                schema_ref as "schemaRef", status,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM datasets
         WHERE id = $1`,
        [id]
      );

      return result.rows.length > 0 ? this.mapRowToDataset(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching dataset by ID:', error);
      throw error;
    }
  }

  /**
   * Find datasets by participant ID
   */
  async findByParticipantId(
    participantId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    data: Dataset[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    try {
      // Get total count
      const countResult = await query(
        'SELECT COUNT(*) FROM datasets WHERE participant_id = $1',
        [participantId]
      );
      const total = parseInt(countResult.rows[0].count, 10);

      // Get paginated data
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, participant_id as "participantId", name, description,
                schema_ref as "schemaRef", status,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM datasets
         WHERE participant_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [participantId, pageSize, offset]
      );

      const data = result.rows.map((row: any) => this.mapRowToDataset(row));
      const totalPages = Math.ceil(total / pageSize);

      return { data, total, page, pageSize, totalPages };
    } catch (error) {
      console.error('Error fetching datasets by participant:', error);
      throw error;
    }
  }

  /**
   * Create new dataset
   */
  async create(request: CreateDatasetRequest): Promise<Dataset> {
    try {
      const result = await query(
        `INSERT INTO datasets
         (participant_id, name, description, schema_ref, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, participant_id as "participantId", name, description,
                   schema_ref as "schemaRef", status,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [request.participantId, request.name, request.description || null, request.schemaRef || null, 'draft']
      );

      return this.mapRowToDataset(result.rows[0]);
    } catch (error) {
      console.error('Error creating dataset:', error);
      throw error;
    }
  }

  /**
   * Update dataset
   */
  async update(id: string, request: UpdateDatasetRequest): Promise<Dataset> {
    try {
      const dataset = await this.findById(id);
      if (!dataset) {
        throw new Error(`Dataset with ID ${id} not found`);
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

      if (request.schemaRef !== undefined) {
        updateFields.push(`schema_ref = $${paramIndex}`);
        values.push(request.schemaRef);
        paramIndex++;
      }

      if (request.status !== undefined) {
        updateFields.push(`status = $${paramIndex}`);
        values.push(request.status);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return dataset;
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE datasets
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, participant_id as "participantId", name, description,
                   schema_ref as "schemaRef", status,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        values
      );

      return this.mapRowToDataset(result.rows[0]);
    } catch (error) {
      console.error('Error updating dataset:', error);
      throw error;
    }
  }

  /**
   * Delete dataset
   */
  async delete(id: string): Promise<boolean> {
    try {
      const dataset = await this.findById(id);
      if (!dataset) {
        throw new Error(`Dataset with ID ${id} not found`);
      }

      const result = await query('DELETE FROM datasets WHERE id = $1', [id]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error deleting dataset:', error);
      throw error;
    }
  }

  /**
   * Search datasets by name or description
   */
  async search(
    query_text: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    data: Dataset[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    try {
      const searchQuery = `%${query_text}%`;

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) FROM datasets
         WHERE name ILIKE $1 OR description ILIKE $1`,
        [searchQuery]
      );
      const total = parseInt(countResult.rows[0].count, 10);

      // Get paginated search results
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, participant_id as "participantId", name, description,
                schema_ref as "schemaRef", status,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM datasets
         WHERE name ILIKE $1 OR description ILIKE $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [searchQuery, pageSize, offset]
      );

      const data = result.rows.map((row: any) => this.mapRowToDataset(row));
      const totalPages = Math.ceil(total / pageSize);

      return { data, total, page, pageSize, totalPages };
    } catch (error) {
      console.error('Error searching datasets:', error);
      throw error;
    }
  }

  /**
   * Map database row to Dataset object
   */
  private mapRowToDataset(row: any): Dataset {
    return {
      id: row.id,
      participantId: row.participantId,
      name: row.name,
      description: row.description,
      schemaRef: row.schemaRef,
      status: row.status,
      createdAt: row.createdAt?.toISOString ? row.createdAt.toISOString() : row.createdAt,
      updatedAt: row.updatedAt?.toISOString ? row.updatedAt.toISOString() : row.updatedAt,
    };
  }
}

export default DatasetRepository;
