#!/usr/bin/env python3

content = '''import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '@components/Card';
import { Button } from '@components/Button';
import { StatusBadge } from '@components/Badge';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useNotificationStore } from '@stores/notification-store';
import type { Connector } from '@types/index';

export const ConnectorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [connector, setConnector] = useState<Connector | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Connector>>({});
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (id) loadConnector();
  }, [id]);

  const loadConnector = async () => {
    setIsLoading(true);
    try {
      // Mock connector data - connector service not yet implemented
      const mockConnector: Connector = {
        id: id || '1',
        name: 'Data Source Connector',
        url: 'http://example.com/api',
        dataSourceType: 'PostgreSQL',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setConnector(mockConnector);
      setFormData(mockConnector);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to load connector';
      addNotification({ type: 'error', title: 'Error', message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      // Mock update - connector service not yet implemented
      setConnector({ ...connector, ...formData } as Connector);
      setIsEditing(false);
      addNotification({ type: 'success', title: 'Success', message: 'Connector updated successfully' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to update connector';
      addNotification({ type: 'error', title: 'Error', message: msg });
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (!connector) return <div className="text-center py-8"><p className="text-neutral-600">Connector not found</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/connectors')} className="inline-flex items-center gap-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"><ArrowLeft size={20} /> Back</button>
          <div><h1 className="text-3xl font-bold text-neutral-900">{connector.name}</h1><p className="text-neutral-600 mt-1">Data source connector</p></div>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)} icon={<Edit2 size={16} />} variant={isEditing ? 'outline' : 'primary'}>{isEditing ? 'Cancel' : 'Edit'}</Button>
      </div>

      <Card><CardHeader title="Connector Information" />
        <CardBody>
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Name</label>{isEditing ? <input type="text" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{connector.name}</p>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>{isEditing ? <select value={formData.status || 'pending'} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"><option value="pending">Pending</option><option value="active">Active</option><option value="inactive">Inactive</option></select> : <StatusBadge status={connector.status} />}</div>
            <div className="col-span-2"><label className="block text-sm font-medium text-neutral-700 mb-2">URL</label>{isEditing ? <input type="text" value={formData.url || ''} onChange={(e) => setFormData({...formData, url: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <code className="text-xs bg-neutral-100 px-2 py-1 rounded">{connector.url}</code>}</div>
            <div><label className="block text-sm font-medium text-neutral-700 mb-2">Data Source Type</label>{isEditing ? <input type="text" value={formData.dataSourceType || ''} onChange={(e) => setFormData({...formData, dataSourceType: e.target.value})} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /> : <p className="text-neutral-900 font-medium">{connector.dataSourceType}</p>}</div>
          </div>
          {isEditing && <div className="mt-6 flex gap-2 justify-end"><Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></div>}
        </CardBody>
      </Card>

      <Card><CardHeader title="Metadata" /><CardBody><div className="grid grid-cols-2 gap-4 text-sm"><div><label className="text-neutral-600">Created</label><p className="text-neutral-900 font-medium">{new Date(connector.createdAt).toLocaleDateString()}</p></div><div><label className="text-neutral-600">Updated</label><p className="text-neutral-900 font-medium">{new Date(connector.updatedAt).toLocaleDateString()}</p></div></div></CardBody></Card>
    </div>
  );
};
'''

filepath = 'D:/BMAD-METHOD/dataspace/apps/frontend/src/pages/ConnectorDetail.tsx'
with open(filepath, 'w') as f:
    f.write(content)

print("Updated ConnectorDetail.tsx - Replaced connectorClient with mock data")
