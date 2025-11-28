export interface Contract {
  id: string;
  name: string;
  description?: string;
  rules: Record<string, any>;
  status: 'draft' | 'active' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractInput {
  name: string;
  description?: string;
  rules: Record<string, any>;
  status?: 'draft' | 'active' | 'deprecated';
}

export interface UpdateContractInput {
  name?: string;
  description?: string;
  rules?: Record<string, any>;
  status?: 'draft' | 'active' | 'deprecated';
}
