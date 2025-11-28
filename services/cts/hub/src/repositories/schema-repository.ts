/**
 * Schema Repository - PostgreSQL Database
 * Handles all schema data persistence operations
 */

import { query } from '@dataspace/db';
import { Schema, CreateSchemaRequest, UpdateSchemaRequest } from '../types';

class SchemaRepository {
  /**
   * Find all schemas with pagination
   */
  async findAll(page: number = 1, pageSize: number = 10) {
    try {
      // Get total count
      const countResult = await query('SELECT COUNT(*) FROM schemas');
      const total = parseInt(countResult.rows[0].count, 10);

      // Get paginated data
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, name, version, type as format, definition as content, description,
                status, created_at as "createdAt", updated_at as "updatedAt"
         FROM schemas
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );

      const data = result.rows.map((row: any) => this.mapRowToSchema(row));
      const totalPages = Math.ceil(total / pageSize);

      return { data, total, page, pageSize, totalPages };
    } catch (error) {
      console.error('Error fetching all schemas:', error);
      throw error;
    }
  }

  /**
   * Find schema by ID
   */
  async findById(id: string): Promise<Schema | null> {
    try {
      const result = await query(
        `SELECT id, name, version, type as format, definition as content, description,
                status, created_at as "createdAt", updated_at as "updatedAt"
         FROM schemas
         WHERE id = $1`,
        [id]
      );

      return result.rows.length > 0 ? this.mapRowToSchema(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching schema by ID:', error);
      throw error;
    }
  }

  /**
   * Find schemas by type/format
   */
  async findByType(type: string, page: number = 1, pageSize: number = 10) {
    try {
      // Get total count
      const countResult = await query(
        'SELECT COUNT(*) FROM schemas WHERE type = $1',
        [type]
      );
      const total = parseInt(countResult.rows[0].count, 10);

      // Get paginated data
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, name, version, type as format, definition as content, description,
                status, created_at as "createdAt", updated_at as "updatedAt"
         FROM schemas
         WHERE type = $1
         ORDER BY version DESC
         LIMIT $2 OFFSET $3`,
        [type, pageSize, offset]
      );

      const data = result.rows.map((row: any) => this.mapRowToSchema(row));
      const totalPages = Math.ceil(total / pageSize);

      return { data, total, page, pageSize, totalPages };
    } catch (error) {
      console.error('Error fetching schemas by type:', error);
      throw error;
    }
  }

  /**
   * Create new schema
   */
  async create(request: CreateSchemaRequest): Promise<Schema> {
    try {
      const result = await query(
        `INSERT INTO schemas
         (name, version, type, definition, description, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, version, type as format, definition as content, description,
                   status, created_at as "createdAt", updated_at as "updatedAt"`,
        [request.name, request.version, request.format, JSON.stringify(request.content), '', 'draft']
      );

      return this.mapRowToSchema(result.rows[0]);
    } catch (error) {
      console.error('Error creating schema:', error);
      throw error;
    }
  }

  /**
   * Update schema
   */
  async update(id: string, request: UpdateSchemaRequest): Promise<Schema> {
    try {
      const schema = await this.findById(id);
      if (!schema) {
        throw new Error(`Schema with ID ${id} not found`);
      }

      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (request.status !== undefined) {
        updateFields.push(`status = $${paramIndex}`);
        values.push(request.status);
        paramIndex++;
      }

      if (request.content !== undefined) {
        updateFields.push(`definition = $${paramIndex}`);
        values.push(JSON.stringify(request.content));
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return schema;
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE schemas
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, name, version, type as format, definition as content, description,
                   status, created_at as "createdAt", updated_at as "updatedAt"`,
        values
      );

      return this.mapRowToSchema(result.rows[0]);
    } catch (error) {
      console.error('Error updating schema:', error);
      throw error;
    }
  }

  /**
   * Delete schema
   */
  async delete(id: string): Promise<void> {
    try {
      const schema = await this.findById(id);
      if (!schema) {
        throw new Error(`Schema with ID ${id} not found`);
      }

      await query('DELETE FROM schemas WHERE id = $1', [id]);
    } catch (error) {
      console.error('Error deleting schema:', error);
      throw error;
    }
  }

  /**
   * Map database row to Schema object
   */
  private mapRowToSchema(row: any): Schema {
    return {
      id: row.id,
      name: row.name,
      namespace: row.name, // Use name as namespace for compatibility
      version: row.version,
      format: row.format,
      content: typeof row.content === 'string' ? JSON.parse(row.content) : row.content,
      status: row.status,
      createdAt: row.createdAt?.toISOString ? row.createdAt.toISOString() : row.createdAt,
      updatedAt: row.updatedAt?.toISOString ? row.updatedAt.toISOString() : row.updatedAt,
    };
  }
}

export default SchemaRepository;
