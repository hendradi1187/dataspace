/**
 * Credential Input Validators
 */

export async function validateCreateCredential(data: unknown) {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid input: expected object');
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.clientId !== 'string' || obj.clientId.trim().length === 0) {
    throw new Error('Invalid clientId: must be a non-empty string');
  }

  if (typeof obj.participantId !== 'string' || obj.participantId.trim().length === 0) {
    throw new Error('Invalid participantId: must be a non-empty string');
  }

  if (obj.scope !== undefined && !Array.isArray(obj.scope)) {
    throw new Error('Invalid scope: must be an array of strings');
  }

  return {
    clientId: obj.clientId,
    participantId: obj.participantId,
    scope: (obj.scope as string[]) || undefined,
  };
}

export async function validateUpdateCredential(data: unknown) {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid input: expected object');
  }

  const obj = data as Record<string, unknown>;

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
    scope: (obj.scope as string[]) || undefined,
    status: obj.status as 'active' | 'revoked' | 'expired' | undefined,
  };
}

export async function validateIssueToken(data: unknown) {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid input: expected object');
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.clientId !== 'string' || obj.clientId.trim().length === 0) {
    throw new Error('Invalid clientId: must be a non-empty string');
  }

  if (typeof obj.clientSecret !== 'string' || obj.clientSecret.trim().length === 0) {
    throw new Error('Invalid clientSecret: must be a non-empty string');
  }

  const validGrantTypes = ['client_credentials', 'refresh_token'];
  if (typeof obj.grantType !== 'string' || !validGrantTypes.includes(obj.grantType)) {
    throw new Error('Invalid grantType: must be one of client_credentials, refresh_token');
  }

  if (obj.scope !== undefined && !Array.isArray(obj.scope)) {
    throw new Error('Invalid scope: must be an array of strings');
  }

  if (obj.grantType === 'refresh_token' && !obj.refreshToken) {
    throw new Error('refreshToken is required for refresh_token grant type');
  }

  return {
    clientId: obj.clientId,
    clientSecret: obj.clientSecret,
    grantType: obj.grantType as 'client_credentials' | 'refresh_token',
    scope: (obj.scope as string[]) || undefined,
    refreshToken: obj.refreshToken as string | undefined,
  };
}
