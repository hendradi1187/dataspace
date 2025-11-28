/**
 * Authentication Service
 * Handles all authentication-related API calls to the IDP service
 */

import { idpClient } from '@/utils/api-client';
import type { AuthToken, AuthUser } from '@types';

export interface LoginCredentials {
  clientId: string;
  clientSecret: string;
  grantType?: string;
}

export interface TokenResponse extends AuthToken {
  expiresAt: number;
}

export interface UserProfile extends AuthUser {
  createdAt: string;
  lastLogin?: string;
}

class AuthService {
  /**
   * Issue OAuth2 token (Client Credentials flow)
   */
  async issueToken(credentials: LoginCredentials): Promise<TokenResponse> {
    try {
      const response = await idpClient.post<TokenResponse>('/token', {
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
        grantType: credentials.grantType || 'client_credentials',
      });

      // Calculate expiration time
      const expiresAt = new Date().getTime() + (response.expiresIn * 1000);
      return { ...response, expiresAt };
    } catch (error) {
      throw new Error(`Token issuance failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const response = await idpClient.post<TokenResponse>('/token/refresh', {
        refreshToken,
      });

      // Calculate expiration time
      const expiresAt = new Date().getTime() + (response.expiresIn * 1000);
      return { ...response, expiresAt };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Revoke access token
   */
  async revokeToken(token: string): Promise<void> {
    try {
      await idpClient.post('/token/revoke', { token });
    } catch (error) {
      throw new Error(`Token revocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    try {
      // This endpoint should return the current user information
      const response = await idpClient.get<UserProfile>('/users/me');
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify if token is valid
   */
  verifyToken(token: string): boolean {
    try {
      // Decode JWT token (simple validation without verification)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      // Decode payload
      const payload = JSON.parse(atob(parts[1]));

      // Check expiration
      if (payload.exp) {
        const expirationTime = payload.exp * 1000;
        const currentTime = new Date().getTime();
        return currentTime < expirationTime;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get token expiration time in milliseconds
   */
  getTokenExpirationTime(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp) {
        return payload.exp * 1000;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Store tokens securely (in localStorage for now, should use httpOnly cookies in production)
   */
  storeTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem('authToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    // Set token expiration
    const expirationTime = this.getTokenExpirationTime(accessToken);
    if (expirationTime) {
      localStorage.setItem('tokenExpiresAt', expirationTime.toString());
    }
  }

  /**
   * Clear stored tokens
   */
  clearTokens(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiresAt');
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return true;
    }

    const expirationTime = this.getTokenExpirationTime(token);
    if (!expirationTime) {
      return false; // Can't determine expiration
    }

    // Add 60 second buffer for refresh
    const bufferTime = 60000;
    const currentTime = new Date().getTime();
    return currentTime + bufferTime > expirationTime;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token && this.verifyToken(token);
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
