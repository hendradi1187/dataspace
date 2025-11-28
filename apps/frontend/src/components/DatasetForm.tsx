import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import { participantsService } from '@/services/participants-service';
import type { Dataset, Participant } from '@types';
import type { CreateDatasetData, UpdateDatasetData } from '@/services/datasets-service';

interface DatasetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDatasetData | UpdateDatasetData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Dataset;
}

export const DatasetForm = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
}: DatasetFormProps) => {
  const [formData, setFormData] = useState({
    participantId: '',
    name: '',
    description: '',
    schemaRef: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
  });

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && !initialData) {
      // Load participants when modal opens for creation
      const loadParticipants = async () => {
        try {
          setLoadingParticipants(true);
          const response = await participantsService.list({ pageSize: 100 });
          setParticipants(response.data);
        } catch (error) {
          console.error('Failed to load participants:', error);
        } finally {
          setLoadingParticipants(false);
        }
      };
      loadParticipants();
    }

    if (initialData) {
      setFormData({
        participantId: initialData.participantId || '',
        name: initialData.name || '',
        description: initialData.description || '',
        schemaRef: initialData.schemaRef || '',
        status: (initialData.status as 'draft' | 'published' | 'archived') || 'draft',
      });
      setErrors({});
    } else {
      setFormData({
        participantId: '',
        name: '',
        description: '',
        schemaRef: '',
        status: 'draft',
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Dataset name is required';
    }

    if (!initialData && !formData.participantId) {
      newErrors.participantId = 'Participant is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (initialData) {
        // Update mode
        await onSubmit({
          name: formData.name,
          description: formData.description,
          schemaRef: formData.schemaRef,
          status: formData.status,
        });
      } else {
        // Create mode
        await onSubmit({
          participantId: formData.participantId,
          name: formData.name,
          description: formData.description,
          schemaRef: formData.schemaRef,
        });
      }
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const footer = (
    <div className="flex gap-3">
      <Button onClick={onClose} variant="outline" disabled={isLoading || loadingParticipants}>
        Cancel
      </Button>
      <Button onClick={handleSubmit} variant="primary" disabled={isLoading || loadingParticipants}>
        {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Dataset' : 'Add Dataset'}
      size="md"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Participant Selector */}
        {!initialData && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Participant <span className="text-red-500">*</span>
            </label>
            <select
              name="participantId"
              value={formData.participantId}
              onChange={handleChange}
              disabled={isLoading || loadingParticipants}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.participantId
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-neutral-300'
              }`}
            >
              <option value="">
                {loadingParticipants ? 'Loading participants...' : 'Select a participant'}
              </option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.participantId && (
              <p className="text-red-500 text-xs mt-1">{errors.participantId}</p>
            )}
          </div>
        )}

        {/* Dataset Name Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Dataset Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Dataset name"
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name
                ? 'border-red-500 focus:ring-red-500'
                : 'border-neutral-300'
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Dataset description"
            disabled={isLoading}
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Schema Reference Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Schema Reference
          </label>
          <input
            type="text"
            name="schemaRef"
            value={formData.schemaRef}
            onChange={handleChange}
            placeholder="Schema reference ID or URL"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Field */}
        {initialData && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        )}
      </form>
    </Modal>
  );
};
