export interface Clearing {
  id: string;
  name: string;
  description?: string;
  rules: Record<string, any>;
  status: 'draft' | 'active' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

export interface CreateClearingInput {
  name: string;
  description?: string;
  rules: Record<string, any>;
  status?: 'draft' | 'active' | 'deprecated';
}

export interface UpdateClearingInput {
  name?: string;
  description?: string;
  rules?: Record<string, any>;
  status?: 'draft' | 'active' | 'deprecated';
}
