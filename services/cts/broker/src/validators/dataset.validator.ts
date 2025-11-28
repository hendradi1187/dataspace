/**
 * Dataset Input Validators
 */

export async function validateCreateDataset(data: unknown) {
  // Validate required fields
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid input: expected object');
  }

  const obj = data as Record<string, unknown>;

  // Validate participantId (required)
  if (typeof obj.participantId !== 'string' || obj.participantId.trim().length === 0) {
    throw new Error('Invalid participantId: must be a non-empty string');
  }

  // Validate name (required)
  if (typeof obj.name !== 'string' || obj.name.trim().length === 0) {
    throw new Error('Invalid name: must be a non-empty string');
  }

  // Validate optional fields
  if (obj.description !== undefined && typeof obj.description !== 'string') {
    throw new Error('Invalid description: must be a string');
  }

  if (obj.schemaRef !== undefined && typeof obj.schemaRef !== 'string') {
    throw new Error('Invalid schemaRef: must be a string');
  }

  return {
    participantId: obj.participantId,
    name: obj.name,
    description: obj.description as string | undefined,
    schemaRef: obj.schemaRef as string | undefined,
  };
}

export async function validateUpdateDataset(data: unknown) {
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

  if (obj.schemaRef !== undefined && typeof obj.schemaRef !== 'string') {
    throw new Error('Invalid schemaRef: must be a string');
  }

  if (obj.status !== undefined) {
    const validStatuses = ['draft', 'published', 'archived'];
    if (typeof obj.status !== 'string' || !validStatuses.includes(obj.status)) {
      throw new Error(`Invalid status: must be one of ${validStatuses.join(', ')}`);
    }
  }

  return {
    name: obj.name as string | undefined,
    description: obj.description as string | undefined,
    schemaRef: obj.schemaRef as string | undefined,
    status: obj.status as 'draft' | 'published' | 'archived' | undefined,
  };
}
