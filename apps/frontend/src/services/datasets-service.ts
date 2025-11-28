/**
 * Datasets Service
 * Handles all dataset-related API calls
 * Backend: Broker Service (Port 3001)
 */

import { brokerClient } from '@/utils/api-client';
import type { Dataset, PaginatedResponse } from '@types';

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateDatasetData {
  participantId: string;
  name: string;
  description?: string;
  schemaRef?: string;
}

export interface UpdateDatasetData {
  name?: string;
  description?: string;
  schemaRef?: string;
  status?: 'draft' | 'published' | 'archived';
}

class DatasetsService {
  /**
   * Get paginated list of datasets with optional filters
   */
  async list(params?: ListParams): Promise<PaginatedResponse<Dataset>> {
    try {
      const queryParams: Record<string, any> = {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      };

      if (params?.search) queryParams.search = params.search;
      if (params?.sort) queryParams.sort = params.sort;
      if (params?.order) queryParams.order = params.order;

      const response = await brokerClient.get<PaginatedResponse<Dataset>>(
        '/datasets',
        queryParams
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch datasets';
      console.error('DatasetsService.list:', message);
      throw new Error(`Failed to fetch datasets: ${message}`);
    }
  }

  /**
   * Get single dataset by ID
   */
  async get(id: string): Promise<Dataset> {
    try {
      const response = await brokerClient.get<Dataset>(`/datasets/${id}`);
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch dataset';
      console.error('DatasetsService.get:', message);
      throw new Error(`Failed to fetch dataset: ${message}`);
    }
  }

  /**
   * Create new dataset
   */
  async create(data: CreateDatasetData): Promise<Dataset> {
    try {
      if (!data.participantId || !data.name) {
        throw new Error('Participant ID and name are required');
      }

      const response = await brokerClient.post<Dataset>('/datasets', data);
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create dataset';
      console.error('DatasetsService.create:', message);
      throw new Error(`Failed to create dataset: ${message}`);
    }
  }

  /**
   * Update dataset
   */
  async update(id: string, data: UpdateDatasetData): Promise<Dataset> {
    try {
      if (!id) {
        throw new Error('Dataset ID is required');
      }

      const response = await brokerClient.put<Dataset>(
        `/datasets/${id}`,
        data
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update dataset';
      console.error('DatasetsService.update:', message);
      throw new Error(`Failed to update dataset: ${message}`);
    }
  }

  /**
   * Delete dataset
   */
  async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Dataset ID is required');
      }

      await brokerClient.delete(`/datasets/${id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete dataset';
      console.error('DatasetsService.delete:', message);
      throw new Error(`Failed to delete dataset: ${message}`);
    }
  }

  /**
   * Search datasets by query
   */
  async search(query: string): Promise<Dataset[]> {
    try {
      const response = await brokerClient.get<PaginatedResponse<Dataset>>(
        '/datasets',
        { search: query, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to search datasets';
      console.error('DatasetsService.search:', message);
      throw new Error(`Failed to search datasets: ${message}`);
    }
  }

  /**
   * Get datasets for a specific participant
   */
  async getByParticipant(participantId: string): Promise<Dataset[]> {
    try {
      if (!participantId) {
        throw new Error('Participant ID is required');
      }

      const response = await brokerClient.get<PaginatedResponse<Dataset>>(
        `/participants/${participantId}/datasets`
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch participant datasets';
      console.error('DatasetsService.getByParticipant:', message);
      throw new Error(`Failed to fetch datasets: ${message}`);
    }
  }
}

export const datasetsService = new DatasetsService();
export default datasetsService;
