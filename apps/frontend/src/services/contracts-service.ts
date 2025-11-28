/**
 * Contracts Service
 * Handles all contract-related API calls
 * Backend: TrustCore Contract Service (Port 3004)
 */

import { contractClient } from '@/utils/api-client';
import type { Contract, PaginatedResponse } from '@types';

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateContractData {
  providerId: string;
  consumerId: string;
  datasetId: string;
  policyId: string;
  terms: string;
  expiresAt?: string;
}

export interface UpdateContractData {
  providerId?: string;
  consumerId?: string;
  datasetId?: string;
  policyId?: string;
  terms?: string;
  status?: 'draft' | 'negotiating' | 'active' | 'expired' | 'terminated';
  expiresAt?: string;
}

class ContractsService {
  /**
   * Get paginated list of contracts
   */
  async list(params?: ListParams): Promise<PaginatedResponse<Contract>> {
    try {
      const queryParams: Record<string, any> = {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      };

      if (params?.search) queryParams.search = params.search;
      if (params?.sort) queryParams.sort = params.sort;
      if (params?.order) queryParams.order = params.order;

      const response = await contractClient.get<PaginatedResponse<Contract>>(
        '/contracts',
        queryParams
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch contracts';
      console.error('ContractsService.list:', message);
      throw new Error(`Failed to fetch contracts: ${message}`);
    }
  }

  /**
   * Get single contract by ID
   */
  async get(id: string): Promise<Contract> {
    try {
      const response = await contractClient.get<Contract>(`/contracts/${id}`);
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch contract';
      console.error('ContractsService.get:', message);
      throw new Error(`Failed to fetch contract: ${message}`);
    }
  }

  /**
   * Create new contract
   */
  async create(data: CreateContractData): Promise<Contract> {
    try {
      if (!data.providerId || !data.consumerId || !data.datasetId || !data.policyId) {
        throw new Error('Provider, consumer, dataset, and policy are required');
      }

      const response = await contractClient.post<Contract>('/contracts', data);
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create contract';
      console.error('ContractsService.create:', message);
      throw new Error(`Failed to create contract: ${message}`);
    }
  }

  /**
   * Update contract
   */
  async update(id: string, data: UpdateContractData): Promise<Contract> {
    try {
      if (!id) {
        throw new Error('Contract ID is required');
      }

      const response = await contractClient.put<Contract>(
        `/contracts/${id}`,
        data
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update contract';
      console.error('ContractsService.update:', message);
      throw new Error(`Failed to update contract: ${message}`);
    }
  }

  /**
   * Delete contract
   */
  async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Contract ID is required');
      }

      await contractClient.delete(`/contracts/${id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete contract';
      console.error('ContractsService.delete:', message);
      throw new Error(`Failed to delete contract: ${message}`);
    }
  }

  /**
   * Search contracts
   */
  async search(query: string): Promise<Contract[]> {
    try {
      const response = await contractClient.get<PaginatedResponse<Contract>>(
        '/contracts',
        { search: query, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to search contracts';
      console.error('ContractsService.search:', message);
      throw new Error(`Failed to search contracts: ${message}`);
    }
  }

  /**
   * Get contracts by provider
   */
  async getByProvider(providerId: string): Promise<Contract[]> {
    try {
      if (!providerId) {
        throw new Error('Provider ID is required');
      }

      const response = await contractClient.get<PaginatedResponse<Contract>>(
        '/contracts',
        { search: providerId, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch contracts';
      console.error('ContractsService.getByProvider:', message);
      throw new Error(`Failed to fetch contracts: ${message}`);
    }
  }

  /**
   * Get contracts by consumer
   */
  async getByConsumer(consumerId: string): Promise<Contract[]> {
    try {
      if (!consumerId) {
        throw new Error('Consumer ID is required');
      }

      const response = await contractClient.get<PaginatedResponse<Contract>>(
        '/contracts',
        { search: consumerId, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch contracts';
      console.error('ContractsService.getByConsumer:', message);
      throw new Error(`Failed to fetch contracts: ${message}`);
    }
  }

  /**
   * Check if contract is active
   */
  isActive(contract: Contract): boolean {
    return contract.status === 'active' && new Date(contract.expiresAt) > new Date();
  }

  /**
   * Check if contract is expired
   */
  isExpired(contract: Contract): boolean {
    return new Date(contract.expiresAt) <= new Date();
  }

  /**
   * Get days until expiration
   */
  getDaysUntilExpiration(contract: Contract): number {
    const now = new Date();
    const expiresAt = new Date(contract.expiresAt);
    const diff = expiresAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}

export const contractsService = new ContractsService();
export default contractsService;
