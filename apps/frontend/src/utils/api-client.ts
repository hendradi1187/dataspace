import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiResponse } from '@types';

/**
 * API Client for Dataspace Services
 */
class ApiClient {
  private axiosInstance: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost') {
    this.baseURL = baseURL;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // Increased from 10s to 30s
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(path, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(path: string, data?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(path, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(path: string, data?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(path, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<T>(path: string, data?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<T>(path, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(path: string): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(path);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      return new Error(message);
    }
    return error;
  }
}

// Service-specific API clients
// Use Docker service names for container-to-container communication
export const idpClient = new ApiClient('http://dataspace-idp:3000');
export const brokerClient = new ApiClient('http://dataspace-broker:3001');
export const hubClient = new ApiClient('http://dataspace-hub:3002');
export const policyClient = new ApiClient('http://dataspace-policy:3003');
export const contractClient = new ApiClient('http://dataspace-contract:3004');
export const complianceClient = new ApiClient('http://dataspace-compliance:3005');
export const ledgerClient = new ApiClient('http://dataspace-ledger:3006');
export const clearingClient = new ApiClient('http://dataspace-clearing:3007');
export const appstoreClient = new ApiClient('http://dataspace-appstore:3008');
export const connectorClient = new ApiClient('http://dataspace-connector:3009');

export default ApiClient;
