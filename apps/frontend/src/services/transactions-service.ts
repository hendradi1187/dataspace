/**
 * Transactions Service
 * Handles transaction/ledger viewing (READ-ONLY)
 * Backend: Ledger Service (Port 3006)
 */

import { ledgerClient } from '@/utils/api-client';
import type { Transaction, PaginatedResponse } from '@types';

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

class TransactionsService {
  /**
   * Get paginated list of transactions (READ-ONLY)
   */
  async list(params?: ListParams): Promise<PaginatedResponse<Transaction>> {
    try {
      const queryParams: Record<string, any> = {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      };

      if (params?.search) queryParams.search = params.search;
      if (params?.sort) queryParams.sort = params.sort;
      if (params?.order) queryParams.order = params.order;

      const response = await ledgerClient.get<PaginatedResponse<Transaction>>(
        '/transactions',
        queryParams
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch transactions';
      console.error('TransactionsService.list:', message);
      throw new Error(`Failed to fetch transactions: ${message}`);
    }
  }

  /**
   * Get single transaction by ID (READ-ONLY)
   */
  async get(id: string): Promise<Transaction> {
    try {
      const response = await ledgerClient.get<Transaction>(
        `/transactions/${id}`
      );
      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch transaction';
      console.error('TransactionsService.get:', message);
      throw new Error(`Failed to fetch transaction: ${message}`);
    }
  }

  /**
   * Search transactions (READ-ONLY)
   */
  async search(query: string): Promise<Transaction[]> {
    try {
      const response = await ledgerClient.get<PaginatedResponse<Transaction>>(
        '/transactions',
        { search: query, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to search transactions';
      console.error('TransactionsService.search:', message);
      throw new Error(`Failed to search transactions: ${message}`);
    }
  }

  /**
   * Get transactions for a dataset (READ-ONLY)
   */
  async getByDataset(datasetId: string): Promise<Transaction[]> {
    try {
      if (!datasetId) {
        throw new Error('Dataset ID is required');
      }

      const response = await ledgerClient.get<PaginatedResponse<Transaction>>(
        '/transactions',
        { search: datasetId, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch transactions';
      console.error('TransactionsService.getByDataset:', message);
      throw new Error(`Failed to fetch transactions: ${message}`);
    }
  }

  /**
   * Get transactions for a participant (READ-ONLY)
   */
  async getByParticipant(participantId: string): Promise<Transaction[]> {
    try {
      if (!participantId) {
        throw new Error('Participant ID is required');
      }

      const response = await ledgerClient.get<PaginatedResponse<Transaction>>(
        '/transactions',
        { search: participantId, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch transactions';
      console.error('TransactionsService.getByParticipant:', message);
      throw new Error(`Failed to fetch transactions: ${message}`);
    }
  }

  /**
   * Get transactions by action type (READ-ONLY)
   */
  async getByAction(action: string): Promise<Transaction[]> {
    try {
      if (!action) {
        throw new Error('Action type is required');
      }

      const response = await ledgerClient.get<PaginatedResponse<Transaction>>(
        '/transactions',
        { search: action, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch transactions';
      console.error('TransactionsService.getByAction:', message);
      throw new Error(`Failed to fetch transactions: ${message}`);
    }
  }

  /**
   * Get transaction summary (aggregated)
   */
  async getSummary(): Promise<{
    totalTransactions: number;
    totalAmount: number;
    averageAmount: number;
    latestTransaction: Transaction | null;
  }> {
    try {
      const response = await this.list({ pageSize: 1000 });

      if (response.data.length === 0) {
        return {
          totalTransactions: 0,
          totalAmount: 0,
          averageAmount: 0,
          latestTransaction: null,
        };
      }

      const totalAmount = response.data.reduce(
        (sum, t) => sum + (t.amount || 0),
        0
      );

      return {
        totalTransactions: response.total,
        totalAmount,
        averageAmount: totalAmount / response.data.length,
        latestTransaction: response.data[0],
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get summary';
      console.error('TransactionsService.getSummary:', message);
      throw new Error(`Failed to get transaction summary: ${message}`);
    }
  }

  /**
   * Export transactions to CSV
   */
  async exportToCSV(transactions: Transaction[]): Promise<string> {
    try {
      const headers = ['ID', 'Dataset', 'Participant', 'Action', 'Amount', 'Timestamp'];
      const rows = transactions.map((t) => [
        t.id,
        t.datasetId,
        t.participantId,
        t.action,
        t.amount,
        t.timestamp,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n');

      return csvContent;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to export transactions';
      console.error('TransactionsService.exportToCSV:', message);
      throw new Error(`Failed to export transactions: ${message}`);
    }
  }
}

export const transactionsService = new TransactionsService();
export default transactionsService;
