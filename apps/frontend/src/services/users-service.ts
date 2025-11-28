/**
 * Users Service
 * Handles user management and role-related API calls
 * Backend: IDP Service (Port 3000)
 */

import { idpClient } from '@/utils/api-client';

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface User {
  id: string;
  email: string;
  name: string;
  department?: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  department?: string;
  role: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  department?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class UsersService {
  /**
   * Get paginated list of users
   */
  async list(params?: ListParams): Promise<PaginatedResponse<User>> {
    try {
      const queryParams: Record<string, any> = {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      };

      if (params?.search) queryParams.search = params.search;
      if (params?.sort) queryParams.sort = params.sort;
      if (params?.order) queryParams.order = params.order;

      const response = await idpClient.get<PaginatedResponse<User>>(
        '/users',
        queryParams
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch users';
      console.error('UsersService.list:', message);
      throw new Error(`Failed to fetch users: ${message}`);
    }
  }

  /**
   * Get single user by ID
   */
  async get(id: string): Promise<User> {
    try {
      const response = await idpClient.get<User>(`/users/${id}`);
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch user';
      console.error('UsersService.get:', message);
      throw new Error(`Failed to fetch user: ${message}`);
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await idpClient.get<User>('/users/me');
      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch current user';
      console.error('UsersService.getCurrentUser:', message);
      throw new Error(`Failed to fetch current user: ${message}`);
    }
  }

  /**
   * Create new user
   */
  async create(data: CreateUserData): Promise<User> {
    try {
      if (!data.email || !data.name || !data.role) {
        throw new Error('Email, name, and role are required');
      }

      const response = await idpClient.post<User>('/users', data);
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create user';
      console.error('UsersService.create:', message);
      throw new Error(`Failed to create user: ${message}`);
    }
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserData): Promise<User> {
    try {
      if (!id) {
        throw new Error('User ID is required');
      }

      const response = await idpClient.put<User>(`/users/${id}`, data);
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update user';
      console.error('UsersService.update:', message);
      throw new Error(`Failed to update user: ${message}`);
    }
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('User ID is required');
      }

      await idpClient.delete(`/users/${id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete user';
      console.error('UsersService.delete:', message);
      throw new Error(`Failed to delete user: ${message}`);
    }
  }

  /**
   * Search users
   */
  async search(query: string): Promise<User[]> {
    try {
      const response = await idpClient.get<PaginatedResponse<User>>(
        '/users',
        { search: query, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to search users';
      console.error('UsersService.search:', message);
      throw new Error(`Failed to search users: ${message}`);
    }
  }

  /**
   * Get all available roles
   */
  async getRoles(): Promise<Role[]> {
    try {
      const response = await idpClient.get<Role[]>('/roles');
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch roles';
      console.error('UsersService.getRoles:', message);
      throw new Error(`Failed to fetch roles: ${message}`);
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<User[]> {
    try {
      if (!role) {
        throw new Error('Role is required');
      }

      const response = await idpClient.get<PaginatedResponse<User>>(
        '/users',
        { search: role, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch users';
      console.error('UsersService.getUsersByRole:', message);
      throw new Error(`Failed to fetch users: ${message}`);
    }
  }

  /**
   * Get users by status
   */
  async getUsersByStatus(
    status: 'active' | 'inactive' | 'suspended'
  ): Promise<User[]> {
    try {
      const response = await idpClient.get<PaginatedResponse<User>>(
        '/users',
        { search: status, pageSize: 100 }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch users';
      console.error('UsersService.getUsersByStatus:', message);
      throw new Error(`Failed to fetch users: ${message}`);
    }
  }

  /**
   * Get user management stats
   */
  async getStats(): Promise<{
    totalUsers: number;
    activeCount: number;
    inactiveCount: number;
    suspendedCount: number;
    byRole: Record<string, number>;
  }> {
    try {
      const response = await this.list({ pageSize: 1000 });

      const byRole: Record<string, number> = {};
      response.data.forEach((u) => {
        byRole[u.role] = (byRole[u.role] || 0) + 1;
      });

      return {
        totalUsers: response.total,
        activeCount: response.data.filter((u) => u.status === 'active').length,
        inactiveCount: response.data.filter((u) => u.status === 'inactive')
          .length,
        suspendedCount: response.data.filter((u) => u.status === 'suspended')
          .length,
        byRole,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get stats';
      console.error('UsersService.getStats:', message);
      throw new Error(`Failed to get user stats: ${message}`);
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      if (!userId || !currentPassword || !newPassword) {
        throw new Error('All fields are required');
      }

      await idpClient.post(`/users/${userId}/change-password`, {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to change password';
      console.error('UsersService.changePassword:', message);
      throw new Error(`Failed to change password: ${message}`);
    }
  }

  /**
   * Reset user password (admin only)
   */
  async resetPassword(userId: string): Promise<{ tempPassword: string }> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await idpClient.post<{ tempPassword: string }>(
        `/users/${userId}/reset-password`,
        {}
      );

      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to reset password';
      console.error('UsersService.resetPassword:', message);
      throw new Error(`Failed to reset password: ${message}`);
    }
  }
}

export const usersService = new UsersService();
export default usersService;
