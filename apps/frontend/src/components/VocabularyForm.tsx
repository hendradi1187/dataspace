import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import type { Vocabulary } from '@types';
import type { CreateVocabularyData, UpdateVocabularyData } from '@/services/vocabularies-service';

interface VocabularyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateVocabularyData | UpdateVocabularyData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Vocabulary;
}

export const VocabularyForm = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
}: VocabularyFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    namespace: '',
    version: '',
    format: 'json' as 'json' | 'rdf' | 'owl',
    terms: '',
    status: 'draft' as 'draft' | 'published' | 'deprecated',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        namespace: initialData.namespace || '',
        version: initialData.version || '',
        format: (initialData.format as 'json' | 'rdf' | 'owl') || 'json',
        terms: initialData.terms?.join('\n') || '',
        status: (initialData.status as 'draft' | 'published' | 'deprecated') || 'draft',
      });
      setErrors({});
    } else {
      setFormData({
        name: '',
        namespace: '',
        version: '',
        format: 'json',
        terms: '',
        status: 'draft',
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vocabulary name is required';
    }

    if (!formData.namespace.trim()) {
      newErrors.namespace = 'Namespace is required';
    }

    if (!formData.version.trim()) {
      newErrors.version = 'Version is required';
    }

    if (!formData.terms.trim()) {
      newErrors.terms = 'At least one term is required';
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
      const termsArray = formData.terms
        .split('\n')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      if (initialData) {
        // Update mode
        await onSubmit({
          name: formData.name,
          namespace: formData.namespace,
          version: formData.version,
          format: formData.format,
          terms: termsArray,
          status: formData.status,
        });
      } else {
        // Create mode
        await onSubmit({
          name: formData.name,
          namespace: formData.namespace,
          version: formData.version,
          format: formData.format,
          terms: termsArray,
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
      title={initialData ? 'Edit Vocabulary' : 'Add Vocabulary'}
      size="lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Vocabulary Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Vocabulary name"
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
            placeholder="e.g., com.example.vocab"
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
              <option value="json">JSON</option>
              <option value="rdf">RDF</option>
              <option value="owl">OWL</option>
            </select>
          </div>
        </div>

        {/* Terms Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Terms (one per line) <span className="text-red-500">*</span>
          </label>
          <textarea
            name="terms"
            value={formData.terms}
            onChange={handleChange}
            placeholder="Enter terms, one per line"
            disabled={isLoading}
            rows={6}
            className={`w-full px-3 py-2 border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.terms
                ? 'border-red-500 focus:ring-red-500'
                : 'border-neutral-300'
            }`}
          />
          {errors.terms && (
            <p className="text-red-500 text-xs mt-1">{errors.terms}</p>
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
