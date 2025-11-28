/**
 * Participant Input Validators
 */

export async function validateCreateParticipant(data: unknown) {
  // Validate required fields
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid input: expected object');
  }

  const obj = data as Record<string, unknown>;

  // Validate DID (required)
  if (typeof obj.did !== 'string' || !obj.did.startsWith('did:')) {
    throw new Error('Invalid DID: must be a valid decentralized identifier');
  }

  // Validate name (required)
  if (typeof obj.name !== 'string' || obj.name.trim().length === 0) {
    throw new Error('Invalid name: must be a non-empty string');
  }

  // Validate optional fields
  if (obj.description !== undefined && typeof obj.description !== 'string') {
    throw new Error('Invalid description: must be a string');
  }

  if (obj.endpointUrl !== undefined && typeof obj.endpointUrl !== 'string') {
    throw new Error('Invalid endpointUrl: must be a string');
  }

  if (obj.publicKey !== undefined && typeof obj.publicKey !== 'string') {
    throw new Error('Invalid publicKey: must be a string');
  }

  return {
    did: obj.did,
    name: obj.name,
    description: obj.description as string | undefined,
    endpointUrl: obj.endpointUrl as string | undefined,
    publicKey: obj.publicKey as string | undefined,
  };
}

export async function validateUpdateParticipant(data: unknown) {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid input: expected object');
  }

  const obj = data as Record<string, unknown>;

  // All fields are optional for updates
  if (obj.name !== undefined && (typeof obj.name !== 'string' || obj.name.trim().length === 0)) {
    throw new Error('Invalid name: must be a non-empty string');
  }

  if (obj.description !== undefined && typeof obj.description !== 'string') {
    throw new Error('Invalid description: must be a string');
  }

  if (obj.endpointUrl !== undefined && typeof obj.endpointUrl !== 'string') {
    throw new Error('Invalid endpointUrl: must be a string');
  }

  if (obj.publicKey !== undefined && typeof obj.publicKey !== 'string') {
    throw new Error('Invalid publicKey: must be a string');
  }

  if (obj.status !== undefined) {
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (typeof obj.status !== 'string' || !validStatuses.includes(obj.status)) {
      throw new Error(`Invalid status: must be one of ${validStatuses.join(', ')}`);
    }
  }

  return {
    name: obj.name as string | undefined,
    description: obj.description as string | undefined,
    endpointUrl: obj.endpointUrl as string | undefined,
    publicKey: obj.publicKey as string | undefined,
    status: obj.status as 'active' | 'inactive' | 'suspended' | undefined,
  };
}
