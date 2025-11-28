/**
 * Vocabularies Service
 * Handles all vocabulary-related API calls
 * Backend: Hub Service (Port 3002)
 */

import { hubClient } from '@/utils/api-client';
import type { Vocabulary, PaginatedResponse } from '@types';

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateVocabularyData {
  name: string;
  namespace: string;
  version: string;
  format?: 'json' | 'rdf' | 'owl';
  terms: string[];
}

export interface UpdateVocabularyData {
  name?: string;
  namespace?: string;
  version?: string;
  format?: 'json' | 'rdf' | 'owl';
  terms?: string[];
  status?: 'draft' | 'published' | 'deprecated';
}

class VocabulariesService {
  /**
   * Get paginated list of vocabularies with optional filters
   */
  async list(params?: ListParams): Promise<PaginatedResponse<Vocabulary>> {
    try {
      const queryParams: Record<string, any> = {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      };

      if (params?.search) queryParams.search = params.search;
      if (params?.sort) queryParams.sort = params.sort;
      if (params?.order) queryParams.order = params.order;

      const response = await hubClient.get<PaginatedResponse<Vocabulary>>(
        '/vocabularies',
        queryParams
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch vocabularies';
      console.error('VocabulariesService.list:', message);
      throw new Error(`Failed to fetch vocabularies: ${message}`);
    }
  }

  /**
   * Get single vocabulary by ID
   */
  async get(id: string): Promise<Vocabulary> {
    try {
      const response = await hubClient.get<any>(
        `/vocabularies/${id}`
      );
      return response.data || response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch vocabulary';
      console.error('VocabulariesService.get:', message);
      throw new Error(`Failed to fetch vocabulary: ${message}`);
    }
  }

  /**
   * Create new vocabulary
   */
  async create(data: CreateVocabularyData): Promise<Vocabulary> {
    try {
      if (!data.name || !data.namespace || !data.terms) {
        throw new Error('Name, namespace, and terms are required');
      }

      const response = await hubClient.post<any>(
        '/vocabularies',
        data
      );
      return response.data || response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create vocabulary';
      console.error('VocabulariesService.create:', message);
      throw new Error(`Failed to create vocabulary: ${message}`);
    }
  }

  /**
   * Update vocabulary
   */
  async update(id: string, data: UpdateVocabularyData): Promise<Vocabulary> {
    try {
      if (!id) {
        throw new Error('Vocabulary ID is required');
      }

      const response = await hubClient.put<any>(
        `/vocabularies/${id}`,
        data
      );

      return response.data || response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update vocabulary';
      console.error('VocabulariesService.update:', message);
      throw new Error(`Failed to update vocabulary: ${message}`);
    }
  }

  /**
   * Delete vocabulary
   */
  async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Vocabulary ID is required');
      }

      await hubClient.delete(`/vocabularies/${id}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete vocabulary';
      console.error('VocabulariesService.delete:', message);
      throw new Error(`Failed to delete vocabulary: ${message}`);
    }
  }

  /**
   * Search vocabularies by query
   */
  async search(query: string): Promise<Vocabulary[]> {
    try {
      const response = await hubClient.get<PaginatedResponse<Vocabulary>>(
        '/vocabularies',
        { search: query, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to search vocabularies';
      console.error('VocabulariesService.search:', message);
      throw new Error(`Failed to search vocabularies: ${message}`);
    }
  }

  /**
   * Get terms from vocabulary
   */
  async getTerms(id: string): Promise<string[]> {
    try {
      if (!id) {
        throw new Error('Vocabulary ID is required');
      }

      const vocabulary = await this.get(id);
      return vocabulary.terms || [];
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch terms';
      console.error('VocabulariesService.getTerms:', message);
      throw new Error(`Failed to fetch terms: ${message}`);
    }
  }
}

export const vocabulariesService = new VocabulariesService();
export default vocabulariesService;
