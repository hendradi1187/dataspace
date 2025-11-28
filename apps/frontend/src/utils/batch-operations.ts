/**
 * Batch Operations Utilities - Bulk delete, status update, export
 */

export interface BatchOperationOptions {
  onSuccess?: (count: number) => void;
  onError?: (error: Error) => void;
  onProgress?: (current: number, total: number) => void;
}

export interface BatchResult {
  successful: number;
  failed: number;
  errors: Map<string, string>;
}

/**
 * Perform bulk delete operation with error handling and progress tracking
 */
export const performBatchDelete = async (
  ids: string[],
  deleteFunction: (id: string) => Promise<void>,
  options: BatchOperationOptions = {}
): Promise<BatchResult> => {
  const result: BatchResult = {
    successful: 0,
    failed: 0,
    errors: new Map(),
  };

  for (let i = 0; i < ids.length; i++) {
    try {
      await deleteFunction(ids[i]);
      result.successful++;
      options.onProgress?.(i + 1, ids.length);
    } catch (error) {
      result.failed++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.set(ids[i], errorMessage);
    }
  }

  if (result.successful > 0) {
    options.onSuccess?.(result.successful);
  }

  if (result.failed > 0) {
    const errorList = Array.from(result.errors.values()).join(', ');
    const error = new Error(`Failed to delete ${result.failed} items: ${errorList}`);
    options.onError?.(error);
  }

  return result;
};

/**
 * Perform bulk status update operation
 */
export const performBatchStatusUpdate = async (
  ids: string[],
  newStatus: string,
  updateFunction: (id: string, status: string) => Promise<void>,
  options: BatchOperationOptions = {}
): Promise<BatchResult> => {
  const result: BatchResult = {
    successful: 0,
    failed: 0,
    errors: new Map(),
  };

  for (let i = 0; i < ids.length; i++) {
    try {
      await updateFunction(ids[i], newStatus);
      result.successful++;
      options.onProgress?.(i + 1, ids.length);
    } catch (error) {
      result.failed++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.set(ids[i], errorMessage);
    }
  }

  if (result.successful > 0) {
    options.onSuccess?.(result.successful);
  }

  if (result.failed > 0) {
    const errorList = Array.from(result.errors.values()).join(', ');
    const error = new Error(`Failed to update ${result.failed} items: ${errorList}`);
    options.onError?.(error);
  }

  return result;
};

/**
 * Perform bulk field update operation
 */
export const performBatchFieldUpdate = async (
  ids: string[],
  fieldUpdates: Record<string, any>,
  updateFunction: (id: string, updates: Record<string, any>) => Promise<void>,
  options: BatchOperationOptions = {}
): Promise<BatchResult> => {
  const result: BatchResult = {
    successful: 0,
    failed: 0,
    errors: new Map(),
  };

  for (let i = 0; i < ids.length; i++) {
    try {
      await updateFunction(ids[i], fieldUpdates);
      result.successful++;
      options.onProgress?.(i + 1, ids.length);
    } catch (error) {
      result.failed++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.set(ids[i], errorMessage);
    }
  }

  if (result.successful > 0) {
    options.onSuccess?.(result.successful);
  }

  if (result.failed > 0) {
    const errorList = Array.from(result.errors.values()).join(', ');
    const error = new Error(`Failed to update ${result.failed} items: ${errorList}`);
    options.onError?.(error);
  }

  return result;
};

/**
 * Create a confirmation message for batch operations
 */
export const createBatchConfirmationMessage = (
  action: 'delete' | 'update' | 'export',
  count: number,
  details?: string
): string => {
  const actionText = {
    delete: 'delete',
    update: 'update',
    export: 'export',
  };

  return `Are you sure you want to ${actionText[action]} ${count} item(s)?${
    details ? ` ${details}` : ''
  }`;
};

/**
 * Check if all items in a list are selected
 */
export const areAllSelected = <T extends { id: string }>(
  items: T[],
  selectedIds: string[]
): boolean => {
  return items.length > 0 && items.every((item) => selectedIds.includes(item.id));
};

/**
 * Get items that are selected
 */
export const getSelectedItems = <T extends { id: string }>(
  items: T[],
  selectedIds: string[]
): T[] => {
  return items.filter((item) => selectedIds.includes(item.id));
};
