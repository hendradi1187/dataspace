/**
 * API Key Input Validators
 */

export async function validateCreateApiKey(data: unknown) {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid input: expected object');
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.name !== 'string' || obj.name.trim().length === 0) {
    throw new Error('Invalid name: must be a non-empty string');
  }

  if (typeof obj.participantId !== 'string' || obj.participantId.trim().length === 0) {
    throw new Error('Invalid participantId: must be a non-empty string');
  }

  if (obj.scope !== undefined && !Array.isArray(obj.scope)) {
    throw new Error('Invalid scope: must be an array of strings');
  }

  return {
    name: obj.name,
    participantId: obj.participantId,
    scope: (obj.scope as string[]) || undefined,
  };
}

export async function validateUpdateApiKey(data: unknown) {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid input: expected object');
  }

  const obj = data as Record<string, unknown>;

  if (obj.name !== undefined && (typeof obj.name !== 'string' || obj.name.trim().length === 0)) {
    throw new Error('Invalid name: must be a non-empty string');
  }

  if (obj.scope !== undefined && !Array.isArray(obj.scope)) {
    throw new Error('Invalid scope: must be an array of strings');
  }

  if (obj.status !== undefined) {
    const validStatuses = ['active', 'revoked', 'expired'];
    if (typeof obj.status !== 'string' || !validStatuses.includes(obj.status)) {
      throw new Error('Invalid status: must be one of active, revoked, expired');
    }
  }

  return {
    name: obj.name as string | undefined,
    scope: (obj.scope as string[]) || undefined,
    status: obj.status as 'active' | 'revoked' | 'expired' | undefined,
  };
}
