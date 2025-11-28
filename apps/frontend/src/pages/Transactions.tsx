import { useState, useEffect } from 'react';
import { useListData } from '@hooks/useListData';
import { transactionsService } from '@/services/transactions-service';
import { DataTable } from '@components/DataTable';
import { Button } from '@components/Button';
import { TransactionForm } from '@components/TransactionForm';
import { Download, Eye } from 'lucide-react';
import { useNotificationStore } from '@stores/notification-store';
import type { Transaction } from '@types';

export const Transactions = () => {
  const { addNotification } = useNotificationStore();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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
  } = useListData((params) => transactionsService.list(params), {
    pageSize: 10,
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

  const openViewModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedTransaction(undefined);
  };

  const columns = [
    { key: 'id' as const, label: 'Transaction ID', sortable: true, render: (v: string) => <code className="text-xs bg-neutral-100 px-2 py-1 rounded">{v}</code> },
    { key: 'action' as const, label: 'Action', sortable: true, render: (v: string) => <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">{v}</span> },
    { key: 'amount' as const, label: 'Amount', sortable: true, render: (v: number) => `${v} units` },
    { key: 'timestamp' as const, label: 'Timestamp', sortable: true, render: (v: string) => new Date(v).toLocaleString() },
    {
      key: 'actions' as const,
      label: 'Actions',
      sortable: false,
      render: (_value: any, item: Transaction) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openViewModal(item);
            }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Transactions</h1>
          <p className="text-neutral-600 mt-2">View ledger and transaction logs (read-only)</p>
        </div>
        <Button icon={<Download size={16} />} disabled>Export Ledger</Button>
      </div>
      <DataTable<Transaction>
        items={data}
        columns={columns}
        title="All Transactions"
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
        onRowClick={(tx) => {
          window.location.href = `/transactions/${tx.id}`;
        }}
      />

      {/* Transaction View Modal */}
      <TransactionForm
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        initialData={selectedTransaction}
      />
    </div>
  );
};
