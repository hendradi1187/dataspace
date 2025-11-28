import { useState } from 'react';
import {
  performBatchDelete,
  performBatchStatusUpdate,
  performBatchFieldUpdate,
  BatchResult,
  BatchOperationOptions,
} from '@utils/batch-operations';

interface UseBatchOperationsOptions {
  entityName?: string;
}

export function useBatchOperations(options: UseBatchOperationsOptions = {}) {
  const { entityName = 'items' } = options;
  const [isBusy, setIsBusy] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const deleteMultiple = async (
    ids: string[],
    deleteFunction: (id: string) => Promise<void>,
    callbacks: BatchOperationOptions = {}
  ): Promise<BatchResult> => {
    setIsBusy(true);
    setProgress({ current: 0, total: ids.length });

    try {
      const result = await performBatchDelete(ids, deleteFunction, {
        ...callbacks,
        onProgress: (current, total) => {
          setProgress({ current, total });
          callbacks.onProgress?.(current, total);
        },
      });

      return result;
    } finally {
      setIsBusy(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const updateStatus = async (
    ids: string[],
    newStatus: string,
    updateFunction: (id: string, status: string) => Promise<void>,
    callbacks: BatchOperationOptions = {}
  ): Promise<BatchResult> => {
    setIsBusy(true);
    setProgress({ current: 0, total: ids.length });

    try {
      const result = await performBatchStatusUpdate(ids, newStatus, updateFunction, {
        ...callbacks,
        onProgress: (current, total) => {
          setProgress({ current, total });
          callbacks.onProgress?.(current, total);
        },
      });

      return result;
    } finally {
      setIsBusy(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const updateFields = async (
    ids: string[],
    updates: Record<string, any>,
    updateFunction: (id: string, updates: Record<string, any>) => Promise<void>,
    callbacks: BatchOperationOptions = {}
  ): Promise<BatchResult> => {
    setIsBusy(true);
    setProgress({ current: 0, total: ids.length });

    try {
      const result = await performBatchFieldUpdate(ids, updates, updateFunction, {
        ...callbacks,
        onProgress: (current, total) => {
          setProgress({ current, total });
          callbacks.onProgress?.(current, total);
        },
      });

      return result;
    } finally {
      setIsBusy(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return {
    isBusy,
    progress,
    deleteMultiple,
    updateStatus,
    updateFields,
  };
}
