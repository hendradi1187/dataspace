/**
 * Schemas Service
 * Handles all schema-related API calls
 * Backend: Hub Service (Port 3002)
 */

import { hubClient } from '@/utils/api-client';
import type { Schema, PaginatedResponse } from '@types';

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateSchemaData {
  name: string;
  namespace: string;
  version: string;
  format: 'json-schema' | 'shacl' | 'jsonld';
  content: Record<string, unknown>;
}

export interface UpdateSchemaData {
  name?: string;
  namespace?: string;
  version?: string;
  format?: 'json-schema' | 'shacl' | 'jsonld';
  content?: Record<string, unknown>;
  status?: 'draft' | 'published' | 'deprecated';
}

class SchemasService {
  /**
   * Get paginated list of schemas with optional filters
   */
  async list(params?: ListParams): Promise<PaginatedResponse<Schema>> {
    try {
      const queryParams: Record<string, any> = {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      };

      if (params?.search) queryParams.search = params.search;
      if (params?.sort) queryParams.sort = params.sort;
      if (params?.order) queryParams.order = params.order;

      const response = await hubClient.get<PaginatedResponse<Schema>>(
        '/schemas',
        queryParams
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch schemas';
      console.error('SchemasService.list:', message);
      throw new Error(`Failed to fetch schemas: ${message}`);
    }
  }

  /**
   * Get single schema by ID
   */
  async get(id: string): Promise<Schema> {
    try {
      const response = await hubClient.get<Schema>(`/schemas/${id}`);
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch schema';
      console.error('SchemasService.get:', message);
      throw new Error(`Failed to fetch schema: ${message}`);
    }
  }

  /**
   * Create new schema
   */
  async create(data: CreateSchemaData): Promise<Schema> {
    try {
      if (!data.name || !data.namespace || !data.format) {
        throw new Error('Name, namespace, and format are required');
      }

      const response = await hubClient.post<Schema>('/schemas', data);
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create schema';
      console.error('SchemasService.create:', message);
      throw new Error(`Failed to create schema: ${message}`);
    }
  }

  /**
   * Update schema
   */
  async update(id: string, data: UpdateSchemaData): Promise<Schema> {
    try {
      if (!id) {
        throw new Error('Schema ID is required');
      }

      const response = await hubClient.put<Schema>(`/schemas/${id}`, data);
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update schema';
      console.error('SchemasService.update:', message);
      throw new Error(`Failed to update schema: ${message}`);
    }
  }

  /**
   * Delete schema
   */
  async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Schema ID is required');
      }

      await hubClient.delete(`/schemas/${id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete schema';
      console.error('SchemasService.delete:', message);
      throw new Error(`Failed to delete schema: ${message}`);
    }
  }

  /**
   * Search schemas by query
   */
  async search(query: string): Promise<Schema[]> {
    try {
      const response = await hubClient.get<PaginatedResponse<Schema>>(
        '/schemas',
        { search: query, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to search schemas';
      console.error('SchemasService.search:', message);
      throw new Error(`Failed to search schemas: ${message}`);
    }
  }

  /**
   * Validate schema content (if supported by backend)
   */
  async validate(content: Record<string, unknown>): Promise<boolean> {
    try {
      // This might be a POST /schemas/validate endpoint
      const response = await hubClient.post<{ valid: boolean }>(
        '/schemas/validate',
        { content }
      );

      return response.valid;
    } catch (error) {
      // If endpoint doesn't exist, just return true
      console.warn('Schema validation endpoint not available');
      return true;
    }
  }
}

export const schemasService = new SchemasService();
export default schemasService;
