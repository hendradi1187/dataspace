import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import type { ComplianceRecord } from '@types';
import type { CreateComplianceRecordData, UpdateComplianceRecordData } from '@/services/compliance-service';

interface ComplianceRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateComplianceRecordData | UpdateComplianceRecordData) => Promise<void>;
  isLoading?: boolean;
  initialData?: ComplianceRecord;
}

export const ComplianceRecordForm = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
}: ComplianceRecordFormProps) => {
  const [formData, setFormData] = useState({
    datasetId: '',
    auditId: '',
    findings: '',
    riskLevel: 'low' as 'low' | 'medium' | 'high',
    recommendations: '',
    status: 'draft' as 'draft' | 'pending' | 'approved' | 'rejected',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        datasetId: initialData.datasetId || '',
        auditId: initialData.auditId || '',
        findings: initialData.findings || '',
        riskLevel: (initialData.riskLevel as 'low' | 'medium' | 'high') || 'low',
        recommendations: '',
        status: (initialData.status as 'draft' | 'pending' | 'approved' | 'rejected') || 'draft',
      });
      setErrors({});
    } else {
      setFormData({
        datasetId: '',
        auditId: '',
        findings: '',
        riskLevel: 'low',
        recommendations: '',
        status: 'draft',
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.datasetId.trim()) {
      newErrors.datasetId = 'Dataset ID is required';
    }

    if (!formData.findings.trim()) {
      newErrors.findings = 'Findings are required';
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
          findings: formData.findings,
          riskLevel: formData.riskLevel,
          status: formData.status,
          recommendations: formData.recommendations || undefined,
        });
      } else {
        // Create mode
        await onSubmit({
          datasetId: formData.datasetId,
          auditId: formData.auditId || undefined,
          findings: formData.findings,
          riskLevel: formData.riskLevel,
          recommendations: formData.recommendations || undefined,
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
      title={initialData ? 'Edit Compliance Record' : 'Add Compliance Record'}
      size="lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dataset ID Field */}
        {!initialData && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Dataset ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="datasetId"
              value={formData.datasetId}
              onChange={handleChange}
              placeholder="Dataset ID"
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.datasetId
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-neutral-300'
              }`}
            />
            {errors.datasetId && (
              <p className="text-red-500 text-xs mt-1">{errors.datasetId}</p>
            )}
          </div>
        )}

        {/* Audit ID Field */}
        {!initialData && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Audit ID
            </label>
            <input
              type="text"
              name="auditId"
              value={formData.auditId}
              onChange={handleChange}
              placeholder="Audit ID (optional)"
              disabled={isLoading}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Findings Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Findings <span className="text-red-500">*</span>
          </label>
          <textarea
            name="findings"
            value={formData.findings}
            onChange={handleChange}
            placeholder="Enter compliance findings"
            disabled={isLoading}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.findings
                ? 'border-red-500 focus:ring-red-500'
                : 'border-neutral-300'
            }`}
          />
          {errors.findings && (
            <p className="text-red-500 text-xs mt-1">{errors.findings}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Risk Level Field */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Risk Level
            </label>
            <select
              name="riskLevel"
              value={formData.riskLevel}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}
        </div>

        {/* Recommendations Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Recommendations
          </label>
          <textarea
            name="recommendations"
            value={formData.recommendations}
            onChange={handleChange}
            placeholder="Enter recommendations (optional)"
            disabled={isLoading}
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
    </Modal>
  );
};
