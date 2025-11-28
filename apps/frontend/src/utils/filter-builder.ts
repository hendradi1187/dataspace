/**
 * Advanced Filtering System - Filter builder, saved filters, filter persistence
 */

export type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between';
export type FilterFieldType = 'string' | 'number' | 'date' | 'boolean' | 'select';

export interface FilterField {
  name: string;
  label: string;
  type: FilterFieldType;
  operators: FilterOperator[];
  options?: Array<{ label: string; value: any }>;
}

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
  id: string; // unique id for UI purposes
}

export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  conditions: FilterCondition[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Apply filters to a dataset
 */
export const applyFilters = <T extends Record<string, any>>(
  data: T[],
  conditions: FilterCondition[]
): T[] => {
  if (conditions.length === 0) return data;

  return data.filter((item) =>
    conditions.every((condition) => evaluateCondition(item, condition))
  );
};

/**
 * Evaluate a single filter condition
 */
export const evaluateCondition = (
  item: Record<string, any>,
  condition: FilterCondition
): boolean => {
  const value = item[condition.field];

  if (value === null || value === undefined) {
    return condition.operator === 'equals' ? condition.value === null : false;
  }

  switch (condition.operator) {
    case 'equals':
      return value === condition.value;

    case 'contains':
      return String(value).toLowerCase().includes(String(condition.value).toLowerCase());

    case 'startsWith':
      return String(value).toLowerCase().startsWith(String(condition.value).toLowerCase());

    case 'endsWith':
      return String(value).toLowerCase().endsWith(String(condition.value).toLowerCase());

    case 'gt':
      return Number(value) > Number(condition.value);

    case 'lt':
      return Number(value) < Number(condition.value);

    case 'gte':
      return Number(value) >= Number(condition.value);

    case 'lte':
      return Number(value) <= Number(condition.value);

    case 'in':
      return Array.isArray(condition.value)
        ? condition.value.includes(value)
        : condition.value.split(',').includes(String(value));

    case 'between':
      if (Array.isArray(condition.value) && condition.value.length === 2) {
        const [min, max] = condition.value;
        return Number(value) >= Number(min) && Number(value) <= Number(max);
      }
      return false;

    default:
      return true;
  }
};

/**
 * Convert filter conditions to URL query string
 */
export const filterToQueryString = (conditions: FilterCondition[]): string => {
  if (conditions.length === 0) return '';

  const params = conditions.map((c) => {
    const value = Array.isArray(c.value) ? c.value.join(',') : c.value;
    return `${c.field}__${c.operator}=${encodeURIComponent(value)}`;
  });

  return params.join('&');
};

/**
 * Parse URL query string to filter conditions
 */
export const queryStringToFilter = (queryString: string): FilterCondition[] => {
  if (!queryString) return [];

  const conditions: FilterCondition[] = [];
  const params = new URLSearchParams(queryString);

  params.forEach((value, key) => {
    const [field, operator] = key.split('__');
    const decodedValue = decodeURIComponent(value);

    if (field && operator) {
      conditions.push({
        field,
        operator: operator as FilterOperator,
        value: decodedValue,
        id: Math.random().toString(36).substr(2, 9),
      });
    }
  });

  return conditions;
};

/**
 * Save filters to localStorage
 */
export const saveSavedFilters = (
  filters: SavedFilter[],
  storageKey: string = 'savedFilters'
) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(filters));
  } catch (error) {
    console.error('Failed to save filters:', error);
  }
};

/**
 * Load filters from localStorage
 */
export const loadSavedFilters = (
  storageKey: string = 'savedFilters'
): SavedFilter[] => {
  try {
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load filters:', error);
    return [];
  }
};

/**
 * Create a new saved filter
 */
export const createSavedFilter = (
  name: string,
  conditions: FilterCondition[],
  description?: string
): SavedFilter => {
  const now = new Date().toISOString();
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    description,
    conditions: conditions.map((c) => ({ ...c })), // clone
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Update an existing saved filter
 */
export const updateSavedFilter = (
  filter: SavedFilter,
  updates: Partial<SavedFilter>
): SavedFilter => {
  return {
    ...filter,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Delete a saved filter
 */
export const deleteSavedFilter = (
  filters: SavedFilter[],
  filterId: string
): SavedFilter[] => {
  return filters.filter((f) => f.id !== filterId);
};

/**
 * Generate human-readable filter description
 */
export const generateFilterDescription = (
  conditions: FilterCondition[],
  fields: FilterField[]
): string => {
  if (conditions.length === 0) return 'No filters';

  const descriptions = conditions.map((condition) => {
    const field = fields.find((f) => f.name === condition.field);
    const fieldLabel = field?.label || condition.field;

    return `${fieldLabel} ${condition.operator} ${condition.value}`;
  });

  return descriptions.join(' AND ');
};
