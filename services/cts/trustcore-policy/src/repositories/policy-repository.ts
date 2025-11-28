/**
 * Policy Repository - PostgreSQL Database
 * Handles all policy data persistence operations
 */

import { query } from '@dataspace/db';
import type { Policy, CreatePolicyInput, UpdatePolicyInput } from '../types/policy.js';

export class PolicyRepository {
  /**
   * Create new policy
   */
  async create(input: CreatePolicyInput): Promise<Policy> {
    try {
      const result = await query(
        `INSERT INTO trustcore_policies
         (name, description, rules, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, description, rules, status,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [input.name, input.description, JSON.stringify(input.rules), input.status || 'draft']
      );

      return this.mapRowToPolicy(result.rows[0]);
    } catch (error) {
      console.error('Error creating policy:', error);
      throw error;
    }
  }

  /**
   * Find all policies with pagination
   */
  async findAll(page: number = 1, pageSize: number = 10): Promise<{ data: Policy[]; total: number }> {
    try {
      // Get total count
      const countResult = await query('SELECT COUNT(*) FROM trustcore_policies');
      const total = parseInt(countResult.rows[0].count, 10);

      // Get paginated data
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, name, description, rules, status,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM trustcore_policies
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );

      const data = result.rows.map((row: any) => this.mapRowToPolicy(row));

      return { data, total };
    } catch (error) {
      console.error('Error fetching all policies:', error);
      throw error;
    }
  }

  /**
   * Find policy by ID
   */
  async findById(id: string): Promise<Policy | null> {
    try {
      const result = await query(
        `SELECT id, name, description, rules, status,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM trustcore_policies
         WHERE id = $1`,
        [id]
      );

      return result.rows.length > 0 ? this.mapRowToPolicy(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching policy by ID:', error);
      throw error;
    }
  }

  /**
   * Update policy
   */
  async update(id: string, input: UpdatePolicyInput): Promise<Policy | null> {
    try {
      const policy = await this.findById(id);
      if (!policy) return null;

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
        return policy;
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE trustcore_policies
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, name, description, rules, status,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        values
      );

      return this.mapRowToPolicy(result.rows[0]);
    } catch (error) {
      console.error('Error updating policy:', error);
      throw error;
    }
  }

  /**
   * Delete policy
   */
  async delete(id: string): Promise<boolean> {
    try {
      const policy = await this.findById(id);
      if (!policy) return false;

      const result = await query('DELETE FROM trustcore_policies WHERE id = $1', [id]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error deleting policy:', error);
      throw error;
    }
  }

  /**
   * Map database row to Policy object
   */
  private mapRowToPolicy(row: any): Policy {
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
