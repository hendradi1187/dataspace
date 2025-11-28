import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import type { App } from '@types';

interface AppFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  initialData?: App;
}

export const AppForm = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
}: AppFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '',
    category: 'utility' as string,
    author: '',
    repository: '',
    status: 'draft' as 'draft' | 'published' | 'deprecated',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        version: initialData.version || '',
        category: initialData.category || 'utility',
        author: initialData.author || '',
        repository: initialData.repository || '',
        status: (initialData.status as 'draft' | 'published' | 'deprecated') || 'draft',
      });
      setErrors({});
    } else {
      setFormData({
        name: '',
        description: '',
        version: '',
        category: 'utility',
        author: '',
        repository: '',
        status: 'draft',
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'App name is required';
    }

    if (!formData.version.trim()) {
      newErrors.version = 'Version is required';
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
      await onSubmit(formData);
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
        {isLoading ? 'Saving...' : initialData ? 'Update' : 'Upload'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit App' : 'Upload App'}
      size="md"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            App Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="App name"
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
            placeholder="App description"
            disabled={isLoading}
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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

        {/* Category Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="utility">Utility</option>
            <option value="integration">Integration</option>
            <option value="validator">Validator</option>
            <option value="security">Security</option>
            <option value="analytics">Analytics</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Author Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Author
          </label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="App author/developer"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Repository Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Repository URL
          </label>
          <input
            type="url"
            name="repository"
            value={formData.repository}
            onChange={handleChange}
            placeholder="https://github.com/..."
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
              <option value="deprecated">Deprecated</option>
            </select>
          </div>
        )}
      </form>
    </Modal>
  );
};
