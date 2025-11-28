/**
 * Credentials Users Service
 * Maps credentials from IDP to user format
 */

import { idpClient } from '@/utils/api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  department?: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class CredentialsUsersService {
  /**
   * Convert credentials to user format
   */
  private mapCredentialToUser(credential: any): User {
    return {
      id: credential.id,
      name: credential.clientId,
      email: `${credential.clientId}@dataspace.local`,
      role: credential.clientId === 'admin-client' ? 'admin' : 'participant',
      status: credential.status,
      department: credential.participantId || 'N/A',
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
      lastLogin: null,
    };
  }

  /**
   * Get users by fetching credentials
   */
  async getUsers(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<User>> {
    try {
      const response = await idpClient.get<any>('/credentials', {
        page,
        pageSize,
      });

      const users = response.data.map((cred: any) => this.mapCredentialToUser(cred));

      return {
        data: users,
        total: response.total || response.data.length,
        page: response.page || page,
        pageSize: response.pageSize || pageSize,
        totalPages: response.totalPages || Math.ceil((response.total || response.data.length) / pageSize),
      };
    } catch (error) {
      console.error('Failed to fetch credentials:', error);
      throw error;
    }
  }
}

export const credentialsUsersService = new CredentialsUsersService();
export default credentialsUsersService;
