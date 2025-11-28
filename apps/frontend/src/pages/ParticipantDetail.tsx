import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDetailData } from '@hooks/useDetailData';
import { participantsService } from '@/services/participants-service';
import { Card, CardHeader, CardBody } from '@components/Card';
import { Button } from '@components/Button';
import { StatusBadge } from '@components/Badge';
import { ArrowLeft, Edit2, Copy, ExternalLink } from 'lucide-react';
import { useNotificationStore } from '@stores/notification-store';
import type { Participant } from '@types';

export const ParticipantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [formData, setFormData] = useState<Partial<Participant>>({});

  const {
    data: participant,
    isLoading,
    error,
    isEditing,
    handleSave: saveParticipant,
    toggleEditMode,
    cancelEdit,
  } = useDetailData(
    id || '',
    (id) => participantsService.get(id),
    (id, data) => participantsService.update(id, data),
    undefined,
    {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Participant updated successfully',
        });
      },
      onError: (err) => {
        addNotification({
          type: 'error',
          title: 'Error',
          message: err.message,
        });
      },
    }
  );

  const handleSave = async () => {
    await saveParticipant(formData);
    setFormData({});
  };

  const handleCopyDID = () => {
    if (participant?.did) {
      navigator.clipboard.writeText(participant.did);
      addNotification({ type: 'success', title: 'Copied', message: 'DID copied to clipboard' });
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (!participant) return <div className="text-center py-8"><p className="text-neutral-600">Participant not found</p></div>;

  // Initialize formData when participant loads
  if (!formData.id && participant) {
    setFormData(participant);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/participants')} className="inline-flex items-center gap-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"><ArrowLeft size={20} /> Back</button>
          <div><h1 className="text-3xl font-bold text-neutral-900">{participant.name}</h1><p className="text-neutral-600 mt-1">{participant.description}</p></div>
        </div>
        <Button onClick={toggleEditMode} icon={<Edit2 size={16} />} variant={isEditing ? 'outline' : 'primary'}>{isEditing ? 'Cancel' : 'Edit'}</Button>
      </div>

      <Card><CardHeader title="Participant Information" />
        <CardBody>
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Organization Name</label>{isEditing ? <input type="text" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{participant.name}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Status</label><StatusBadge status={participant.status} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-neutral-700 mb-2">DID</label><div className="flex items-center gap-2">{isEditing ? <input type="text" value={formData.did || ''} onChange={(e) => setFormData({...formData, did: e.target.value})} className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <><code className="flex-1 text-xs bg-neutral-100 px-3 py-2 rounded font-mono">{participant.did}</code><button onClick={handleCopyDID} className="inline-flex items-center gap-1 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition" title="Copy DID"><Copy size={16} /></button></>}</div></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>{isEditing ? <textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" rows={3} /> : <p className="text-neutral-600">{participant.description || 'No description'}</p>}</div>
          </div>
          {isEditing && <div className="mt-6 flex gap-2 justify-end"><Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></div>}
        </CardBody>
      </Card>

      <Card><CardHeader title="Associated Datasets" action={<Link to="/datasets"><Button variant="outline" size="sm">View All</Button></Link>} /><CardBody><p className="text-neutral-600 text-sm">No datasets yet.</p></CardBody></Card>

      <Card><CardHeader title="Metadata" /><CardBody><div className="grid grid-cols-2 gap-4 text-sm"><div><label className="text-neutral-600">Created</label><p className="text-neutral-900 font-medium">{new Date(participant.createdAt).toLocaleDateString()}</p></div><div><label className="text-neutral-600">Updated</label><p className="text-neutral-900 font-medium">{new Date(participant.updatedAt).toLocaleDateString()}</p></div></div></CardBody></Card>
    </div>
  );
};
