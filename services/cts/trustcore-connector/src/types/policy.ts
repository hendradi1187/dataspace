export interface Policy {
  id: string;
  name: string;
  description: string;
  rules: PolicyRule[];
  status: 'draft' | 'active' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRule {
  id: string;
  name: string;
  condition: string;
  effect: 'allow' | 'deny';
  priority: number;
}

export interface CreatePolicyInput {
  name: string;
  description: string;
  rules: PolicyRule[];
  status?: 'draft' | 'active' | 'deprecated';
}

export interface UpdatePolicyInput {
  name?: string;
  description?: string;
  rules?: PolicyRule[];
  status?: 'draft' | 'active' | 'deprecated';
}
