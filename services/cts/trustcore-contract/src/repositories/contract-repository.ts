// Repository - PostgreSQL Database
import { query } from '@dataspace/db';
import type { Contract, CreateContractInput, UpdateContractInput } from '../types/contract.js';

export class ContractRepository {
  async create(input: CreateContractInput): Promise<Contract> {
    try {
      const result = await query(
        `INSERT INTO trustcore_contracts
         (name, description, rules, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, description, rules, status, created_at as "createdAt", updated_at as "updatedAt"`,
        [
          input.name,
          input.description || null,
          JSON.stringify(input.rules),
          input.status || 'draft',
        ]
      );
      return this.mapRowToContract(result.rows[0]);
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  async findAll(page: number = 1, pageSize: number = 10): Promise<{ data: Contract[]; total: number }> {
    try {
      const countResult = await query('SELECT COUNT(*) FROM trustcore_contracts');
      const total = parseInt(countResult.rows[0].count, 10);
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, name, description, rules, status, created_at as "createdAt", updated_at as "updatedAt"
         FROM trustcore_contracts
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );
      const data = result.rows.map((row: any) => this.mapRowToContract(row));
      return { data, total };
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Contract | null> {
    try {
      const result = await query(
        `SELECT id, name, description, rules, status, created_at as "createdAt", updated_at as "updatedAt"
         FROM trustcore_contracts
         WHERE id = $1`,
        [id]
      );
      return result.rows.length > 0 ? this.mapRowToContract(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching contract:', error);
      throw error;
    }
  }

  async update(id: string, input: UpdateContractInput): Promise<Contract | null> {
    try {
      const contract = await this.findById(id);
      if (!contract) return null;
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
      if (updateFields.length === 0) return contract;
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);
      const result = await query(
        `UPDATE trustcore_contracts
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, name, description, rules, status, created_at as "createdAt", updated_at as "updatedAt"`,
        values
      );
      return this.mapRowToContract(result.rows[0]);
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const contract = await this.findById(id);
      if (!contract) return false;
      const result = await query('DELETE FROM trustcore_contracts WHERE id = $1', [id]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  }

  private mapRowToContract(row: any): Contract {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      rules: typeof row.rules === 'string' ? JSON.parse(row.rules) : row.rules,
      status: row.status,
      createdAt: row.createdAt?.toISOString ? row.createdAt.toISOString() : row.createdAt,
      updatedAt: row.updatedAt?.toISOString ? row.updatedAt.toISOString() : row.updatedAt,
    };
  }
}
