import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import type { Connector } from '@types';
import type { CreateConnectorData, UpdateConnectorData } from '@/services/connectors-service';

interface ConnectorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateConnectorData | UpdateConnectorData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Connector;
}

export const ConnectorForm = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
}: ConnectorFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    connectorType: '',
    status: 'draft' as 'draft' | 'active' | 'deprecated',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        connectorType: initialData.connectorType || '',
        status: (initialData.status as 'draft' | 'active' | 'deprecated') || 'draft',
      });
      setErrors({});
    } else {
      setFormData({
        name: '',
        description: '',
        connectorType: '',
        status: 'draft',
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Connector name is required';
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
          connectorType: formData.connectorType,
          status: formData.status,
        });
      } else {
        // Create mode
        await onSubmit({
          name: formData.name,
          description: formData.description,
          connectorType: formData.connectorType,
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
      title={initialData ? 'Edit Connector' : 'Add Connector'}
      size="lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Connector Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Connector name"
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
            placeholder="Connector description"
            disabled={isLoading}
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Connector Type Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Connector Type
          </label>
          <input
            type="text"
            name="connectorType"
            value={formData.connectorType}
            onChange={handleChange}
            placeholder="e.g., PostgreSQL, MySQL, API"
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
              <option value="active">Active</option>
              <option value="deprecated">Deprecated</option>
            </select>
          </div>
        )}
      </form>
    </Modal>
  );
};
