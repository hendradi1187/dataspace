import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDetailData } from '@hooks/useDetailData';
import { transactionsService } from '@/services/transactions-service';
import { Card, CardHeader, CardBody } from '@components/Card';
import { Button } from '@components/Button';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useNotificationStore } from '@stores/notification-store';
import type { Transaction } from '@types';

export const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [formData, setFormData] = useState<Partial<Transaction>>({});

  const {
    data: transaction,
    isLoading,
    error,
    isEditing,
    handleSave: saveTransaction,
    toggleEditMode,
  } = useDetailData(
    id || '',
    (id) => transactionsService.get(id),
    (id, data) => transactionsService.update(id, data),
    undefined,
    {
      onSuccess: () =>
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Transaction updated successfully',
        }),
      onError: (err) =>
        addNotification({
          type: 'error',
          title: 'Error',
          message: err.message,
        }),
    }
  );

  const handleSave = async () => {
    await saveTransaction(formData);
    setFormData({});
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (!transaction) return <div className="text-center py-8"><p className="text-neutral-600">Transaction not found</p></div>;

  // Initialize formData when transaction loads
  if (!formData.id && transaction) {
    setFormData(transaction);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/transactions')} className="inline-flex items-center gap-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"><ArrowLeft size={20} /> Back</button>
          <div><h1 className="text-3xl font-bold text-neutral-900">Transaction {transaction.id}</h1><p className="text-neutral-600 mt-1">Ledger transaction details</p></div>
        </div>
        <Button onClick={toggleEditMode} icon={<Edit2 size={16} />} variant={isEditing ? 'outline' : 'primary'}>{isEditing ? 'Cancel' : 'Edit'}</Button>
      </div>

      <Card><CardHeader title="Transaction Information" />
        <CardBody>
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Dataset ID</label>{isEditing ? <input type="text" value={formData.datasetId || ''} onChange={(e) => setFormData({...formData, datasetId: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{transaction.datasetId}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Participant ID</label>{isEditing ? <input type="text" value={formData.participantId || ''} onChange={(e) => setFormData({...formData, participantId: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{transaction.participantId}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Action</label>{isEditing ? <input type="text" value={formData.action || ''} onChange={(e) => setFormData({...formData, action: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{transaction.action}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Amount</label>{isEditing ? <input type="number" step="0.01" value={formData.amount || 0} onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{transaction.amount.toFixed(2)}</p>}</div>
            <div className="col-span-2"><label className="block text-sm font-medium text-neutral-700 mb-2">Timestamp</label><p className="text-neutral-900 font-medium">{new Date(transaction.timestamp).toLocaleString()}</p></div>
          </div>
          {isEditing && <div className="mt-6 flex gap-2 justify-end"><Button variant="outline" onClick={toggleEditMode}>Cancel</Button><Button onClick={handleSave}>Save</Button></div>}
        </CardBody>
      </Card>

      <Card><CardHeader title="Metadata" /><CardBody><div className="grid grid-cols-2 gap-4 text-sm"><div><label className="text-neutral-600">Created</label><p className="text-neutral-900 font-medium">{new Date(transaction.createdAt).toLocaleDateString()}</p></div><div><label className="text-neutral-600">Updated</label><p className="text-neutral-900 font-medium">{new Date(transaction.updatedAt).toLocaleDateString()}</p></div></div></CardBody></Card>
    </div>
  );
};
