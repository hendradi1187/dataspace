import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDetailData } from '@hooks/useDetailData';
import { schemasService } from '@/services/schemas-service';
import { Card, CardHeader, CardBody } from '@components/Card';
import { Button } from '@components/Button';
import { StatusBadge } from '@components/Badge';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useNotificationStore } from '@stores/notification-store';
import type { Schema } from '@types';

export const SchemaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [formData, setFormData] = useState<Partial<Schema>>({});

  const {
    data: schema,
    isLoading,
    error,
    isEditing,
    handleSave: saveSchema,
    toggleEditMode,
  } = useDetailData(
    id || '',
    (id) => schemasService.get(id),
    (id, data) => schemasService.update(id, data),
    undefined,
    {
      onSuccess: () =>
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Schema updated',
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
    await saveSchema(formData);
    setFormData({});
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (!schema) return <div className="text-center py-8"><p className="text-neutral-600">Schema not found</p></div>;

  // Initialize formData when schema loads
  if (!formData.id && schema) {
    setFormData(schema);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/schemas')} className="inline-flex items-center gap-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"><ArrowLeft size={20} /> Back</button>
          <div><h1 className="text-3xl font-bold text-neutral-900">{schema.name}</h1><p className="text-neutral-600 mt-1">v{schema.version}</p></div>
        </div>
        <Button onClick={toggleEditMode} icon={<Edit2 size={16} />} variant={isEditing ? 'outline' : 'primary'}>{isEditing ? 'Cancel' : 'Edit'}</Button>
      </div>

      <Card><CardHeader title="Schema Information" />
        <CardBody>
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Name</label><p className="text-neutral-900">{schema.name}</p></div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Status</label><StatusBadge status={schema.status} /></div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Namespace</label><p className="text-neutral-600">{schema.namespace}</p></div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Version</label><p className="text-neutral-600">{schema.version}</p></div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Format</label><code className="bg-neutral-100 px-2 py-1 rounded text-sm">{schema.format}</code></div>
          </div>
        </CardBody>
      </Card>

      <Card><CardHeader title="Content" /><CardBody><pre className="bg-neutral-50 p-4 rounded overflow-auto text-sm">{JSON.stringify(schema.content, null, 2)}</pre></CardBody></Card>

      <Card><CardHeader title="Metadata" /><CardBody><div className="grid grid-cols-2 gap-4 text-sm"><div><label className="text-neutral-600">Created</label><p className="text-neutral-900">{new Date(schema.createdAt).toLocaleDateString()}</p></div><div><label className="text-neutral-600">Updated</label><p className="text-neutral-900">{new Date(schema.updatedAt).toLocaleDateString()}</p></div></div></CardBody></Card>
    </div>
  );
};
