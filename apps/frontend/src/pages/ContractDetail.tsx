import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDetailData } from '@hooks/useDetailData';
import { contractsService } from '@/services/contracts-service';
import { Card, CardHeader, CardBody } from '@components/Card';
import { Button } from '@components/Button';
import { StatusBadge } from '@components/Badge';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useNotificationStore } from '@stores/notification-store';
import type { Contract } from '@types';

export const ContractDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [formData, setFormData] = useState<Partial<Contract>>({});

  const {
    data: contract,
    isLoading,
    error,
    isEditing,
    handleSave: saveContract,
    toggleEditMode,
  } = useDetailData(
    id || '',
    (id) => contractsService.get(id),
    (id, data) => contractsService.update(id, data),
    undefined,
    {
      onSuccess: () =>
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Contract updated successfully',
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
    await saveContract(formData);
    setFormData({});
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (!contract) return <div className="text-center py-8"><p className="text-neutral-600">Contract not found</p></div>;

  // Initialize formData when contract loads
  if (!formData.id && contract) {
    setFormData(contract);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/contracts')} className="inline-flex items-center gap-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"><ArrowLeft size={20} /> Back</button>
          <div><h1 className="text-3xl font-bold text-neutral-900">Contract {contract.id}</h1><p className="text-neutral-600 mt-1">Data sharing agreement</p></div>
        </div>
        <Button onClick={toggleEditMode} icon={<Edit2 size={16} />} variant={isEditing ? 'outline' : 'primary'}>{isEditing ? 'Cancel' : 'Edit'}</Button>
      </div>

      <Card><CardHeader title="Contract Information" />
        <CardBody>
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Provider ID</label>{isEditing ? <input type="text" value={formData.providerId || ''} onChange={(e) => setFormData({...formData, providerId: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{contract.providerId}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Consumer ID</label>{isEditing ? <input type="text" value={formData.consumerId || ''} onChange={(e) => setFormData({...formData, consumerId: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{contract.consumerId}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Dataset ID</label>{isEditing ? <input type="text" value={formData.datasetId || ''} onChange={(e) => setFormData({...formData, datasetId: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{contract.datasetId}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Policy ID</label>{isEditing ? <input type="text" value={formData.policyId || ''} onChange={(e) => setFormData({...formData, policyId: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{contract.policyId}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>{isEditing ? <select value={formData.status || 'draft'} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"><option value="draft">Draft</option><option value="negotiating">Negotiating</option><option value="active">Active</option><option value="expired">Expired</option><option value="terminated">Terminated</option></select> : <StatusBadge status={contract.status} />}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Expires At</label>{isEditing ? <input type="date" value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().split('T')[0] : ''} onChange={(e) => setFormData({...formData, expiresAt: new Date(e.target.value).toISOString()})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{new Date(contract.expiresAt).toLocaleDateString()}</p>}</div>
            <div className="col-span-2"><label className="block text-sm font-medium text-neutral-700 mb-2">Terms</label>{isEditing ? <textarea value={formData.terms || ''} onChange={(e) => setFormData({...formData, terms: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" rows={4} /> : <p className="text-neutral-600">{contract.terms || 'No terms specified'}</p>}</div>
          </div>
          {isEditing && <div className="mt-6 flex gap-2 justify-end"><Button variant="outline" onClick={toggleEditMode}>Cancel</Button><Button onClick={handleSave}>Save</Button></div>}
        </CardBody>
      </Card>

      <Card><CardHeader title="Metadata" /><CardBody><div className="grid grid-cols-2 gap-4 text-sm"><div><label className="text-neutral-600">Created</label><p className="text-neutral-900 font-medium">{new Date(contract.createdAt).toLocaleDateString()}</p></div><div><label className="text-neutral-600">Updated</label><p className="text-neutral-900 font-medium">{new Date(contract.updatedAt).toLocaleDateString()}</p></div></div></CardBody></Card>
    </div>
  );
};
