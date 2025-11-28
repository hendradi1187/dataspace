/**
 * Type Definitions for Dataspace Platform Frontend
 */

// ============= Service Health =============
export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  service: string;
  timestamp?: string;
}

// ============= Participants =============
export interface Participant {
  id: string;
  did: string;
  name: string;
  description?: string;
  endpointUrl?: string;
  publicKey?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

// ============= Datasets =============
export interface Dataset {
  id: string;
  participantId: string;
  name: string;
  description?: string;
  schemaRef?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// ============= Policies =============
export interface PolicyRule {
  id: string;
  name: string;
  condition: string;
  effect: 'allow' | 'deny';
  priority: number;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  rules: PolicyRule[];
  status: 'draft' | 'active' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

// ============= Contracts =============
export interface Contract {
  id: string;
  providerId: string;
  consumerId: string;
  datasetId: string;
  policyId: string;
  status: 'draft' | 'negotiating' | 'active' | 'expired' | 'terminated';
  terms: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// ============= Compliance =============
export interface ComplianceRecord {
  id: string;
  datasetId: string;
  auditId: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  findings: string;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

// ============= Ledger (Transactions) =============
export interface Transaction {
  id: string;
  datasetId: string;
  participantId: string;
  action: string;
  amount: number;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

// ============= Clearing =============
export interface ClearingRecord {
  id: string;
  contractId: string;
  providerId: string;
  consumerId: string;
  amount: number;
  status: 'pending' | 'cleared' | 'failed';
  createdAt: string;
  updatedAt: string;
}

// ============= AppStore =============
export interface App {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'published' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

// ============= Connector =============
export interface Connector {
  id: string;
  name: string;
  description?: string;
  connectorType?: string;
  config?: any;
  status: 'draft' | 'active' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorMetadata {
  id: string;
  name: string;
  description?: string;
  status: 'online' | 'offline' | 'maintenance';
  version: string;
  endpoint: string;
  lastHeartbeat: string;
}

export interface ConnectorApp {
  id: string;
  name: string;
  version: string;
  status: 'installed' | 'available' | 'outdated';
  installDate?: string;
  description?: string;
}

export interface ConnectorPolicy {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  rules: Record<string, unknown>;
  updatedAt: string;
}

// ============= Authentication =============
export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'participant' | 'viewer';
  organizationId?: string;
}

// ============= Notifications =============
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// ============= API Response =============
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============= Metrics =============
export interface ServiceMetrics {
  serviceName: string;
  uptime: number;
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastUpdated: string;
}

// ============= Hub - Schemas & Vocabularies =============
export interface Schema {
  id: string;
  name: string;
  namespace: string;
  version: string;
  format: 'json-schema' | 'shacl' | 'jsonld';
  content: Record<string, unknown>;
  status: 'draft' | 'published' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

export interface Vocabulary {
  id: string;
  name: string;
  namespace: string;
  version: string;
  format: 'json' | 'rdf' | 'owl';
  terms: string[];
  status: 'draft' | 'published' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}
