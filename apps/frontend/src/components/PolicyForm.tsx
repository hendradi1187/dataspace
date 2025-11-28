import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import type { Policy } from '@types';
import type { CreatePolicyData, UpdatePolicyData } from '@/services/policies-service';

interface PolicyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePolicyData | UpdatePolicyData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Policy;
}

export const PolicyForm = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
}: PolicyFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: [] as Array<{ name: string; condition: string; effect: 'allow' | 'deny'; priority: number }>,
    status: 'draft' as 'draft' | 'active' | 'deprecated',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        rules: initialData.rules || [],
        status: (initialData.status as 'draft' | 'active' | 'deprecated') || 'draft',
      });
      setErrors({});
    } else {
      setFormData({
        name: '',
        description: '',
        rules: [],
        status: 'draft',
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Policy name is required';
    }

    if (formData.rules.length === 0) {
      newErrors.rules = 'At least one rule is required';
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
        await onSubmit({
          name: formData.name,
          description: formData.description,
          rules: formData.rules,
          status: formData.status,
        });
      } else {
        await onSubmit({
          name: formData.name,
          description: formData.description,
          rules: formData.rules,
        });
      }
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ruleIndex?: number,
    ruleField?: string
  ) => {
    const { name, value } = e.target;

    if (ruleIndex !== undefined && ruleField) {
      const newRules = [...formData.rules];
      newRules[ruleIndex] = {
        ...newRules[ruleIndex],
        [ruleField]: ruleField === 'priority' ? parseInt(value, 10) : value,
      };
      setFormData((prev) => ({ ...prev, rules: newRules }));
    } else {
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
    }
  };

  const addRule = () => {
    setFormData((prev) => ({
      ...prev,
      rules: [...prev.rules, { name: '', condition: '', effect: 'allow', priority: prev.rules.length + 1 }],
    }));
  };

  const removeRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
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
      title={initialData ? 'Edit Policy' : 'Add Policy'}
      size="lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Policy Name */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Policy Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => handleChange(e)}
            placeholder="Policy name"
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500 focus:ring-red-500' : 'border-neutral-300'
            }`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) => handleChange(e)}
            placeholder="Policy description"
            disabled={isLoading}
            rows={2}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Rules Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-neutral-700">
              Rules <span className="text-red-500">*</span>
            </label>
            <Button
              type="button"
              onClick={addRule}
              variant="outline"
              disabled={isLoading}
              className="text-sm py-1 px-2"
            >
              Add Rule
            </Button>
          </div>
          {errors.rules && <p className="text-red-500 text-xs">{errors.rules}</p>}

          {formData.rules.map((rule, idx) => (
            <div key={idx} className="border border-neutral-200 rounded-md p-3 space-y-2 bg-neutral-50">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={rule.name}
                  onChange={(e) => handleChange(e, idx, 'name')}
                  placeholder="Rule name"
                  disabled={isLoading}
                  className="px-2 py-1 border border-neutral-300 rounded text-sm"
                />
                <select
                  value={rule.effect}
                  onChange={(e) => handleChange(e, idx, 'effect')}
                  disabled={isLoading}
                  className="px-2 py-1 border border-neutral-300 rounded text-sm"
                >
                  <option value="allow">Allow</option>
                  <option value="deny">Deny</option>
                </select>
              </div>
              <input
                type="text"
                value={rule.condition}
                onChange={(e) => handleChange(e, idx, 'condition')}
                placeholder="Condition"
                disabled={isLoading}
                className="w-full px-2 py-1 border border-neutral-300 rounded text-sm"
              />
              <div className="flex gap-2 justify-between">
                <input
                  type="number"
                  value={rule.priority}
                  onChange={(e) => handleChange(e, idx, 'priority')}
                  placeholder="Priority"
                  min="1"
                  disabled={isLoading}
                  className="w-20 px-2 py-1 border border-neutral-300 rounded text-sm"
                />
                <Button
                  type="button"
                  onClick={() => removeRule(idx)}
                  variant="danger"
                  disabled={isLoading}
                  className="text-sm py-1 px-2"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
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
              onChange={(e) => handleChange(e)}
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
