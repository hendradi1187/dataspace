import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDetailData } from '@hooks/useDetailData';
import { policiesService } from '@/services/policies-service';
import { Card, CardHeader, CardBody } from '@components/Card';
import { Button } from '@components/Button';
import { StatusBadge } from '@components/Badge';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useNotificationStore } from '@stores/notification-store';
import type { Policy } from '@types';

export const PolicyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [formData, setFormData] = useState<Partial<Policy>>({});

  const {
    data: policy,
    isLoading,
    error,
    isEditing,
    handleSave: savePolicy,
    toggleEditMode,
  } = useDetailData(
    id || '',
    (id) => policiesService.get(id),
    (id, data) => policiesService.update(id, data),
    undefined,
    {
      onSuccess: () =>
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Policy updated successfully',
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
    await savePolicy(formData);
    setFormData({});
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (!policy) return <div className="text-center py-8"><p className="text-neutral-600">Policy not found</p></div>;

  // Initialize formData when policy loads
  if (!formData.id && policy) {
    setFormData(policy);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/policies')} className="inline-flex items-center gap-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"><ArrowLeft size={20} /> Back</button>
          <div><h1 className="text-3xl font-bold text-neutral-900">{policy.name}</h1><p className="text-neutral-600 mt-1">{policy.description}</p></div>
        </div>
        <Button onClick={toggleEditMode} icon={<Edit2 size={16} />} variant={isEditing ? 'outline' : 'primary'}>{isEditing ? 'Cancel' : 'Edit'}</Button>
      </div>

      <Card>
        <CardHeader title="Policy Information" />
        <CardBody>
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Policy Name</label>{isEditing ? <input type="text" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{policy.name}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Status</label><StatusBadge status={policy.status} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>{isEditing ? <textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" rows={3} /> : <p className="text-neutral-600">{policy.description}</p>}</div>
          </div>
          {isEditing && <div className="mt-6 flex gap-2 justify-end"><Button variant="outline" onClick={toggleEditMode}>Cancel</Button><Button onClick={handleSave}>Save</Button></div>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Policy Rules" />
        <CardBody>
          {policy.rules && policy.rules.length > 0 ? (
            <div className="space-y-4">
              {policy.rules.map((rule) => (
                <div key={rule.id} className="border border-neutral-200 rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-neutral-900">{rule.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${rule.effect === 'allow' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{rule.effect}</span>
                  </div>
                  <p className="text-sm text-neutral-600">Condition: <code className="bg-neutral-100 px-2 py-1 rounded text-xs">{rule.condition}</code></p>
                  <p className="text-sm text-neutral-500 mt-1">Priority: {rule.priority}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-600 text-sm">No rules defined</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Metadata" />
        <CardBody>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><label className="text-neutral-600">Created</label><p className="text-neutral-900 font-medium">{new Date(policy.createdAt).toLocaleDateString()}</p></div>
            <div><label className="text-neutral-600">Updated</label><p className="text-neutral-900 font-medium">{new Date(policy.updatedAt).toLocaleDateString()}</p></div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
