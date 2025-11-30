import { useState, useEffect } from 'react';
import { useListData } from '@hooks/useListData';
import { useCrudOperations } from '@hooks/useCrudOperations';
import { appsService } from '@/services/apps-service';
import { DataTable } from '@components/DataTable';
import { StatusBadge } from '@components/Badge';
import { Button } from '@components/Button';
import { AppForm } from '@components/AppForm';
import { ConfirmDialog } from '@components/ConfirmDialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useNotificationStore } from '@stores/notification-store';
import type { App } from '@types';

export const Apps = () => {
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
  } = useListData((params) => appsService.list(params), {
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
    entityName: 'App',
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
    { key: 'name' as const, label: 'App Name', sortable: true },
    { key: 'description' as const, label: 'Description', sortable: false, render: (v: string) => <div className="max-w-xs truncate">{v}</div> },
    { key: 'version' as const, label: 'Version', sortable: true },
    { key: 'status' as const, label: 'Status', sortable: true, render: (v: string) => <StatusBadge status={v} /> },
    {
      key: 'actions' as const,
      label: 'Actions',
      sortable: false,
      render: (_value: unknown, item: App) => (
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
          <h1 className="text-3xl font-bold text-neutral-900">Apps</h1>
          <p className="text-neutral-600 mt-2">Manage connector apps and plugins</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreateModal}>Upload App</Button>
      </div>
      <DataTable<App>
        items={data}
        columns={columns}
        title="All Apps"
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
        onRowClick={(app) => {
          window.location.href = `/apps/${app.id}`;
        }}
      />

      {/* App Form Modal */}
      <AppForm
        isOpen={isModalOpen}
        onClose={closeModal}
        initialData={selectedItem}
        isLoading={isCrudLoading}
        onSubmit={async (data) => {
          if (selectedItem) {
            await handleUpdate(selectedItem.id, data, (id, updateData) =>
              appsService.update(id, updateData)
            );
          } else {
            await handleCreate(data, (createData) =>
              appsService.create(createData)
            );
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete App"
        message="Are you sure you want to delete this app? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isCrudLoading}
        onConfirm={async () => {
          if (deleteTargetId) {
            await handleDelete(deleteTargetId, (id) =>
              appsService.delete(id)
            );
          }
        }}
        onCancel={closeDeleteConfirm}
      />
    </div>
  );
};
