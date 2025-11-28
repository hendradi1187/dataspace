/**
 * Participants Service
 * Handles all participant-related API calls
 * Backend: Broker Service (Port 3001)
 */

import { brokerClient } from '@/utils/api-client';
import type { Participant, PaginatedResponse } from '@types';

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateParticipantData {
  did: string;
  name: string;
  description?: string;
  endpointUrl?: string;
  publicKey?: string;
}

export interface UpdateParticipantData {
  name?: string;
  description?: string;
  endpointUrl?: string;
  publicKey?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

class ParticipantsService {
  /**
   * Get paginated list of participants with optional filters
   * @param params - Pagination and filter parameters
   * @returns Paginated list of participants
   */
  async list(params?: ListParams): Promise<PaginatedResponse<Participant>> {
    try {
      const queryParams: Record<string, any> = {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      };

      // Add optional parameters
      if (params?.search) queryParams.search = params.search;
      if (params?.sort) queryParams.sort = params.sort;
      if (params?.order) queryParams.order = params.order;

      const response = await brokerClient.get<PaginatedResponse<Participant>>(
        '/participants',
        queryParams
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch participants';
      console.error('ParticipantsService.list:', message);
      throw new Error(`Failed to fetch participants: ${message}`);
    }
  }

  /**
   * Get single participant by ID
   * @param id - Participant ID
   * @returns Participant object
   */
  async get(id: string): Promise<Participant> {
    try {
      const response = await brokerClient.get<Participant>(
        `/participants/${id}`
      );
      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch participant';
      console.error('ParticipantsService.get:', message);
      throw new Error(`Failed to fetch participant: ${message}`);
    }
  }

  /**
   * Create new participant
   * @param data - Participant data
   * @returns Created participant
   */
  async create(data: CreateParticipantData): Promise<Participant> {
    try {
      // Validate required fields
      if (!data.did || !data.name) {
        throw new Error('DID and name are required');
      }

      const response = await brokerClient.post<Participant>(
        '/participants',
        data
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create participant';
      console.error('ParticipantsService.create:', message);
      throw new Error(`Failed to create participant: ${message}`);
    }
  }

  /**
   * Update participant
   * @param id - Participant ID
   * @param data - Updated participant data
   * @returns Updated participant
   */
  async update(
    id: string,
    data: UpdateParticipantData
  ): Promise<Participant> {
    try {
      if (!id) {
        throw new Error('Participant ID is required');
      }

      const response = await brokerClient.put<Participant>(
        `/participants/${id}`,
        data
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update participant';
      console.error('ParticipantsService.update:', message);
      throw new Error(`Failed to update participant: ${message}`);
    }
  }

  /**
   * Delete participant
   * @param id - Participant ID
   */
  async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Participant ID is required');
      }

      await brokerClient.delete(`/participants/${id}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete participant';
      console.error('ParticipantsService.delete:', message);
      throw new Error(`Failed to delete participant: ${message}`);
    }
  }

  /**
   * Search participants by query
   * @param query - Search query
   * @returns Array of matching participants
   */
  async search(query: string): Promise<Participant[]> {
    try {
      const response = await brokerClient.get<PaginatedResponse<Participant>>(
        '/participants',
        { search: query, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to search participants';
      console.error('ParticipantsService.search:', message);
      throw new Error(`Failed to search participants: ${message}`);
    }
  }

  /**
   * Get datasets for a participant
   * @param participantId - Participant ID
   * @returns Array of datasets owned by participant
   */
  async getDatasets(participantId: string): Promise<any[]> {
    try {
      if (!participantId) {
        throw new Error('Participant ID is required');
      }

      const response = await brokerClient.get<PaginatedResponse<any>>(
        `/participants/${participantId}/datasets`
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch datasets';
      console.error('ParticipantsService.getDatasets:', message);
      throw new Error(`Failed to fetch datasets: ${message}`);
    }
  }
}

// Export singleton instance
export const participantsService = new ParticipantsService();
export default participantsService;
