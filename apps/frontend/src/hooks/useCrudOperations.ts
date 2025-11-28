import { useState } from 'react';
import { useNotificationStore } from '@stores/notification-store';

interface UseCrudOperationsProps<T> {
  onCreateSuccess?: (item: T) => void;
  onUpdateSuccess?: (item: T) => void;
  onDeleteSuccess?: (id: string) => void;
  entityName?: string;
}

export function useCrudOperations<T extends { id: string }>({
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
  entityName = 'item',
}: UseCrudOperationsProps<T>) {
  const { addNotification } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleCreate = async (
    data: any,
    createFn: (data: any) => Promise<T>
  ) => {
    setIsLoading(true);
    try {
      const result = await createFn(data);
      addNotification({
        type: 'success',
        title: 'Success',
        message: `${entityName} created successfully`,
      });
      setIsModalOpen(false);
      onCreateSuccess?.(result);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addNotification({
        type: 'error',
        title: 'Error',
        message: `Failed to create ${entityName}: ${message}`,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (
    id: string,
    data: any,
    updateFn: (id: string, data: any) => Promise<T>
  ) => {
    setIsLoading(true);
    try {
      const result = await updateFn(id, data);
      addNotification({
        type: 'success',
        title: 'Success',
        message: `${entityName} updated successfully`,
      });
      setIsModalOpen(false);
      setSelectedItem(null);
      onUpdateSuccess?.(result);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addNotification({
        type: 'error',
        title: 'Error',
        message: `Failed to update ${entityName}: ${message}`,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (
    id: string,
    deleteFn: (id: string) => Promise<void>
  ) => {
    setIsLoading(true);
    try {
      await deleteFn(id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: `${entityName} deleted successfully`,
      });
      setIsDeleteConfirmOpen(false);
      setDeleteTargetId(null);
      onDeleteSuccess?.(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addNotification({
        type: 'error',
        title: 'Error',
        message: `Failed to delete ${entityName}: ${message}`,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: T) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteConfirmOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
    setDeleteTargetId(null);
  };

  return {
    isLoading,
    selectedItem,
    isModalOpen,
    isDeleteConfirmOpen,
    deleteTargetId,
    handleCreate,
    handleUpdate,
    handleDelete,
    openCreateModal,
    openEditModal,
    openDeleteConfirm,
    closeModal,
    closeDeleteConfirm,
  };
}
