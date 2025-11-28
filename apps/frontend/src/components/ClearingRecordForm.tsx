import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import type { ClearingRecord } from '@types';
import type { CreateClearingRecordData, UpdateClearingRecordData } from '@/services/clearing-service';

interface ClearingRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClearingRecordData | UpdateClearingRecordData) => Promise<void>;
  isLoading?: boolean;
  initialData?: ClearingRecord;
}

export const ClearingRecordForm = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
}: ClearingRecordFormProps) => {
  const [formData, setFormData] = useState({
    contractId: '',
    providerId: '',
    consumerId: '',
    amount: '',
    notes: '',
    status: 'pending' as 'pending' | 'cleared' | 'failed',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        contractId: initialData.contractId || '',
        providerId: initialData.providerId || '',
        consumerId: initialData.consumerId || '',
        amount: initialData.amount?.toString() || '',
        notes: '',
        status: (initialData.status as 'pending' | 'cleared' | 'failed') || 'pending',
      });
      setErrors({});
    } else {
      setFormData({
        contractId: '',
        providerId: '',
        consumerId: '',
        amount: '',
        notes: '',
        status: 'pending',
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.contractId.trim()) {
      newErrors.contractId = 'Contract ID is required';
    }

    if (!formData.providerId.trim()) {
      newErrors.providerId = 'Provider ID is required';
    }

    if (!formData.consumerId.trim()) {
      newErrors.consumerId = 'Consumer ID is required';
    }

    const amountNum = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Valid amount is required';
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
      const amount = parseFloat(formData.amount);

      if (initialData) {
        // Update mode
        await onSubmit({
          amount,
          status: formData.status,
          notes: formData.notes || undefined,
        });
      } else {
        // Create mode
        await onSubmit({
          contractId: formData.contractId,
          providerId: formData.providerId,
          consumerId: formData.consumerId,
          amount,
          notes: formData.notes || undefined,
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
      title={initialData ? 'Edit Clearing Record' : 'Add Clearing Record'}
      size="lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contract ID Field */}
        {!initialData && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Contract ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contractId"
              value={formData.contractId}
              onChange={handleChange}
              placeholder="Contract ID"
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.contractId
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-neutral-300'
              }`}
            />
            {errors.contractId && (
              <p className="text-red-500 text-xs mt-1">{errors.contractId}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Provider ID Field */}
          {!initialData && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Provider ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="providerId"
                value={formData.providerId}
                onChange={handleChange}
                placeholder="Provider ID"
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.providerId
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-neutral-300'
                }`}
              />
              {errors.providerId && (
                <p className="text-red-500 text-xs mt-1">{errors.providerId}</p>
              )}
            </div>
          )}

          {/* Consumer ID Field */}
          {!initialData && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Consumer ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="consumerId"
                value={formData.consumerId}
                onChange={handleChange}
                placeholder="Consumer ID"
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.consumerId
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-neutral-300'
                }`}
              />
              {errors.consumerId && (
                <p className="text-red-500 text-xs mt-1">{errors.consumerId}</p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Amount Field */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-neutral-300'
              }`}
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
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
                <option value="pending">Pending</option>
                <option value="cleared">Cleared</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          )}
        </div>

        {/* Notes Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter notes (optional)"
            disabled={isLoading}
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
    </Modal>
  );
};
