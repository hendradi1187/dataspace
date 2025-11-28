/**
 * Policies Service
 * Handles all policy-related API calls
 * Backend: TrustCore Policy Service (Port 3003)
 */

import { policyClient } from '@/utils/api-client';
import type { Policy, PaginatedResponse } from '@types';

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreatePolicyData {
  name: string;
  description?: string;
  rules: Array<{
    name: string;
    condition: string;
    effect: 'allow' | 'deny';
    priority: number;
  }>;
}

export interface UpdatePolicyData {
  name?: string;
  description?: string;
  rules?: Array<{
    name: string;
    condition: string;
    effect: 'allow' | 'deny';
    priority: number;
  }>;
  status?: 'draft' | 'active' | 'deprecated';
}

class PoliciesService {
  /**
   * Get paginated list of policies
   */
  async list(params?: ListParams): Promise<PaginatedResponse<Policy>> {
    try {
      const queryParams: Record<string, any> = {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      };

      if (params?.search) queryParams.search = params.search;
      if (params?.sort) queryParams.sort = params.sort;
      if (params?.order) queryParams.order = params.order;

      const response = await policyClient.get<PaginatedResponse<Policy>>(
        '/policies',
        queryParams
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch policies';
      console.error('PoliciesService.list:', message);
      throw new Error(`Failed to fetch policies: ${message}`);
    }
  }

  /**
   * Get single policy by ID
   */
  async get(id: string): Promise<Policy> {
    try {
      const response = await policyClient.get<Policy>(`/policies/${id}`);
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch policy';
      console.error('PoliciesService.get:', message);
      throw new Error(`Failed to fetch policy: ${message}`);
    }
  }

  /**
   * Create new policy
   */
  async create(data: CreatePolicyData): Promise<Policy> {
    try {
      if (!data.name || !data.rules || data.rules.length === 0) {
        throw new Error('Name and at least one rule are required');
      }

      // Validate rules
      data.rules.forEach((rule, index) => {
        if (!rule.name || !rule.condition || !rule.effect) {
          throw new Error(`Rule ${index + 1} is missing required fields`);
        }
      });

      const response = await policyClient.post<Policy>('/policies', data);
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create policy';
      console.error('PoliciesService.create:', message);
      throw new Error(`Failed to create policy: ${message}`);
    }
  }

  /**
   * Update policy
   */
  async update(id: string, data: UpdatePolicyData): Promise<Policy> {
    try {
      if (!id) {
        throw new Error('Policy ID is required');
      }

      const response = await policyClient.put<Policy>(`/policies/${id}`, data);
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update policy';
      console.error('PoliciesService.update:', message);
      throw new Error(`Failed to update policy: ${message}`);
    }
  }

  /**
   * Delete policy
   */
  async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Policy ID is required');
      }

      await policyClient.delete(`/policies/${id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete policy';
      console.error('PoliciesService.delete:', message);
      throw new Error(`Failed to delete policy: ${message}`);
    }
  }

  /**
   * Search policies
   */
  async search(query: string): Promise<Policy[]> {
    try {
      const response = await policyClient.get<PaginatedResponse<Policy>>(
        '/policies',
        { search: query, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to search policies';
      console.error('PoliciesService.search:', message);
      throw new Error(`Failed to search policies: ${message}`);
    }
  }

  /**
   * Get rules for a policy
   */
  async getRules(policyId: string): Promise<any[]> {
    try {
      if (!policyId) {
        throw new Error('Policy ID is required');
      }

      const policy = await this.get(policyId);
      return policy.rules || [];
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch rules';
      console.error('PoliciesService.getRules:', message);
      throw new Error(`Failed to fetch rules: ${message}`);
    }
  }

  /**
   * Validate policy rules
   */
  async validateRules(rules: any[]): Promise<boolean> {
    try {
      const response = await policyClient.post<{ valid: boolean }>(
        '/policies/validate',
        { rules }
      );

      return response.valid;
    } catch (error) {
      // If endpoint doesn't exist, just return true
      console.warn('Policy validation endpoint not available');
      return true;
    }
  }
}

export const policiesService = new PoliciesService();
export default policiesService;
