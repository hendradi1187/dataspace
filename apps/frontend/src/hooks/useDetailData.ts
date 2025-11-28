/**
 * Reusable hook untuk detail pages dengan get, update, delete
 */

import { useState, useEffect, useCallback } from 'react';

export interface UseDetailDataOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useDetailData<T>(
  id: string,
  getFn: (id: string) => Promise<T>,
  updateFn?: (id: string, data: Partial<T>) => Promise<T>,
  deleteFn?: (id: string) => Promise<void>,
  options: UseDetailDataOptions = {}
) {
  const { onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getFn(id);
        setData(response);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load data';
        setError(message);
        onError?.(new Error(message));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, getFn, onError]);

  // Handle save/update
  const handleSave = useCallback(
    async (updatedData: Partial<T>) => {
      if (!id || !updateFn) return;

      setIsSaving(true);
      setError(null);

      try {
        const response = await updateFn(id, updatedData);
        setData(response);
        setIsEditing(false);
        onSuccess?.();
        return response;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to save data';
        setError(message);
        onError?.(new Error(message));
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [id, updateFn, onSuccess, onError]
  );

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!id || !deleteFn) return;

    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteFn(id);
      onSuccess?.();
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete data';
      setError(message);
      onError?.(new Error(message));
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [id, deleteFn, onSuccess, onError]);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  // Cancel edit
  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    isSaving,
    isDeleting,
    error,
    isEditing,
    handleSave,
    handleDelete,
    toggleEditMode,
    cancelEdit,
    setData,
  };
}

export default useDetailData;
