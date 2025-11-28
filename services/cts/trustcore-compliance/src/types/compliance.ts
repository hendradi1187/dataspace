export interface Compliance {
  id: string;
  name: string;
  description?: string;
  rules: Record<string, any>;
  status: 'draft' | 'active' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplianceInput {
  name: string;
  description?: string;
  rules: Record<string, any>;
  status?: 'draft' | 'active' | 'deprecated';
}

export interface UpdateComplianceInput {
  name?: string;
  description?: string;
  rules?: Record<string, any>;
  status?: 'draft' | 'active' | 'deprecated';
}
