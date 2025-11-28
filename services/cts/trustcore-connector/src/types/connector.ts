export interface Connector {
  id: string;
  name: string;
  description?: string;
  rules: Record<string, any>;
  status: 'draft' | 'active' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

export interface CreateConnectorInput {
  name: string;
  description?: string;
  rules: Record<string, any>;
  status?: 'draft' | 'active' | 'deprecated';
}

export interface UpdateConnectorInput {
  name?: string;
  description?: string;
  rules?: Record<string, any>;
  status?: 'draft' | 'active' | 'deprecated';
}
