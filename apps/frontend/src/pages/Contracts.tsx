import { useState, useEffect } from 'react';
import { useListData } from '@hooks/useListData';
import { useCrudOperations } from '@hooks/useCrudOperations';
import { contractsService } from '@/services/contracts-service';
import { DataTable } from '@components/DataTable';
import { StatusBadge } from '@components/Badge';
import { Button } from '@components/Button';
import { ContractForm } from '@components/ContractForm';
import { ConfirmDialog } from '@components/ConfirmDialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useNotificationStore } from '@stores/notification-store';
import type { Contract } from '@types';

export const Contracts = () => {
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
  } = useListData((params) => contractsService.list(params), {
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
    entityName: 'Contract',
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
    {
      key: 'id' as const,
      label: 'Contract ID',
      sortable: true,
      render: (value: string) => (
        <code className="text-xs bg-neutral-100 px-2 py-1 rounded">{value}</code>
      ),
    },
    {
      key: 'terms' as const,
      label: 'Terms',
      sortable: false,
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: 'expiresAt' as const,
      label: 'Expires',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions' as const,
      label: 'Actions',
      sortable: false,
      render: (_value: unknown, item: Contract) => (
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
          <h1 className="text-3xl font-bold text-neutral-900">Contracts</h1>
          <p className="text-neutral-600 mt-2">Manage data sharing contracts</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreateModal}>Create Contract</Button>
      </div>

      <DataTable<Contract>
        items={data}
        columns={columns}
        title="All Contracts"
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
        onRowClick={(contract) => {
          window.location.href = `/contracts/${contract.id}`;
        }}
      />

      {/* Contract Form Modal */}
      <ContractForm
        isOpen={isModalOpen}
        onClose={closeModal}
        initialData={selectedItem}
        isLoading={isCrudLoading}
        onSubmit={async (data) => {
          if (selectedItem) {
            await handleUpdate(selectedItem.id, data, (id, updateData) =>
              contractsService.update(id, updateData)
            );
          } else {
            await handleCreate(data, (createData) =>
              contractsService.create(createData)
            );
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Contract"
        message="Are you sure you want to delete this contract? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isCrudLoading}
        onConfirm={async () => {
          if (deleteTargetId) {
            await handleDelete(deleteTargetId, (id) =>
              contractsService.delete(id)
            );
          }
        }}
        onCancel={closeDeleteConfirm}
      />
    </div>
  );
};
