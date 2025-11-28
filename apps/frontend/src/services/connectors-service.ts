/**
 * Connectors Service
 * Handles connector-related API calls with test functionality
 * Backend: Connector Service (Port 3009)
 */

import { connectorClient } from '@/utils/api-client';
import type { Connector, PaginatedResponse } from '@types';

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateConnectorData {
  name: string;
  description?: string;
  connectorType?: string;
  config?: any;
}

export interface UpdateConnectorData {
  name?: string;
  description?: string;
  connectorType?: string;
  config?: any;
  status?: 'draft' | 'active' | 'deprecated';
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  connectionTime?: number;
  error?: string;
}

class ConnectorsService {
  /**
   * Get paginated list of connectors
   */
  async list(params?: ListParams): Promise<PaginatedResponse<Connector>> {
    try {
      const queryParams: Record<string, any> = {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      };

      if (params?.search) queryParams.search = params.search;
      if (params?.sort) queryParams.sort = params.sort;
      if (params?.order) queryParams.order = params.order;

      const response = await connectorClient.get<PaginatedResponse<Connector>>(
        '/connectors',
        queryParams
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch connectors';
      console.error('ConnectorsService.list:', message);
      throw new Error(`Failed to fetch connectors: ${message}`);
    }
  }

  /**
   * Get single connector by ID
   */
  async get(id: string): Promise<Connector> {
    try {
      const response = await connectorClient.get<Connector>(
        `/connectors/${id}`
      );
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch connector';
      console.error('ConnectorsService.get:', message);
      throw new Error(`Failed to fetch connector: ${message}`);
    }
  }

  /**
   * Create new connector
   */
  async create(data: CreateConnectorData): Promise<Connector> {
    try {
      if (!data.name) {
        throw new Error('Connector name is required');
      }

      const response = await connectorClient.post<Connector>(
        '/connectors',
        data
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create connector';
      console.error('ConnectorsService.create:', message);
      throw new Error(`Failed to create connector: ${message}`);
    }
  }

  /**
   * Update connector
   */
  async update(id: string, data: UpdateConnectorData): Promise<Connector> {
    try {
      if (!id) {
        throw new Error('Connector ID is required');
      }

      const response = await connectorClient.put<Connector>(
        `/connectors/${id}`,
        data
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update connector';
      console.error('ConnectorsService.update:', message);
      throw new Error(`Failed to update connector: ${message}`);
    }
  }

  /**
   * Delete connector
   */
  async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Connector ID is required');
      }

      await connectorClient.delete(`/connectors/${id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete connector';
      console.error('ConnectorsService.delete:', message);
      throw new Error(`Failed to delete connector: ${message}`);
    }
  }

  /**
   * Search connectors
   */
  async search(query: string): Promise<Connector[]> {
    try {
      const response = await connectorClient.get<PaginatedResponse<Connector>>(
        '/connectors',
        { search: query, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to search connectors';
      console.error('ConnectorsService.search:', message);
      throw new Error(`Failed to search connectors: ${message}`);
    }
  }

  /**
   * Test connector connection
   */
  async testConnection(connectorId: string): Promise<TestConnectionResult> {
    try {
      if (!connectorId) {
        throw new Error('Connector ID is required');
      }

      const response = await connectorClient.post<TestConnectionResult>(
        `/connectors/${connectorId}/test`,
        {}
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to test connection';
      console.error('ConnectorsService.testConnection:', message);
      return {
        success: false,
        message: 'Connection test failed',
        error: message,
      };
    }
  }

  /**
   * Get active connectors
   */
  async getActive(): Promise<Connector[]> {
    try {
      const response = await connectorClient.get<PaginatedResponse<Connector>>(
        '/connectors',
        { search: 'active', pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch connectors';
      console.error('ConnectorsService.getActive:', message);
      throw new Error(`Failed to fetch connectors: ${message}`);
    }
  }

  /**
   * Get connector stats
   */
  async getStats(): Promise<{
    totalConnectors: number;
    activeCount: number;
    draftCount: number;
    deprecatedCount: number;
  }> {
    try {
      const response = await this.list({ pageSize: 1000 });

      return {
        totalConnectors: response.total,
        activeCount: response.data.filter((c) => c.status === 'active').length,
        draftCount: response.data.filter((c) => c.status === 'draft').length,
        deprecatedCount: response.data.filter((c) => c.status === 'deprecated')
          .length,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get stats';
      console.error('ConnectorsService.getStats:', message);
      throw new Error(`Failed to get connector stats: ${message}`);
    }
  }
}

export const connectorsService = new ConnectorsService();
export default connectorsService;
