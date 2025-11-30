import { useState, useEffect } from 'react';
import { useListData } from '@hooks/useListData';
import { useCrudOperations } from '@hooks/useCrudOperations';
import { datasetsService } from '@/services/datasets-service';
import { DataTable } from '@components/DataTable';
import { StatusBadge } from '@components/Badge';
import { Button } from '@components/Button';
import { DatasetForm } from '@components/DatasetForm';
import { ConfirmDialog } from '@components/ConfirmDialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useNotificationStore } from '@stores/notification-store';
import type { Dataset } from '@types';

export const Datasets = () => {
  const { addNotification } = useNotificationStore();

  const {
    data,
    isLoading,
    error,
    currentPage,
    currentPageSize,
    searchQuery,
    sortField,
    sortOrder,
    totalPages,
    handlePageChange,
    handleSearch,
    handlePageSizeChange,
    handleSort,
    refetch,
  } = useListData((params) => datasetsService.list(params), {
    pageSize: 10,
  });

  const {
    isLoading: isCrudLoading,
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
  } = useCrudOperations({
    entityName: 'Dataset',
    onCreateSuccess: () => refetch(),
    onUpdateSuccess: () => refetch(),
    onDeleteSuccess: () => refetch(),
  });

  // Show error notifications
  useEffect(() => {
    if (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error,
      });
    }
  }, [error, addNotification]);

  const columns = [
    { key: 'name' as const, label: 'Dataset Name', sortable: true },
    { key: 'description' as const, label: 'Description', sortable: false, render: (v: string) => <div className="max-w-xs truncate" title={v}>{v}</div> },
    { key: 'status' as const, label: 'Status', sortable: true, render: (v: string) => <StatusBadge status={v} /> },
    { key: 'createdAt' as const, label: 'Created', sortable: true, render: (v: string) => new Date(v).toLocaleDateString() },
    {
      key: 'actions' as const,
      label: 'Actions',
      sortable: false,
      render: (_value: unknown, item: Dataset) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(item);
            }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDeleteConfirm(item.id);
            }}
            className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Datasets</h1>
          <p className="text-neutral-600 mt-2">Manage data assets and catalogs</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreateModal}>Add Dataset</Button>
      </div>
      <DataTable<Dataset>
        items={data}
        columns={columns}
        title="All Datasets"
        isLoading={isLoading}
        pageSize={currentPageSize}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSort={handleSort}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        sortField={sortField}
        sortOrder={sortOrder}
        onRowClick={(ds) => {
          window.location.href = `/datasets/${ds.id}`;
        }}
      />

      {/* Dataset Form Modal */}
      <DatasetForm
        isOpen={isModalOpen}
        onClose={closeModal}
        initialData={selectedItem}
        isLoading={isCrudLoading}
        onSubmit={async (data) => {
          if (selectedItem) {
            await handleUpdate(selectedItem.id, data, (id, updateData) =>
              datasetsService.update(id, updateData)
            );
          } else {
            await handleCreate(data, (createData) =>
              datasetsService.create(createData)
            );
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Dataset"
        message="Are you sure you want to delete this dataset? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isCrudLoading}
        onConfirm={async () => {
          if (deleteTargetId) {
            await handleDelete(deleteTargetId, (id) =>
              datasetsService.delete(id)
            );
          }
        }}
        onCancel={closeDeleteConfirm}
      />
    </div>
  );
};
