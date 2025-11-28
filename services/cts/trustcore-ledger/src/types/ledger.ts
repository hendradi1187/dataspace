export interface Ledger {
  id: string;
  name: string;
  description?: string;
  rules: Record<string, any>;
  status: 'draft' | 'active' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

export interface CreateLedgerInput {
  name: string;
  description?: string;
  rules: Record<string, any>;
  status?: 'draft' | 'active' | 'deprecated';
}

export interface UpdateLedgerInput {
  name?: string;
  description?: string;
  rules?: Record<string, any>;
  status?: 'draft' | 'active' | 'deprecated';
}
