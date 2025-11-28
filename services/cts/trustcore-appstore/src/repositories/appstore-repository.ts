import { randomUUID } from 'crypto';
import type { Appstore, CreateAppstoreInput, UpdateAppstoreInput } from '../types/appstore.js';

export class AppstoreRepository {
  private policies: Map<string, Appstore> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const mockPolicies: Appstore[] = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Data Protection Appstore',
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
        name: 'Access Control Appstore',
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
        name: 'Audit Logging Appstore',
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

    mockPolicies.forEach((appstore) => {
      this.policies.set(appstore.id, appstore);
    });
  }

  async create(input: CreateAppstoreInput): Promise<Appstore> {
    const appstore: Appstore = {
      id: randomUUID(),
      ...input,
      status: input.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.policies.set(appstore.id, appstore);
    return appstore;
  }

  async findAll(page: number = 1, pageSize: number = 10): Promise<{ data: Appstore[]; total: number }> {
    const allPolicies = Array.from(this.policies.values());
    const total = allPolicies.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = allPolicies.slice(start, end);

    return { data, total };
  }

  async findById(id: string): Promise<Appstore | null> {
    return this.policies.get(id) || null;
  }

  async update(id: string, input: UpdateAppstoreInput): Promise<Appstore | null> {
    const appstore = this.policies.get(id);
    if (!appstore) return null;

    const updated: Appstore = {
      ...appstore,
      ...input,
      id: appstore.id,
      createdAt: appstore.createdAt,
      updatedAt: new Date().toISOString(),
    };

    this.policies.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.policies.delete(id);
  }
}
