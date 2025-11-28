export async function validateCreateSchema(data: unknown) {
  if (typeof data !== 'object' || data === null) throw new Error('Invalid input');
  const obj = data as Record<string, unknown>;
  if (!obj.name || !obj.namespace || !obj.version || !obj.format) {
    throw new Error('Missing required fields: name, namespace, version, format');
  }
  return obj;
}

export async function validateUpdateSchema(data: unknown) {
  if (typeof data !== 'object' || data === null) throw new Error('Invalid input');
  return data;
}
