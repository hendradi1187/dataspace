import { useState, useEffect } from 'react';
import { useListData } from '@hooks/useListData';
import { useCrudOperations } from '@hooks/useCrudOperations';
import { connectorsService } from '@/services/connectors-service';
import { DataTable } from '@components/DataTable';
import { StatusBadge } from '@components/Badge';
import { Button } from '@components/Button';
import { ConnectorForm } from '@components/ConnectorForm';
import { ConfirmDialog } from '@components/ConfirmDialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useNotificationStore } from '@stores/notification-store';
import type { Connector } from '@types';

export const Connectors = () => {
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
  } = useListData((params) => connectorsService.list(params), {
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
    entityName: 'Connector',
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
    { key: 'name' as const, label: 'Connector Name', sortable: true },
    { key: 'dataSourceType' as const, label: 'Type', sortable: true, render: (v: string) => <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">{v.replace(/_/g, ' ')}</span> },
    { key: 'url' as const, label: 'URL', sortable: false, render: (v: string) => <code className="text-xs bg-neutral-100 px-2 py-1 rounded truncate">{v}</code> },
    { key: 'status' as const, label: 'Status', sortable: true, render: (v: string) => <StatusBadge status={v} /> },
    {
      key: 'actions' as const,
      label: 'Actions',
      sortable: false,
      render: (_value: unknown, item: Connector) => (
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
          <h1 className="text-3xl font-bold text-neutral-900">Connectors</h1>
          <p className="text-neutral-600 mt-2">Manage data connectors and integrations</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreateModal}>Add Connector</Button>
      </div>
      <DataTable<Connector>
        items={data}
        columns={columns}
        title="All Connectors"
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
        onRowClick={(conn) => {
          window.location.href = `/connectors/${conn.id}`;
        }}
      />

      {/* Connector Form Modal */}
      <ConnectorForm
        isOpen={isModalOpen}
        onClose={closeModal}
        initialData={selectedItem}
        isLoading={isCrudLoading}
        onSubmit={async (data) => {
          if (selectedItem) {
            await handleUpdate(selectedItem.id, data, (id, updateData) =>
              connectorsService.update(id, updateData)
            );
          } else {
            await handleCreate(data, (createData) =>
              connectorsService.create(createData)
            );
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Connector"
        message="Are you sure you want to delete this connector? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isCrudLoading}
        onConfirm={async () => {
          if (deleteTargetId) {
            await handleDelete(deleteTargetId, (id) =>
              connectorsService.delete(id)
            );
          }
        }}
        onCancel={closeDeleteConfirm}
      />
    </div>
  );
};
