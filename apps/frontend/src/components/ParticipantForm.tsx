import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import type { Participant } from '@types';
import type { CreateParticipantData, UpdateParticipantData } from '@/services/participants-service';

interface ParticipantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateParticipantData | UpdateParticipantData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Participant;
}

export const ParticipantForm = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
}: ParticipantFormProps) => {
  const [formData, setFormData] = useState({
    did: '',
    name: '',
    description: '',
    endpointUrl: '',
    publicKey: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        did: initialData.did || '',
        name: initialData.name || '',
        description: initialData.description || '',
        endpointUrl: initialData.endpointUrl || '',
        publicKey: initialData.publicKey || '',
        status: (initialData.status as 'active' | 'inactive' | 'suspended') || 'active',
      });
      setErrors({});
    } else {
      setFormData({
        did: '',
        name: '',
        description: '',
        endpointUrl: '',
        publicKey: '',
        status: 'active',
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    }

    if (!initialData && !formData.did.trim()) {
      newErrors.did = 'DID is required';
    }

    if (formData.did && !formData.did.startsWith('did:')) {
      newErrors.did = 'DID must start with "did:"';
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
        // Update mode - exclude DID and ID from submission
        await onSubmit({
          name: formData.name,
          description: formData.description,
          endpointUrl: formData.endpointUrl,
          publicKey: formData.publicKey,
          status: formData.status,
        });
      } else {
        // Create mode - include DID
        await onSubmit({
          did: formData.did,
          name: formData.name,
          description: formData.description,
          endpointUrl: formData.endpointUrl,
          publicKey: formData.publicKey,
        });
      }
      onClose();
    } catch (error) {
      // Error handling is done by the useCrudOperations hook
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
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const footer = (
    <div className="flex gap-3">
      <Button onClick={onClose} variant="outline" disabled={isLoading}>
        Cancel
      </Button>
      <Button onClick={handleSubmit} variant="primary" disabled={isLoading}>
        {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Participant' : 'Add Participant'}
      size="md"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* DID Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            DID {!initialData && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name="did"
            value={formData.did}
            onChange={handleChange}
            placeholder="did:example:participant1"
            disabled={isLoading || !!initialData}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.did
                ? 'border-red-500 focus:ring-red-500'
                : 'border-neutral-300'
            } ${initialData ? 'bg-neutral-50 text-neutral-500 cursor-not-allowed' : ''}`}
          />
          {errors.did && <p className="text-red-500 text-xs mt-1">{errors.did}</p>}
          {initialData && (
            <p className="text-neutral-500 text-xs mt-1">
              DID cannot be changed after creation
            </p>
          )}
        </div>

        {/* Organization Name Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Organization Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Organization Name"
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
            placeholder="Brief description of the organization"
            disabled={isLoading}
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Endpoint URL Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Endpoint URL
          </label>
          <input
            type="url"
            name="endpointUrl"
            value={formData.endpointUrl}
            onChange={handleChange}
            placeholder="https://example.com"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Public Key Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Public Key
          </label>
          <textarea
            name="publicKey"
            value={formData.publicKey}
            onChange={handleChange}
            placeholder="Public key for the participant"
            disabled={isLoading}
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        )}
      </form>
    </Modal>
  );
};
