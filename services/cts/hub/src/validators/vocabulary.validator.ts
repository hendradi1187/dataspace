export async function validateCreateVocabulary(data: unknown) {
  if (typeof data !== 'object' || data === null) throw new Error('Invalid input');
  const obj = data as Record<string, unknown>;
  if (!obj.name || !obj.namespace || !obj.version || !obj.terms) {
    throw new Error('Missing required fields: name, namespace, version, terms');
  }
  return obj;
}

export async function validateUpdateVocabulary(data: unknown) {
  if (typeof data !== 'object' || data === null) throw new Error('Invalid input');
  return data;
}
