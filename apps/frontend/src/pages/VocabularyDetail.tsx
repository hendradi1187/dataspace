import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDetailData } from '@hooks/useDetailData';
import { vocabulariesService } from '@/services/vocabularies-service';
import { Card, CardHeader, CardBody } from '@components/Card';
import { Button } from '@components/Button';
import { StatusBadge } from '@components/Badge';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useNotificationStore } from '@stores/notification-store';
import type { Vocabulary } from '@types';

export const VocabularyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [formData, setFormData] = useState<Partial<Vocabulary>>({});

  const {
    data: vocab,
    isLoading,
    error,
    isEditing,
    handleSave: saveVocab,
    toggleEditMode,
  } = useDetailData(
    id || '',
    (id) => vocabulariesService.get(id),
    (id, data) => vocabulariesService.update(id, data),
    undefined,
    {
      onSuccess: () =>
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Vocabulary updated',
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
    await saveVocab(formData);
    setFormData({});
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (!vocab) return <div className="text-center py-8"><p className="text-neutral-600">Vocabulary not found</p></div>;

  // Initialize formData when vocab loads
  if (!formData.id && vocab) {
    setFormData(vocab);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/vocabularies')} className="inline-flex items-center gap-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"><ArrowLeft size={20} /> Back</button>
          <div><h1 className="text-3xl font-bold text-neutral-900">{vocab.name}</h1><p className="text-neutral-600 mt-1">v{vocab.version}</p></div>
        </div>
        <Button onClick={toggleEditMode} icon={<Edit2 size={16} />} variant={isEditing ? 'outline' : 'primary'}>{isEditing ? 'Cancel' : 'Edit'}</Button>
      </div>

      <Card><CardHeader title="Vocabulary Information" />
        <CardBody>
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Name</label><p className="text-neutral-900">{vocab.name}</p></div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Status</label><StatusBadge status={vocab.status} /></div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Namespace</label><p className="text-neutral-600">{vocab.namespace}</p></div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Version</label><p className="text-neutral-600">{vocab.version}</p></div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Format</label><code className="bg-neutral-100 px-2 py-1 rounded text-sm">{vocab.format}</code></div>
          </div>
        </CardBody>
      </Card>

      <Card><CardHeader title="Terms" /><CardBody><div className="flex flex-wrap gap-2">{vocab.terms.map((t, i) => <span key={i} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">{t}</span>)}</div></CardBody></Card>

      <Card><CardHeader title="Metadata" /><CardBody><div className="grid grid-cols-2 gap-4 text-sm"><div><label className="text-neutral-600">Created</label><p className="text-neutral-900">{new Date(vocab.createdAt).toLocaleDateString()}</p></div><div><label className="text-neutral-600">Updated</label><p className="text-neutral-900">{new Date(vocab.updatedAt).toLocaleDateString()}</p></div></div></CardBody></Card>
    </div>
  );
};
