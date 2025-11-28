// Repository - PostgreSQL Database
import { query } from '@dataspace/db';
import type { Connector, CreateConnectorInput, UpdateConnectorInput } from '../types/connector.js';

export class ConnectorRepository {
  async create(input: CreateConnectorInput): Promise<Connector> {
    try {
      const result = await query(
        `INSERT INTO trustcore_connectors
         (name, description, rules, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, description, rules, status,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [input.name, input.description, JSON.stringify(input.rules), input.status || 'draft']
      );
      return this.mapRowToConnector(result.rows[0]);
    } catch (error) {
      console.error('Error creating connector:', error);
      throw error;
    }
  }

  async findAll(page: number = 1, pageSize: number = 10): Promise<{ data: Connector[]; total: number }> {
    try {
      const countResult = await query('SELECT COUNT(*) FROM trustcore_connectors');
      const total = parseInt(countResult.rows[0].count, 10);
      const offset = (page - 1) * pageSize;
      const result = await query(
        `SELECT id, name, description, rules, status,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM trustcore_connectors
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );
      const data = result.rows.map((row: any) => this.mapRowToConnector(row));
      return { data, total };
    } catch (error) {
      console.error('Error fetching connectors:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Connector | null> {
    try {
      const result = await query(
        `SELECT id, name, description, rules, status,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM trustcore_connectors
         WHERE id = $1`,
        [id]
      );
      return result.rows.length > 0 ? this.mapRowToConnector(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching connector:', error);
      throw error;
    }
  }

  async update(id: string, input: UpdateConnectorInput): Promise<Connector | null> {
    try {
      const connector = await this.findById(id);
      if (!connector) return null;
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
      if (updateFields.length === 0) return connector;
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);
      const result = await query(
        `UPDATE trustcore_connectors
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, name, description, rules, status,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        values
      );
      return this.mapRowToConnector(result.rows[0]);
    } catch (error) {
      console.error('Error updating connector:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const connector = await this.findById(id);
      if (!connector) return false;
      const result = await query('DELETE FROM trustcore_connectors WHERE id = $1', [id]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error deleting connector:', error);
      throw error;
    }
  }

  private mapRowToConnector(row: any): Connector {
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
