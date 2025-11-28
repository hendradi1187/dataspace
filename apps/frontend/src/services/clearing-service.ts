/**
 * Clearing Service
 * Handles clearing/settlement record-related API calls
 * Backend: TrustCore Clearing Service (Port 3007)
 */

import { clearingClient } from '@/utils/api-client';
import type { ClearingRecord, PaginatedResponse } from '@types';

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateClearingRecordData {
  contractId: string;
  providerId: string;
  consumerId: string;
  amount: number;
  notes?: string;
}

export interface UpdateClearingRecordData {
  amount?: number;
  status?: 'pending' | 'cleared' | 'failed';
  settledAt?: string;
  notes?: string;
}

class ClearingService {
  /**
   * Get paginated list of clearing records
   */
  async list(params?: ListParams): Promise<PaginatedResponse<ClearingRecord>> {
    try {
      const queryParams: Record<string, any> = {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      };

      if (params?.search) queryParams.search = params.search;
      if (params?.sort) queryParams.sort = params.sort;
      if (params?.order) queryParams.order = params.order;

      const response = await clearingClient.get<PaginatedResponse<ClearingRecord>>(
        '/clearing-records',
        queryParams
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch clearing records';
      console.error('ClearingService.list:', message);
      throw new Error(`Failed to fetch clearing records: ${message}`);
    }
  }

  /**
   * Get single clearing record by ID
   */
  async get(id: string): Promise<ClearingRecord> {
    try {
      const response = await clearingClient.get<ClearingRecord>(
        `/clearing-records/${id}`
      );
      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch clearing record';
      console.error('ClearingService.get:', message);
      throw new Error(`Failed to fetch clearing record: ${message}`);
    }
  }

  /**
   * Create new clearing record
   */
  async create(data: CreateClearingRecordData): Promise<ClearingRecord> {
    try {
      if (!data.contractId || !data.providerId || !data.consumerId || data.amount <= 0) {
        throw new Error(
          'Contract, provider, consumer, and positive amount are required'
        );
      }

      const response = await clearingClient.post<ClearingRecord>(
        '/clearing-records',
        data
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create clearing record';
      console.error('ClearingService.create:', message);
      throw new Error(`Failed to create clearing record: ${message}`);
    }
  }

  /**
   * Update clearing record
   */
  async update(
    id: string,
    data: UpdateClearingRecordData
  ): Promise<ClearingRecord> {
    try {
      if (!id) {
        throw new Error('Clearing record ID is required');
      }

      const response = await clearingClient.put<ClearingRecord>(
        `/clearing-records/${id}`,
        data
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update clearing record';
      console.error('ClearingService.update:', message);
      throw new Error(`Failed to update clearing record: ${message}`);
    }
  }

  /**
   * Delete clearing record
   */
  async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Clearing record ID is required');
      }

      await clearingClient.delete(`/clearing-records/${id}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete clearing record';
      console.error('ClearingService.delete:', message);
      throw new Error(`Failed to delete clearing record: ${message}`);
    }
  }

  /**
   * Search clearing records
   */
  async search(query: string): Promise<ClearingRecord[]> {
    try {
      const response = await clearingClient.get<PaginatedResponse<ClearingRecord>>(
        '/clearing-records',
        { search: query, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to search clearing records';
      console.error('ClearingService.search:', message);
      throw new Error(`Failed to search clearing records: ${message}`);
    }
  }

  /**
   * Get clearing records by status
   */
  async getByStatus(
    status: 'pending' | 'cleared' | 'failed'
  ): Promise<ClearingRecord[]> {
    try {
      const response = await clearingClient.get<PaginatedResponse<ClearingRecord>>(
        '/clearing-records',
        { search: status, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch clearing records';
      console.error('ClearingService.getByStatus:', message);
      throw new Error(`Failed to fetch clearing records: ${message}`);
    }
  }

  /**
   * Get clearing records by provider
   */
  async getByProvider(providerId: string): Promise<ClearingRecord[]> {
    try {
      if (!providerId) {
        throw new Error('Provider ID is required');
      }

      const response = await clearingClient.get<PaginatedResponse<ClearingRecord>>(
        '/clearing-records',
        { search: providerId, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch clearing records';
      console.error('ClearingService.getByProvider:', message);
      throw new Error(`Failed to fetch clearing records: ${message}`);
    }
  }

  /**
   * Get clearing records by consumer
   */
  async getByConsumer(consumerId: string): Promise<ClearingRecord[]> {
    try {
      if (!consumerId) {
        throw new Error('Consumer ID is required');
      }

      const response = await clearingClient.get<PaginatedResponse<ClearingRecord>>(
        '/clearing-records',
        { search: consumerId, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch clearing records';
      console.error('ClearingService.getByConsumer:', message);
      throw new Error(`Failed to fetch clearing records: ${message}`);
    }
  }

  /**
   * Get clearing summary statistics
   */
  async getSummary(): Promise<{
    totalRecords: number;
    pendingCount: number;
    clearedCount: number;
    failedCount: number;
    totalAmount: number;
    pendingAmount: number;
  }> {
    try {
      const response = await this.list({ pageSize: 1000 });

      const pending = response.data.filter((r) => r.status === 'pending');
      const cleared = response.data.filter((r) => r.status === 'cleared');
      const failed = response.data.filter((r) => r.status === 'failed');

      return {
        totalRecords: response.total,
        pendingCount: pending.length,
        clearedCount: cleared.length,
        failedCount: failed.length,
        totalAmount: response.data.reduce((sum, r) => sum + (r.amount || 0), 0),
        pendingAmount: pending.reduce((sum, r) => sum + (r.amount || 0), 0),
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get summary';
      console.error('ClearingService.getSummary:', message);
      throw new Error(`Failed to get clearing summary: ${message}`);
    }
  }
}

export const clearingService = new ClearingService();
export default clearingService;
