import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDetailData } from '@hooks/useDetailData';
import { appsService } from '@/services/apps-service';
import { Card, CardHeader, CardBody } from '@components/Card';
import { Button } from '@components/Button';
import { StatusBadge } from '@components/Badge';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useNotificationStore } from '@stores/notification-store';
import type { App } from '@types';

export const AppDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [formData, setFormData] = useState<Partial<App>>({});

  const {
    data: app,
    isLoading,
    error,
    isEditing,
    handleSave: saveApp,
    toggleEditMode,
  } = useDetailData(
    id || '',
    (id) => appsService.get(id),
    (id, data) => appsService.update(id, data),
    undefined,
    {
      onSuccess: () =>
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'App updated successfully',
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
    await saveApp(formData);
    setFormData({});
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (!app) return <div className="text-center py-8"><p className="text-neutral-600">App not found</p></div>;

  // Initialize formData when app loads
  if (!formData.id && app) {
    setFormData(app);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/apps')} className="inline-flex items-center gap-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"><ArrowLeft size={20} /> Back</button>
          <div><h1 className="text-3xl font-bold text-neutral-900">{app.name}</h1><p className="text-neutral-600 mt-1">{app.description}</p></div>
        </div>
        <Button onClick={toggleEditMode} icon={<Edit2 size={16} />} variant={isEditing ? 'outline' : 'primary'}>{isEditing ? 'Cancel' : 'Edit'}</Button>
      </div>

      <Card><CardHeader title="App Information" />
        <CardBody>
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Name</label>{isEditing ? <input type="text" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{app.name}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Version</label>{isEditing ? <input type="text" value={formData.version || ''} onChange={(e) => setFormData({...formData, version: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{app.version}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>{isEditing ? <select value={formData.status || 'draft'} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"><option value="draft">Draft</option><option value="published">Published</option><option value="deprecated">Deprecated</option></select> : <StatusBadge status={app.status} />}</div>
            <div className="col-span-2"><label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>{isEditing ? <textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" rows={3} /> : <p className="text-neutral-600">{app.description || 'No description'}</p>}</div>
          </div>
          {isEditing && <div className="mt-6 flex gap-2 justify-end"><Button variant="outline" onClick={toggleEditMode}>Cancel</Button><Button onClick={handleSave}>Save</Button></div>}
        </CardBody>
      </Card>

      <Card><CardHeader title="Metadata" /><CardBody><div className="grid grid-cols-2 gap-4 text-sm"><div><label className="text-neutral-600">Created</label><p className="text-neutral-900 font-medium">{new Date(app.createdAt).toLocaleDateString()}</p></div><div><label className="text-neutral-600">Updated</label><p className="text-neutral-900 font-medium">{new Date(app.updatedAt).toLocaleDateString()}</p></div></div></CardBody></Card>
    </div>
  );
};
