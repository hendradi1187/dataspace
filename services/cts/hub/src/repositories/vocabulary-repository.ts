/**
 * Vocabulary Repository - PostgreSQL Database
 * Handles all vocabulary data persistence operations
 */

import { query } from '@dataspace/db';
import { Vocabulary, CreateVocabularyRequest, UpdateVocabularyRequest } from '../types';

class VocabularyRepository {
  /**
   * Find all vocabularies with pagination
   */
  async findAll(page: number = 1, pageSize: number = 10) {
    try {
      // Get total count
      const countResult = await query('SELECT COUNT(*) FROM vocabularies');
      const total = parseInt(countResult.rows[0].count, 10);

      // Get paginated data
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, name, namespace, terms, status, description,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM vocabularies
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );

      const data = result.rows.map((row: any) => this.mapRowToVocabulary(row));
      const totalPages = Math.ceil(total / pageSize);

      return { data, total, page, pageSize, totalPages };
    } catch (error) {
      console.error('Error fetching all vocabularies:', error);
      throw error;
    }
  }

  /**
   * Find vocabulary by ID
   */
  async findById(id: string): Promise<Vocabulary | null> {
    try {
      const result = await query(
        `SELECT id, name, namespace, terms, status, description,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM vocabularies
         WHERE id = $1`,
        [id]
      );

      return result.rows.length > 0 ? this.mapRowToVocabulary(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching vocabulary by ID:', error);
      throw error;
    }
  }

  /**
   * Find vocabularies by namespace
   */
  async findByNamespace(namespace: string, page: number = 1, pageSize: number = 10) {
    try {
      // Get total count
      const countResult = await query(
        'SELECT COUNT(*) FROM vocabularies WHERE namespace = $1',
        [namespace]
      );
      const total = parseInt(countResult.rows[0].count, 10);

      // Get paginated data
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, name, namespace, terms, status, description,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM vocabularies
         WHERE namespace = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [namespace, pageSize, offset]
      );

      const data = result.rows.map((row: any) => this.mapRowToVocabulary(row));
      const totalPages = Math.ceil(total / pageSize);

      return { data, total, page, pageSize, totalPages };
    } catch (error) {
      console.error('Error fetching vocabularies by namespace:', error);
      throw error;
    }
  }

  /**
   * Create new vocabulary
   */
  async create(request: CreateVocabularyRequest): Promise<Vocabulary> {
    try {
      const result = await query(
        `INSERT INTO vocabularies
         (name, namespace, terms, description, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, namespace, terms, description, status,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [request.name, request.namespace, JSON.stringify(request.terms || []), request.name, 'draft']
      );

      return this.mapRowToVocabulary(result.rows[0]);
    } catch (error) {
      console.error('Error creating vocabulary:', error);
      throw error;
    }
  }

  /**
   * Update vocabulary
   */
  async update(id: string, request: UpdateVocabularyRequest): Promise<Vocabulary> {
    try {
      const vocab = await this.findById(id);
      if (!vocab) {
        throw new Error(`Vocabulary with ID ${id} not found`);
      }

      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (request.status !== undefined) {
        updateFields.push(`status = $${paramIndex}`);
        values.push(request.status);
        paramIndex++;
      }

      if (request.terms !== undefined) {
        updateFields.push(`terms = $${paramIndex}`);
        values.push(JSON.stringify(request.terms));
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return vocab;
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE vocabularies
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, name, namespace, terms, description, status,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        values
      );

      return this.mapRowToVocabulary(result.rows[0]);
    } catch (error) {
      console.error('Error updating vocabulary:', error);
      throw error;
    }
  }

  /**
   * Delete vocabulary
   */
  async delete(id: string): Promise<void> {
    try {
      const vocab = await this.findById(id);
      if (!vocab) {
        throw new Error(`Vocabulary with ID ${id} not found`);
      }

      await query('DELETE FROM vocabularies WHERE id = $1', [id]);
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      throw error;
    }
  }

  /**
   * Map database row to Vocabulary object
   */
  private mapRowToVocabulary(row: any): Vocabulary {
    return {
      id: row.id,
      name: row.name,
      namespace: row.namespace,
      version: row.version || '1.0.0',
      terms: typeof row.terms === 'string' ? JSON.parse(row.terms) : row.terms,
      status: row.status,
      createdAt: row.createdAt?.toISOString ? row.createdAt.toISOString() : row.createdAt,
      updatedAt: row.updatedAt?.toISOString ? row.updatedAt.toISOString() : row.updatedAt,
    };
  }
}

export default VocabularyRepository;
