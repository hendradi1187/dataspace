import type { CreateContractInput, UpdateContractInput } from '../types/contract.js';

export class ContractValidator {
  validateCreateInput(input: any): CreateContractInput {
    if (!input.name || typeof input.name !== 'string' || input.name.trim() === '') {
      throw new Error('Name is required and must be a non-empty string');
    }

    if (!input.rules || typeof input.rules !== 'object') {
      throw new Error('Rules are required and must be an object');
    }

    if (input.status && !['draft', 'active', 'deprecated'].includes(input.status)) {
      throw new Error('Status must be one of: draft, active, deprecated');
    }

    return {
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      rules: input.rules,
      status: input.status || 'draft',
    };
  }

  validateUpdateInput(input: any): UpdateContractInput {
    const updated: UpdateContractInput = {};

    if (input.name !== undefined) {
      if (typeof input.name !== 'string' || input.name.trim() === '') {
        throw new Error('Name must be a non-empty string');
      }
      updated.name = input.name.trim();
    }

    if (input.description !== undefined) {
      updated.description = input.description?.trim() || undefined;
    }

    if (input.rules !== undefined) {
      if (typeof input.rules !== 'object') {
        throw new Error('Rules must be an object');
      }
      updated.rules = input.rules;
    }

    if (input.status !== undefined) {
      if (!['draft', 'active', 'deprecated'].includes(input.status)) {
        throw new Error('Status must be one of: draft, active, deprecated');
      }
      updated.status = input.status;
    }

    return updated;
  }
}
