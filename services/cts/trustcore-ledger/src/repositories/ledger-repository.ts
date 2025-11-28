/**
 * Ledger Repository - PostgreSQL Database
 * Handles all ledger data persistence operations
 */

import { query } from '@dataspace/db';
import type { Ledger, CreateLedgerInput, UpdateLedgerInput } from '../types/ledger.js';

export class LedgerRepository {
  /**
   * Create new ledger entry
   */
  async create(input: CreateLedgerInput): Promise<Ledger> {
    try {
      const result = await query(
        `INSERT INTO trustcore_ledger
         (name, description, rules, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, description, rules, status,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [input.name, input.description, JSON.stringify(input.rules), input.status || 'draft']
      );

      return this.mapRowToLedger(result.rows[0]);
    } catch (error) {
      console.error('Error creating ledger entry:', error);
      throw error;
    }
  }

  /**
   * Find all ledger entries with pagination
   */
  async findAll(page: number = 1, pageSize: number = 10): Promise<{ data: Ledger[]; total: number }> {
    try {
      // Get total count
      const countResult = await query('SELECT COUNT(*) FROM trustcore_ledger');
      const total = parseInt(countResult.rows[0].count, 10);

      // Get paginated data
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, name, description, rules, status,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM trustcore_ledger
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );

      const data = result.rows.map((row: any) => this.mapRowToLedger(row));

      return { data, total };
    } catch (error) {
      console.error('Error fetching all ledger entries:', error);
      throw error;
    }
  }

  /**
   * Find ledger entry by ID
   */
  async findById(id: string): Promise<Ledger | null> {
    try {
      const result = await query(
        `SELECT id, name, description, rules, status,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM trustcore_ledger
         WHERE id = $1`,
        [id]
      );

      return result.rows.length > 0 ? this.mapRowToLedger(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching ledger entry by ID:', error);
      throw error;
    }
  }

  /**
   * Update ledger entry
   */
  async update(id: string, input: UpdateLedgerInput): Promise<Ledger | null> {
    try {
      const ledger = await this.findById(id);
      if (!ledger) return null;

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

      if (updateFields.length === 0) {
        return ledger;
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE trustcore_ledger
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, name, description, rules, status,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        values
      );

      return this.mapRowToLedger(result.rows[0]);
    } catch (error) {
      console.error('Error updating ledger entry:', error);
      throw error;
    }
  }

  /**
   * Delete ledger entry
   */
  async delete(id: string): Promise<boolean> {
    try {
      const ledger = await this.findById(id);
      if (!ledger) return false;

      const result = await query('DELETE FROM trustcore_ledger WHERE id = $1', [id]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error deleting ledger entry:', error);
      throw error;
    }
  }

  /**
   * Map database row to Ledger object
   */
  private mapRowToLedger(row: any): Ledger {
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
