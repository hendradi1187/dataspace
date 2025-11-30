import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDetailData } from '@hooks/useDetailData';
import { complianceService } from '@/services/compliance-service';
import { Card, CardHeader, CardBody } from '@components/Card';
import { Button } from '@components/Button';
import { StatusBadge } from '@components/Badge';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useNotificationStore } from '@stores/notification-store';
import type { ComplianceRecord } from '@types';

export const ComplianceRecordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [formData, setFormData] = useState<Partial<ComplianceRecord>>({});

  const {
    data: record,
    isLoading,
    error,
    isEditing,
    handleSave: saveRecord,
    toggleEditMode,
  } = useDetailData(
    id || '',
    (id) => complianceService.get(id),
    (id, data) => complianceService.update(id, data),
    undefined,
    {
      onSuccess: () =>
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Compliance record updated successfully',
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
  if (!record) return <div className="text-center py-8"><p className="text-neutral-600">Compliance record not found</p></div>;

  // Initialize formData when record loads
  if (!formData.id && record) {
    setFormData(record);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/compliance-records')} className="inline-flex items-center gap-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"><ArrowLeft size={20} /> Back</button>
          <div><h1 className="text-3xl font-bold text-neutral-900">Compliance Record {record.id}</h1><p className="text-neutral-600 mt-1">Audit and compliance details</p></div>
        </div>
        <Button onClick={toggleEditMode} icon={<Edit2 size={16} />} variant={isEditing ? 'outline' : 'primary'}>{isEditing ? 'Cancel' : 'Edit'}</Button>
      </div>

      <Card><CardHeader title="Compliance Information" />
        <CardBody>
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Dataset ID</label>{isEditing ? <input type="text" value={formData.datasetId || ''} onChange={(e) => setFormData({...formData, datasetId: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{record.datasetId}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Audit ID</label>{isEditing ? <input type="text" value={formData.auditId || ''} onChange={(e) => setFormData({...formData, auditId: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{record.auditId}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Risk Level</label>{isEditing ? <select value={formData.riskLevel || 'low'} onChange={(e) => setFormData({...formData, riskLevel: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select> : <StatusBadge status={record.riskLevel} />}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>{isEditing ? <select value={formData.status || 'draft'} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"><option value="draft">Draft</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select> : <StatusBadge status={record.status} />}</div>
            <div className="col-span-2"><label className="block text-sm font-medium text-neutral-700 mb-2">Findings</label>{isEditing ? <textarea value={formData.findings || ''} onChange={(e) => setFormData({...formData, findings: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" rows={4} /> : <p className="text-neutral-600">{record.findings || 'No findings recorded'}</p>}</div>
          </div>
          {isEditing && <div className="mt-6 flex gap-2 justify-end"><Button variant="outline" onClick={toggleEditMode}>Cancel</Button><Button onClick={handleSave}>Save</Button></div>}
        </CardBody>
      </Card>

      <Card><CardHeader title="Metadata" /><CardBody><div className="grid grid-cols-2 gap-4 text-sm"><div><label className="text-neutral-600">Created</label><p className="text-neutral-900 font-medium">{new Date(record.createdAt).toLocaleDateString()}</p></div><div><label className="text-neutral-600">Updated</label><p className="text-neutral-900 font-medium">{new Date(record.updatedAt).toLocaleDateString()}</p></div></div></CardBody></Card>
    </div>
  );
};
