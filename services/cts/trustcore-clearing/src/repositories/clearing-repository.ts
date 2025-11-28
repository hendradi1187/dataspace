// Repository - PostgreSQL Database
import { query } from '@dataspace/db';
import type { Clearing, CreateClearingInput, UpdateClearingInput } from '../types/clearing.js';

export class ClearingRepository {
  async create(input: CreateClearingInput): Promise<Clearing> {
    try {
      const result = await query(
        `INSERT INTO trustcore_clearing
         (name, description, rules, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, description, rules, status,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [input.name, input.description, JSON.stringify(input.rules), input.status || 'draft']
      );
      return this.mapRowToClearing(result.rows[0]);
    } catch (error) {
      console.error('Error creating clearing:', error);
      throw error;
    }
  }

  async findAll(page: number = 1, pageSize: number = 10): Promise<{ data: Clearing[]; total: number }> {
    try {
      const countResult = await query('SELECT COUNT(*) FROM trustcore_clearing');
      const total = parseInt(countResult.rows[0].count, 10);
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, name, description, rules, status,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM trustcore_clearing
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );
      const data = result.rows.map((row: any) => this.mapRowToClearing(row));
      return { data, total };
    } catch (error) {
      console.error('Error fetching clearing policies:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Clearing | null> {
    try {
      const result = await query(
        `SELECT id, name, description, rules, status,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM trustcore_clearing
         WHERE id = $1`,
        [id]
      );
      return result.rows.length > 0 ? this.mapRowToClearing(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching clearing:', error);
      throw error;
    }
  }

  async update(id: string, input: UpdateClearingInput): Promise<Clearing | null> {
    try {
      const clearing = await this.findById(id);
      if (!clearing) return null;
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      if (input.name !== undefined) {
        updateFields.push(`name = $${paramIndex}`);
        values.push(input.name);
        paramIndex++;
      }
      if (input.description !== undefined) {
        updateFields.push(`description = $${paramIndex}`);
        values.push(input.description);
        paramIndex++;
      }
      if (input.rules !== undefined) {
        updateFields.push(`rules = $${paramIndex}`);
        values.push(JSON.stringify(input.rules));
        paramIndex++;
      }
      if (input.status !== undefined) {
        updateFields.push(`status = $${paramIndex}`);
        values.push(input.status);
        paramIndex++;
      }
      if (updateFields.length === 0) return clearing;
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);
      const result = await query(
        `UPDATE trustcore_clearing
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, name, description, rules, status,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        values
      );
      return this.mapRowToClearing(result.rows[0]);
    } catch (error) {
      console.error('Error updating clearing:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const clearing = await this.findById(id);
      if (!clearing) return false;
      const result = await query('DELETE FROM trustcore_clearing WHERE id = $1', [id]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error deleting clearing:', error);
      throw error;
    }
  }

  private mapRowToClearing(row: any): Clearing {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      rules: typeof row.rules === 'string' ? JSON.parse(row.rules) : row.rules,
      status: row.status,
      createdAt: row.createdAt?.toISOString ? row.createdAt.toISOString() : row.createdAt,
      updatedAt: row.updatedAt?.toISOString ? row.updatedAt.toISOString() : row.updatedAt,
    };
  }
}
