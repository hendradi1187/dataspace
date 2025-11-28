import { randomUUID } from 'crypto';
import type { Policy, CreatePolicyInput, UpdatePolicyInput } from '../types/policy.js';

export class PolicyRepository {
  private policies: Map<string, Policy> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const mockPolicies: Policy[] = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Data Protection Policy',
        description: 'Ensures data is protected according to GDPR',
        rules: [
          {
            id: 'rule-001',
            name: 'Encrypt at Rest',
            condition: 'storage == "database"',
            effect: 'allow',
            priority: 1,
          },
          {
            id: 'rule-002',
            name: 'Encrypt in Transit',
            condition: 'transport == "network"',
            effect: 'allow',
            priority: 2,
          },
        ],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Access Control Policy',
        description: 'Controls who can access what resources',
        rules: [
          {
            id: 'rule-003',
            name: 'Admin Access Only',
            condition: 'role == "admin"',
            effect: 'allow',
            priority: 1,
          },
        ],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Audit Logging Policy',
        description: 'Requires all actions to be logged',
        rules: [
          {
            id: 'rule-004',
            name: 'Log All Changes',
            condition: 'action == "*"',
            effect: 'allow',
            priority: 1,
          },
        ],
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    mockPolicies.forEach((policy) => {
      this.policies.set(policy.id, policy);
    });
  }

  async create(input: CreatePolicyInput): Promise<Policy> {
    const policy: Policy = {
      id: randomUUID(),
      ...input,
      status: input.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.policies.set(policy.id, policy);
    return policy;
  }

  async findAll(page: number = 1, pageSize: number = 10): Promise<{ data: Policy[]; total: number }> {
    const allPolicies = Array.from(this.policies.values());
    const total = allPolicies.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = allPolicies.slice(start, end);

    return { data, total };
  }

  async findById(id: string): Promise<Policy | null> {
    return this.policies.get(id) || null;
  }

  async update(id: string, input: UpdatePolicyInput): Promise<Policy | null> {
    const policy = this.policies.get(id);
    if (!policy) return null;

    const updated: Policy = {
      ...policy,
      ...input,
      id: policy.id,
      createdAt: policy.createdAt,
      updatedAt: new Date().toISOString(),
    };

    this.policies.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.policies.delete(id);
  }
}
