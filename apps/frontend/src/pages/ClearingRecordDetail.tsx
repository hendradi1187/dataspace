import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDetailData } from '@hooks/useDetailData';
import { clearingService } from '@/services/clearing-service';
import { Card, CardHeader, CardBody } from '@components/Card';
import { Button } from '@components/Button';
import { StatusBadge } from '@components/Badge';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useNotificationStore } from '@stores/notification-store';
import type { ClearingRecord } from '@types';

export const ClearingRecordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [formData, setFormData] = useState<Partial<ClearingRecord>>({});

  const {
    data: record,
    isLoading,
    error,
    isEditing,
    handleSave: saveRecord,
    toggleEditMode,
  } = useDetailData(
    id || '',
    (id) => clearingService.get(id),
    (id, data) => clearingService.update(id, data),
    undefined,
    {
      onSuccess: () =>
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Clearing record updated successfully',
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
    await saveRecord(formData);
    setFormData({});
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (!record) return <div className="text-center py-8"><p className="text-neutral-600">Clearing record not found</p></div>;

  // Initialize formData when record loads
  if (!formData.id && record) {
    setFormData(record);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/clearing-records')} className="inline-flex items-center gap-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"><ArrowLeft size={20} /> Back</button>
          <div><h1 className="text-3xl font-bold text-neutral-900">Clearing Record {record.id}</h1><p className="text-neutral-600 mt-1">Financial clearing details</p></div>
        </div>
        <Button onClick={toggleEditMode} icon={<Edit2 size={16} />} variant={isEditing ? 'outline' : 'primary'}>{isEditing ? 'Cancel' : 'Edit'}</Button>
      </div>

      <Card><CardHeader title="Clearing Information" />
        <CardBody>
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Contract ID</label>{isEditing ? <input type="text" value={formData.contractId || ''} onChange={(e) => setFormData({...formData, contractId: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{record.contractId}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>{isEditing ? <select value={formData.status || 'pending'} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"><option value="pending">Pending</option><option value="cleared">Cleared</option><option value="failed">Failed</option></select> : <StatusBadge status={record.status} />}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Provider ID</label>{isEditing ? <input type="text" value={formData.providerId || ''} onChange={(e) => setFormData({...formData, providerId: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{record.providerId}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Consumer ID</label>{isEditing ? <input type="text" value={formData.consumerId || ''} onChange={(e) => setFormData({...formData, consumerId: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{record.consumerId}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Amount</label>{isEditing ? <input type="number" step="0.01" value={formData.amount || 0} onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{record.amount.toFixed(2)}</p>}</div>
          </div>
          {isEditing && <div className="mt-6 flex gap-2 justify-end"><Button variant="outline" onClick={toggleEditMode}>Cancel</Button><Button onClick={handleSave}>Save</Button></div>}
        </CardBody>
      </Card>

      <Card><CardHeader title="Metadata" /><CardBody><div className="grid grid-cols-2 gap-4 text-sm"><div><label className="text-neutral-600">Created</label><p className="text-neutral-900 font-medium">{new Date(record.createdAt).toLocaleDateString()}</p></div><div><label className="text-neutral-600">Updated</label><p className="text-neutral-900 font-medium">{new Date(record.updatedAt).toLocaleDateString()}</p></div></div></CardBody></Card>
    </div>
  );
};
