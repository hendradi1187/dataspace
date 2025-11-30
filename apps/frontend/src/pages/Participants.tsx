import { useState, useEffect } from 'react';
import { useListData } from '@hooks/useListData';
import { useExport } from '@hooks/useExport';
import { useCrudOperations } from '@hooks/useCrudOperations';
import { participantsService } from '@/services/participants-service';
import { DataTable } from '@components/DataTable';
import { StatusBadge } from '@components/Badge';
import { Button } from '@components/Button';
import { ExportButton } from '@components/ExportButton';
import { SkeletonLoader } from '@components/SkeletonLoader';
import { ParticipantForm } from '@components/ParticipantForm';
import { ConfirmDialog } from '@components/ConfirmDialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useNotificationStore } from '@stores/notification-store';
import type { Participant } from '@types';

export const Participants = () => {
  const { addNotification } = useNotificationStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
  } = useListData((params) => participantsService.list(params), {
    pageSize: 10,
  });

  const { exportAll, exportSelected } = useExport({
    entityName: 'participants',
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
    entityName: 'Participant',
    onCreateSuccess: () => refetch(),
    onUpdateSuccess: () => refetch(),
    onDeleteSuccess: () => refetch(),
  });

  // Show error notifications (only once when error changes)
  useEffect(() => {
    if (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error,
      });
    }
  }, [error, addNotification]); // Only trigger when error changes

  const handleExportCSV = () => {
    if (selectedIds.length > 0) {
      exportSelected(data, selectedIds, 'csv');
    } else {
      exportAll(data, 'csv');
    }
    addNotification({
      type: 'success',
      title: 'Export Successful',
      message: 'Participants exported as CSV',
    });
  };

  const handleExportJSON = () => {
    if (selectedIds.length > 0) {
      exportSelected(data, selectedIds, 'json');
    } else {
      exportAll(data, 'json');
    }
    addNotification({
      type: 'success',
      title: 'Export Successful',
      message: 'Participants exported as JSON',
    });
  };

  const columns = [
    {
      key: 'name' as const,
      label: 'Organization Name',
      sortable: true,
    },
    {
      key: 'did' as const,
      label: 'DID',
      sortable: false,
      render: (value: string) => (
        <code className="text-xs bg-neutral-100 px-2 py-1 rounded">{value}</code>
      ),
    },
    {
      key: 'description' as const,
      label: 'Description',
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
      key: 'actions' as const,
      label: 'Actions',
      sortable: false,
      render: (_value: unknown, item: Participant) => (
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
          <h1 className="text-3xl font-bold text-neutral-900">Participants</h1>
          <p className="text-neutral-600 mt-2">Manage organizations and participants</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
            selectedCount={selectedIds.length}
          />
          <Button icon={<Plus size={16} />} onClick={openCreateModal}>Add Participant</Button>
        </div>
      </div>

      {isLoading ? (
        <SkeletonLoader type="table" count={10} />
      ) : (
        <DataTable<Participant>
          items={data}
          columns={columns}
          title="All Participants"
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
          onRowClick={(participant) => {
            window.location.href = `/participants/${participant.id}`;
          }}
          onSelectionChange={setSelectedIds}
        />
      )}

      {/* Participant Form Modal */}
      <ParticipantForm
        isOpen={isModalOpen}
        onClose={closeModal}
        initialData={selectedItem}
        isLoading={isCrudLoading}
        onSubmit={async (data) => {
          if (selectedItem) {
            await handleUpdate(selectedItem.id, data, (id, updateData) =>
              participantsService.update(id, updateData)
            );
          } else {
            await handleCreate(data, (createData) =>
              participantsService.create(createData)
            );
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Participant"
        message="Are you sure you want to delete this participant? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isCrudLoading}
        onConfirm={async () => {
          if (deleteTargetId) {
            await handleDelete(deleteTargetId, (id) =>
              participantsService.delete(id)
            );
          }
        }}
        onCancel={closeDeleteConfirm}
      />
    </div>
  );
};
