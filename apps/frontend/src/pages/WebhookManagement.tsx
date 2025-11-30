import { useState } from 'react';
import { Plus, Edit2, Trash2, Copy, CheckCircle, AlertCircle, Copy as CopyIcon } from 'lucide-react';
import { Button } from '@components/Button';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  headers?: Record<string, string>;
  status: 'active' | 'inactive' | 'failed';
  lastTriggered?: string;
  createdAt: string;
  secret?: string;
}

const WEBHOOK_EVENTS = [
  { value: 'participant.created', label: 'Participant Created' },
  { value: 'dataset.created', label: 'Dataset Created' },
  { value: 'dataset.updated', label: 'Dataset Updated' },
  { value: 'dataset.deleted', label: 'Dataset Deleted' },
  { value: 'policy.created', label: 'Policy Created' },
  { value: 'contract.signed', label: 'Contract Signed' },
  { value: 'transaction.completed', label: 'Transaction Completed' },
  { value: 'access.denied', label: 'Access Denied' },
  { value: 'user.created', label: 'User Created' },
  { value: 'user.deleted', label: 'User Deleted' },
];

const MOCK_WEBHOOKS: Webhook[] = [
  {
    id: 'wh-1',
    name: 'Dataset Events',
    url: 'https://api.example.com/webhooks/datasets',
    events: ['dataset.created', 'dataset.updated', 'dataset.deleted'],
    status: 'active',
    lastTriggered: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    secret: 'whsec_***********',
  },
  {
    id: 'wh-2',
    name: 'Transaction Logger',
    url: 'https://logs.example.com/webhooks/transactions',
    events: ['transaction.completed'],
    status: 'active',
    lastTriggered: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    secret: 'whsec_***********',
  },
  {
    id: 'wh-3',
    name: 'Policy Audit',
    url: 'https://audit.example.com/webhooks/policies',
    events: ['policy.created'],
    status: 'failed',
    lastTriggered: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    secret: 'whsec_***********',
  },
];

export const WebhookManagement = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>(MOCK_WEBHOOKS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Webhook>>({
    name: '',
    url: '',
    events: [],
    status: 'active',
  });

  const handleOpenModal = (webhook?: Webhook) => {
    if (webhook) {
      setEditingWebhook(webhook);
      setFormData(webhook);
    } else {
      setEditingWebhook(null);
      setFormData({ name: '', url: '', events: [], status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleSaveWebhook = () => {
    if (!formData.name || !formData.url || !formData.events || formData.events.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingWebhook) {
      setWebhooks(webhooks.map((w) => (w.id === editingWebhook.id ? { ...w, ...formData } : w)));
    } else {
      const newWebhook: Webhook = {
        ...(formData as Webhook),
        id: `wh-${Date.now()}`,
        createdAt: new Date().toISOString(),
        secret: `whsec_${Math.random().toString(36).substr(2, 9)}`,
      };
      setWebhooks([...webhooks, newWebhook]);
    }
    setIsModalOpen(false);
    setFormData({});
  };

  const handleDeleteWebhook = (id: string, name: string) => {
    if (confirm(`Delete webhook "${name}"?`)) {
      setWebhooks(webhooks.filter((w) => w.id !== id));
    }
  };

  const handleToggleEvent = (event: string) => {
    const currentEvents = formData.events || [];
    const updatedEvents = currentEvents.includes(event)
      ? currentEvents.filter((e) => e !== event)
      : [...currentEvents, event];
    setFormData({ ...formData, events: updatedEvents });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'inactive':
        return <AlertCircle size={16} className="text-yellow-600" />;
      case 'failed':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-900 border-green-300';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-900 border-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-900 border-red-300';
      default:
        return 'bg-neutral-100 text-neutral-900 border-neutral-300';
    }
  };

  const getEventColor = (eventName: string) => {
    const colors: Record<string, string> = {
      'participant.created': 'bg-blue-100 text-blue-900',
      'dataset.created': 'bg-purple-100 text-purple-900',
      'dataset.updated': 'bg-purple-100 text-purple-900',
      'dataset.deleted': 'bg-red-100 text-red-900',
      'policy.created': 'bg-indigo-100 text-indigo-900',
      'contract.signed': 'bg-green-100 text-green-900',
      'transaction.completed': 'bg-orange-100 text-orange-900',
      'access.denied': 'bg-red-100 text-red-900',
      'user.created': 'bg-blue-100 text-blue-900',
      'user.deleted': 'bg-red-100 text-red-900',
    };
    return colors[eventName] || 'bg-neutral-100 text-neutral-900';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Webhook Management</h1>
          <p className="text-neutral-600 mt-2">Configure webhooks to receive real-time events</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary-600 text-white">
          <Plus size={16} />
          Add Webhook
        </Button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How Webhooks Work</h3>
        <p className="text-sm text-blue-800">
          Webhooks allow your application to receive real-time notifications when events occur in the dataspace.
          Each webhook includes a signature header that you can verify using the webhook secret.
        </p>
      </div>

      {/* Webhooks Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  Events
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  Last Triggered
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map((webhook) => (
                <tr key={webhook.id} className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-neutral-900">{webhook.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                      {webhook.url}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap max-w-xs">
                      {webhook.events.slice(0, 2).map((event) => (
                        <span
                          key={event}
                          className={`px-2 py-1 text-xs rounded font-medium ${getEventColor(event)}`}
                        >
                          {event.split('.')[1]}
                        </span>
                      ))}
                      {webhook.events.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-neutral-200 text-neutral-700 rounded font-medium">
                          +{webhook.events.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(webhook.status)}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(webhook.status)}`}>
                        {webhook.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">
                    {webhook.lastTriggered ? new Date(webhook.lastTriggered).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(webhook)}
                        className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit webhook"
                      >
                        <Edit2 size={16} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteWebhook(webhook.id, webhook.name)}
                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete webhook"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhook Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 space-y-4 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-neutral-900">
              {editingWebhook ? 'Edit Webhook' : 'Add New Webhook'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="e.g., Dataset Events"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">URL *</label>
                <input
                  type="url"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="https://api.example.com/webhooks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Events *</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-neutral-200 rounded-lg p-3">
                  {WEBHOOK_EVENTS.map((event) => (
                    <label key={event.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.events || []).includes(event.value)}
                        onChange={() => handleToggleEvent(event.value)}
                        className="w-4 h-4 rounded border-neutral-300 text-primary-600"
                      />
                      <span className="text-sm text-neutral-700">{event.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWebhook}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                {editingWebhook ? 'Update' : 'Create'} Webhook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Testing */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Test Webhook</h3>
        <p className="text-sm text-neutral-600 mb-4">
          Send a test webhook payload to verify your endpoint is working correctly.
        </p>
        {webhooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {webhooks.map((webhook) => (
              <button
                key={webhook.id}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-lg transition-colors text-sm font-medium"
              >
                Test {webhook.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No webhooks to test</p>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Total Webhooks</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{webhooks.length}</p>
        </div>
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Active</p>
          <p className="text-3xl font-bold text-green-900 mt-2">
            {webhooks.filter((w) => w.status === 'active').length}
          </p>
        </div>
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">Failed</p>
          <p className="text-3xl font-bold text-red-900 mt-2">
            {webhooks.filter((w) => w.status === 'failed').length}
          </p>
        </div>
      </div>
    </div>
  );
};
