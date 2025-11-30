import Ajv, { JSONSchemaType, ValidateFunction, ErrorObject } from 'ajv';

// Initialize AJV validator
const ajv = new Ajv({
  useDefaults: true,
  coerceTypes: true,
  removeAdditional: 'all',
});

export { ajv };

/**
 * Validate data against a JSON Schema
 * @param schema JSON Schema object
 * @param data Data to validate
 * @returns boolean indicating if data is valid
 */
export const validate = (schema: JSONSchemaType<unknown>, data: unknown): boolean => {
  const validator = ajv.compile(schema);
  return validator(data);
};

/**
 * Validate data and get errors
 * @param schema JSON Schema object
 * @param data Data to validate
 * @returns validation errors or null if valid
 */
export const validateWithErrors = (schema: JSONSchemaType<unknown>, data: unknown): ErrorObject[] | null => {
  const validator = ajv.compile(schema);
  const valid = validator(data);
  return valid ? null : (validator.errors || []);
};
