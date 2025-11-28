// Repository - PostgreSQL Database
import { query } from '@dataspace/db';
import type { Compliance, CreateComplianceInput, UpdateComplianceInput } from '../types/compliance.js';

export class ComplianceRepository {
  async create(input: CreateComplianceInput): Promise<Compliance> {
    try {
      const result = await query(
        `INSERT INTO trustcore_compliance
         (name, description, rules, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, description, rules, status,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [input.name, input.description, JSON.stringify(input.rules), input.status || 'draft']
      );
      return this.mapRowToCompliance(result.rows[0]);
    } catch (error) {
      console.error('Error creating compliance:', error);
      throw error;
    }
  }

  async findAll(page: number = 1, pageSize: number = 10): Promise<{ data: Compliance[]; total: number }> {
    try {
      const countResult = await query('SELECT COUNT(*) FROM trustcore_compliance');
      const total = parseInt(countResult.rows[0].count, 10);
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, name, description, rules, status,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM trustcore_compliance
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );
      const data = result.rows.map((row: any) => this.mapRowToCompliance(row));
      return { data, total };
    } catch (error) {
      console.error('Error fetching compliance policies:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Compliance | null> {
    try {
      const result = await query(
        `SELECT id, name, description, rules, status,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM trustcore_compliance
         WHERE id = $1`,
        [id]
      );
      return result.rows.length > 0 ? this.mapRowToCompliance(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching compliance:', error);
      throw error;
    }
  }

  async update(id: string, input: UpdateComplianceInput): Promise<Compliance | null> {
    try {
      const compliance = await this.findById(id);
      if (!compliance) return null;
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
      if (updateFields.length === 0) return compliance;
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);
      const result = await query(
        `UPDATE trustcore_compliance
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, name, description, rules, status,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        values
      );
      return this.mapRowToCompliance(result.rows[0]);
    } catch (error) {
      console.error('Error updating compliance:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const compliance = await this.findById(id);
      if (!compliance) return false;
      const result = await query('DELETE FROM trustcore_compliance WHERE id = $1', [id]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error deleting compliance:', error);
      throw error;
    }
  }

  private mapRowToCompliance(row: any): Compliance {
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
