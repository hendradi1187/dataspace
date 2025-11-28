/**
 * IDP (Identity Provider) Type Definitions
 */

// ============= Credentials =============
export interface Credential {
  id: string;
  clientId: string;
  clientSecret: string;
  participantId: string;
  scope: string[];
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface CreateCredentialRequest {
  clientId: string;
  participantId: string;
  scope?: string[];
}

export interface UpdateCredentialRequest {
  scope?: string[];
  status?: 'active' | 'revoked' | 'expired';
}

// ============= Tokens =============
export interface Token {
  id: string;
  accessToken: string;
  refreshToken?: string;
  tokenType: string; // 'Bearer', 'DID', etc.
  credentialId: string;
  issuedAt: string;
  expiresAt: string;
  scope: string[];
}

export interface IssueTokenRequest {
  clientId: string;
  clientSecret: string;
  grantType: 'client_credentials' | 'refresh_token';
  scope?: string[];
  refreshToken?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  scope: string[];
}

// ============= API Keys =============
export interface ApiKey {
  id: string;
  key: string;
  name: string;
  participantId: string;
  scope: string[];
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
}

export interface CreateApiKeyRequest {
  name: string;
  participantId: string;
  scope?: string[];
}

export interface UpdateApiKeyRequest {
  name?: string;
  scope?: string[];
  status?: 'active' | 'revoked' | 'expired';
}

// ============= Responses =============
export interface CredentialResponse {
  data: Credential;
  status: number;
}

export interface PaginatedCredentialsResponse {
  data: Credential[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiKeyResponse {
  data: ApiKey;
  status: number;
}

export interface PaginatedApiKeysResponse {
  data: ApiKey[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
