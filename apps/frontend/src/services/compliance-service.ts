/**
 * Compliance Service
 * Handles all compliance record-related API calls
 * Backend: TrustCore Compliance Service (Port 3005)
 */

import { complianceClient } from '@/utils/api-client';
import type { ComplianceRecord, PaginatedResponse } from '@types';

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateComplianceRecordData {
  datasetId: string;
  auditId?: string;
  findings: string;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations?: string;
}

export interface UpdateComplianceRecordData {
  findings?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
  recommendations?: string;
}

class ComplianceService {
  /**
   * Get paginated list of compliance records
   */
  async list(params?: ListParams): Promise<PaginatedResponse<ComplianceRecord>> {
    try {
      const queryParams: Record<string, any> = {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      };

      if (params?.search) queryParams.search = params.search;
      if (params?.sort) queryParams.sort = params.sort;
      if (params?.order) queryParams.order = params.order;

      const response = await complianceClient.get<
        PaginatedResponse<ComplianceRecord>
      >('/compliance-records', queryParams);

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch compliance records';
      console.error('ComplianceService.list:', message);
      throw new Error(`Failed to fetch compliance records: ${message}`);
    }
  }

  /**
   * Get single compliance record by ID
   */
  async get(id: string): Promise<ComplianceRecord> {
    try {
      const response = await complianceClient.get<ComplianceRecord>(
        `/compliance-records/${id}`
      );
      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch compliance record';
      console.error('ComplianceService.get:', message);
      throw new Error(`Failed to fetch compliance record: ${message}`);
    }
  }

  /**
   * Create new compliance record
   */
  async create(data: CreateComplianceRecordData): Promise<ComplianceRecord> {
    try {
      if (!data.datasetId || !data.findings) {
        throw new Error('Dataset ID and findings are required');
      }

      const response = await complianceClient.post<ComplianceRecord>(
        '/compliance-records',
        data
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create compliance record';
      console.error('ComplianceService.create:', message);
      throw new Error(`Failed to create compliance record: ${message}`);
    }
  }

  /**
   * Update compliance record
   */
  async update(
    id: string,
    data: UpdateComplianceRecordData
  ): Promise<ComplianceRecord> {
    try {
      if (!id) {
        throw new Error('Compliance record ID is required');
      }

      const response = await complianceClient.put<ComplianceRecord>(
        `/compliance-records/${id}`,
        data
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update compliance record';
      console.error('ComplianceService.update:', message);
      throw new Error(`Failed to update compliance record: ${message}`);
    }
  }

  /**
   * Delete compliance record
   */
  async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Compliance record ID is required');
      }

      await complianceClient.delete(`/compliance-records/${id}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete compliance record';
      console.error('ComplianceService.delete:', message);
      throw new Error(`Failed to delete compliance record: ${message}`);
    }
  }

  /**
   * Search compliance records
   */
  async search(query: string): Promise<ComplianceRecord[]> {
    try {
      const response = await complianceClient.get<
        PaginatedResponse<ComplianceRecord>
      >('/compliance-records', { search: query, pageSize: 100 });

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to search compliance records';
      console.error('ComplianceService.search:', message);
      throw new Error(`Failed to search compliance records: ${message}`);
    }
  }

  /**
   * Get compliance records by risk level
   */
  async getByRiskLevel(
    riskLevel: 'low' | 'medium' | 'high'
  ): Promise<ComplianceRecord[]> {
    try {
      const response = await complianceClient.get<
        PaginatedResponse<ComplianceRecord>
      >('/compliance-records', {
        search: riskLevel,
        pageSize: 100,
      });

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch compliance records';
      console.error('ComplianceService.getByRiskLevel:', message);
      throw new Error(`Failed to fetch compliance records: ${message}`);
    }
  }

  /**
   * Get compliance records by status
   */
  async getByStatus(
    status: 'draft' | 'pending' | 'approved' | 'rejected'
  ): Promise<ComplianceRecord[]> {
    try {
      const response = await complianceClient.get<
        PaginatedResponse<ComplianceRecord>
      >('/compliance-records', { search: status, pageSize: 100 });

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch compliance records';
      console.error('ComplianceService.getByStatus:', message);
      throw new Error(`Failed to fetch compliance records: ${message}`);
    }
  }

  /**
   * Get compliance records for a dataset
   */
  async getByDataset(datasetId: string): Promise<ComplianceRecord[]> {
    try {
      if (!datasetId) {
        throw new Error('Dataset ID is required');
      }

      const response = await complianceClient.get<
        PaginatedResponse<ComplianceRecord>
      >('/compliance-records', { search: datasetId, pageSize: 100 });

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch compliance records';
      console.error('ComplianceService.getByDataset:', message);
      throw new Error(`Failed to fetch compliance records: ${message}`);
    }
  }

  /**
   * Get high risk compliance records
   */
  async getHighRiskRecords(): Promise<ComplianceRecord[]> {
    return this.getByRiskLevel('high');
  }

  /**
   * Count records by risk level
   */
  async countByRiskLevel(): Promise<Record<string, number>> {
    try {
      const all = await this.list({ pageSize: 1000 });

      return {
        low: all.data.filter((r) => r.riskLevel === 'low').length,
        medium: all.data.filter((r) => r.riskLevel === 'medium').length,
        high: all.data.filter((r) => r.riskLevel === 'high').length,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to count compliance records';
      console.error('ComplianceService.countByRiskLevel:', message);
      throw new Error(`Failed to count compliance records: ${message}`);
    }
  }
}

export const complianceService = new ComplianceService();
export default complianceService;
