/**
 * Apps Service
 * Handles application/app store-related API calls
 * Backend: TrustCore AppStore Service (Port 3008)
 */

import { appstoreClient } from '@/utils/api-client';
import type { App, PaginatedResponse } from '@types';

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateAppData {
  name: string;
  description?: string;
  version: string;
  documentation?: string;
  downloadUrl?: string;
}

export interface UpdateAppData {
  name?: string;
  description?: string;
  version?: string;
  status?: 'draft' | 'published' | 'deprecated';
  documentation?: string;
  downloadUrl?: string;
}

class AppsService {
  /**
   * Get paginated list of apps
   */
  async list(params?: ListParams): Promise<PaginatedResponse<App>> {
    try {
      const queryParams: Record<string, any> = {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      };

      if (params?.search) queryParams.search = params.search;
      if (params?.sort) queryParams.sort = params.sort;
      if (params?.order) queryParams.order = params.order;

      const response = await appstoreClient.get<PaginatedResponse<App>>(
        '/apps',
        queryParams
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch apps';
      console.error('AppsService.list:', message);
      throw new Error(`Failed to fetch apps: ${message}`);
    }
  }

  /**
   * Get single app by ID
   */
  async get(id: string): Promise<App> {
    try {
      const response = await appstoreClient.get<App>(`/apps/${id}`);
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch app';
      console.error('AppsService.get:', message);
      throw new Error(`Failed to fetch app: ${message}`);
    }
  }

  /**
   * Create new app
   */
  async create(data: CreateAppData): Promise<App> {
    try {
      if (!data.name || !data.version) {
        throw new Error('Name and version are required');
      }

      const response = await appstoreClient.post<App>('/apps', data);
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create app';
      console.error('AppsService.create:', message);
      throw new Error(`Failed to create app: ${message}`);
    }
  }

  /**
   * Update app
   */
  async update(id: string, data: UpdateAppData): Promise<App> {
    try {
      if (!id) {
        throw new Error('App ID is required');
      }

      const response = await appstoreClient.put<App>(`/apps/${id}`, data);
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update app';
      console.error('AppsService.update:', message);
      throw new Error(`Failed to update app: ${message}`);
    }
  }

  /**
   * Delete app
   */
  async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('App ID is required');
      }

      await appstoreClient.delete(`/apps/${id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete app';
      console.error('AppsService.delete:', message);
      throw new Error(`Failed to delete app: ${message}`);
    }
  }

  /**
   * Search apps
   */
  async search(query: string): Promise<App[]> {
    try {
      const response = await appstoreClient.get<PaginatedResponse<App>>(
        '/apps',
        { search: query, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to search apps';
      console.error('AppsService.search:', message);
      throw new Error(`Failed to search apps: ${message}`);
    }
  }

  /**
   * Get published apps
   */
  async getPublished(): Promise<App[]> {
    try {
      const response = await appstoreClient.get<PaginatedResponse<App>>(
        '/apps',
        { search: 'published', pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch apps';
      console.error('AppsService.getPublished:', message);
      throw new Error(`Failed to fetch apps: ${message}`);
    }
  }

  /**
   * Get draft apps
   */
  async getDraft(): Promise<App[]> {
    try {
      const response = await appstoreClient.get<PaginatedResponse<App>>(
        '/apps',
        { search: 'draft', pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch apps';
      console.error('AppsService.getDraft:', message);
      throw new Error(`Failed to fetch apps: ${message}`);
    }
  }

  /**
   * Get stats
   */
  async getStats(): Promise<{
    totalApps: number;
    publishedCount: number;
    draftCount: number;
    deprecatedCount: number;
  }> {
    try {
      const response = await this.list({ pageSize: 1000 });

      return {
        totalApps: response.total,
        publishedCount: response.data.filter((a) => a.status === 'published')
          .length,
        draftCount: response.data.filter((a) => a.status === 'draft').length,
        deprecatedCount: response.data.filter((a) => a.status === 'deprecated')
          .length,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get stats';
      console.error('AppsService.getStats:', message);
      throw new Error(`Failed to get app stats: ${message}`);
    }
  }
}

export const appsService = new AppsService();
export default appsService;
