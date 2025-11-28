import type { CreateComplianceInput, UpdateComplianceInput } from '../types/compliance.js';

export class ComplianceValidator {
  validateCreateInput(input: any): CreateComplianceInput {
    if (!input.name || typeof input.name !== 'string' || input.name.trim() === '') {
      throw new Error('Compliance name is required and must be a non-empty string');
    }

    if (!input.description || typeof input.description !== 'string' || input.description.trim() === '') {
      throw new Error('Compliance description is required and must be a non-empty string');
    }

    if (!Array.isArray(input.rules) || input.rules.length === 0) {
      throw new Error('Compliance must have at least one rule');
    }

    // Validate each rule
    input.rules.forEach((rule: any, index: number) => {
      if (!rule.name || typeof rule.name !== 'string') {
        throw new Error(`Rule ${index} must have a name`);
      }
      if (!rule.condition || typeof rule.condition !== 'string') {
        throw new Error(`Rule ${index} must have a condition`);
      }
      if (!['allow', 'deny'].includes(rule.effect)) {
        throw new Error(`Rule ${index} effect must be either 'allow' or 'deny'`);
      }
      if (typeof rule.priority !== 'number' || rule.priority < 1) {
        throw new Error(`Rule ${index} priority must be a positive number`);
      }
    });

    if (input.status && !['draft', 'active', 'deprecated'].includes(input.status)) {
      throw new Error('Status must be one of: draft, active, deprecated');
    }

    return {
      name: input.name.trim(),
      description: input.description.trim(),
      rules: input.rules,
      status: input.status || 'draft',
    };
  }

  validateUpdateInput(input: any): UpdateComplianceInput {
    const updated: UpdateComplianceInput = {};

    if (input.name !== undefined) {
      if (typeof input.name !== 'string' || input.name.trim() === '') {
        throw new Error('Compliance name must be a non-empty string');
      }
      updated.name = input.name.trim();
    }

    if (input.description !== undefined) {
      if (typeof input.description !== 'string' || input.description.trim() === '') {
        throw new Error('Compliance description must be a non-empty string');
      }
      updated.description = input.description.trim();
    }

    if (input.rules !== undefined) {
      if (!Array.isArray(input.rules) || input.rules.length === 0) {
        throw new Error('Compliance must have at least one rule');
      }
      input.rules.forEach((rule: any, index: number) => {
        if (!rule.name || typeof rule.name !== 'string') {
          throw new Error(`Rule ${index} must have a name`);
        }
        if (!rule.condition || typeof rule.condition !== 'string') {
          throw new Error(`Rule ${index} must have a condition`);
        }
        if (!['allow', 'deny'].includes(rule.effect)) {
          throw new Error(`Rule ${index} effect must be either 'allow' or 'deny'`);
        }
        if (typeof rule.priority !== 'number' || rule.priority < 1) {
          throw new Error(`Rule ${index} priority must be a positive number`);
        }
      });
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
