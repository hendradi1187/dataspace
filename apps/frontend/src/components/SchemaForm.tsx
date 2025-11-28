import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import type { Schema } from '@types';
import type { CreateSchemaData, UpdateSchemaData } from '@/services/schemas-service';

interface SchemaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSchemaData | UpdateSchemaData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Schema;
}

export const SchemaForm = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
}: SchemaFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    namespace: '',
    version: '',
    format: 'json-schema' as 'json-schema' | 'shacl' | 'jsonld',
    content: '{}',
    status: 'draft' as 'draft' | 'published' | 'deprecated',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contentError, setContentError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        namespace: initialData.namespace || '',
        version: initialData.version || '',
        format: (initialData.format as 'json-schema' | 'shacl' | 'jsonld') || 'json-schema',
        content: initialData.content ? JSON.stringify(initialData.content, null, 2) : '{}',
        status: (initialData.status as 'draft' | 'published' | 'deprecated') || 'draft',
      });
      setErrors({});
      setContentError('');
    } else {
      setFormData({
        name: '',
        namespace: '',
        version: '',
        format: 'json-schema',
        content: '{}',
        status: 'draft',
      });
      setErrors({});
      setContentError('');
    }
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Schema name is required';
    }

    if (!formData.namespace.trim()) {
      newErrors.namespace = 'Namespace is required';
    }

    if (!formData.version.trim()) {
      newErrors.version = 'Version is required';
    }

    // Validate JSON content
    try {
      JSON.parse(formData.content);
      setContentError('');
    } catch (e) {
      setContentError('Content must be valid JSON');
      return false;
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
      const content = JSON.parse(formData.content);

      if (initialData) {
        // Update mode
        await onSubmit({
          name: formData.name,
          namespace: formData.namespace,
          version: formData.version,
          format: formData.format,
          content,
          status: formData.status,
        });
      } else {
        // Create mode
        await onSubmit({
          name: formData.name,
          namespace: formData.namespace,
          version: formData.version,
          format: formData.format,
          content,
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
      title={initialData ? 'Edit Schema' : 'Add Schema'}
      size="lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Schema Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Schema name"
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

        {/* Namespace Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Namespace <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="namespace"
            value={formData.namespace}
            onChange={handleChange}
            placeholder="e.g., com.example.dataspace"
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.namespace
                ? 'border-red-500 focus:ring-red-500'
                : 'border-neutral-300'
            }`}
          />
          {errors.namespace && (
            <p className="text-red-500 text-xs mt-1">{errors.namespace}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Version Field */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Version <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleChange}
              placeholder="1.0.0"
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.version
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-neutral-300'
              }`}
            />
            {errors.version && (
              <p className="text-red-500 text-xs mt-1">{errors.version}</p>
            )}
          </div>

          {/* Format Field */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Format
            </label>
            <select
              name="format"
              value={formData.format}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="json-schema">JSON Schema</option>
              <option value="shacl">SHACL</option>
              <option value="jsonld">JSON-LD</option>
            </select>
          </div>
        </div>

        {/* Content Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Content (JSON) <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder='{"type": "object", "properties": {}}'
            disabled={isLoading}
            rows={6}
            className={`w-full px-3 py-2 border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              contentError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-neutral-300'
            }`}
          />
          {contentError && (
            <p className="text-red-500 text-xs mt-1">{contentError}</p>
          )}
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
              <option value="deprecated">Deprecated</option>
            </select>
          </div>
        )}
      </form>
    </Modal>
  );
};
