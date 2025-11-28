import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDetailData } from '@hooks/useDetailData';
import { datasetsService } from '@/services/datasets-service';
import { Card, CardHeader, CardBody } from '@components/Card';
import { Button } from '@components/Button';
import { StatusBadge } from '@components/Badge';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useNotificationStore } from '@stores/notification-store';
import type { Dataset } from '@types';

export const DatasetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [formData, setFormData] = useState<Partial<Dataset>>({});

  const {
    data: dataset,
    isLoading,
    error,
    isEditing,
    handleSave: saveDataset,
    toggleEditMode,
  } = useDetailData(
    id || '',
    (id) => datasetsService.get(id),
    (id, data) => datasetsService.update(id, data),
    undefined,
    {
      onSuccess: () =>
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Dataset updated successfully',
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
    await saveDataset(formData);
    setFormData({});
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (!dataset) return <div className="text-center py-8"><p className="text-neutral-600">Dataset not found</p></div>;

  // Initialize formData when dataset loads
  if (!formData.id && dataset) {
    setFormData(dataset);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/datasets')} className="inline-flex items-center gap-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"><ArrowLeft size={20} /> Back</button>
          <div><h1 className="text-3xl font-bold text-neutral-900">{dataset.name}</h1><p className="text-neutral-600 mt-1">{dataset.description}</p></div>
        </div>
        <Button onClick={toggleEditMode} icon={<Edit2 size={16} />} variant={isEditing ? 'outline' : 'primary'}>{isEditing ? 'Cancel' : 'Edit'}</Button>
      </div>

      <Card><CardHeader title="Dataset Information" />
        <CardBody>
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Name</label>{isEditing ? <input type="text" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{dataset.name}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Status</label><StatusBadge status={dataset.status} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>{isEditing ? <textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" rows={3} /> : <p className="text-neutral-600">{dataset.description || 'No description'}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Schema Reference</label>{isEditing ? <input type="text" value={formData.schemaRef || ''} onChange={(e) => setFormData({...formData, schemaRef: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <code className="text-xs bg-neutral-100 px-2 py-1 rounded">{dataset.schemaRef || 'Not set'}</code>}</div>
          </div>
          {isEditing && <div className="mt-6 flex gap-2 justify-end"><Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></div>}
        </CardBody>
      </Card>

      <Card><CardHeader title="Metadata" /><CardBody><div className="grid grid-cols-2 gap-4 text-sm"><div><label className="text-neutral-600">Created</label><p className="text-neutral-900 font-medium">{new Date(dataset.createdAt).toLocaleDateString()}</p></div><div><label className="text-neutral-600">Updated</label><p className="text-neutral-900 font-medium">{new Date(dataset.updatedAt).toLocaleDateString()}</p></div></div></CardBody></Card>
    </div>
  );
};
