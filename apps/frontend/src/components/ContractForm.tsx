import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import { participantsService } from '@/services/participants-service';
import { datasetsService } from '@/services/datasets-service';
import { policiesService } from '@/services/policies-service';
import type { Contract, Participant, Dataset, Policy } from '@types';
import type { CreateContractData, UpdateContractData } from '@/services/contracts-service';

interface ContractFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateContractData | UpdateContractData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Contract;
}

export const ContractForm = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
}: ContractFormProps) => {
  const [formData, setFormData] = useState({
    providerId: '',
    consumerId: '',
    datasetId: '',
    policyId: '',
    terms: '',
    expiresAt: '',
    status: 'draft' as 'draft' | 'negotiating' | 'active' | 'expired' | 'terminated',
  });

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && !initialData) {
      const loadData = async () => {
        try {
          setLoadingData(true);
          const [pResp, dResp, polResp] = await Promise.all([
            participantsService.list({ pageSize: 100 }),
            datasetsService.list({ pageSize: 100 }),
            policiesService.list({ pageSize: 100 }),
          ]);
          setParticipants(pResp.data);
          setDatasets(dResp.data);
          setPolicies(polResp.data);
        } catch (error) {
          console.error('Failed to load data:', error);
        } finally {
          setLoadingData(false);
        }
      };
      loadData();
    }

    if (initialData) {
      setFormData({
        providerId: initialData.providerId || '',
        consumerId: initialData.consumerId || '',
        datasetId: initialData.datasetId || '',
        policyId: initialData.policyId || '',
        terms: initialData.terms || '',
        expiresAt: initialData.expiresAt || '',
        status: (initialData.status as 'draft' | 'negotiating' | 'active' | 'expired' | 'terminated') || 'draft',
      });
      setErrors({});
    } else {
      setFormData({
        providerId: '',
        consumerId: '',
        datasetId: '',
        policyId: '',
        terms: '',
        expiresAt: '',
        status: 'draft',
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!initialData && !formData.providerId) {
      newErrors.providerId = 'Provider is required';
    }

    if (!initialData && !formData.consumerId) {
      newErrors.consumerId = 'Consumer is required';
    }

    if (!initialData && !formData.datasetId) {
      newErrors.datasetId = 'Dataset is required';
    }

    if (!initialData && !formData.policyId) {
      newErrors.policyId = 'Policy is required';
    }

    if (!formData.terms.trim()) {
      newErrors.terms = 'Terms are required';
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
          terms: formData.terms,
          expiresAt: formData.expiresAt,
          status: formData.status,
        });
      } else {
        await onSubmit({
          providerId: formData.providerId,
          consumerId: formData.consumerId,
          datasetId: formData.datasetId,
          policyId: formData.policyId,
          terms: formData.terms,
          expiresAt: formData.expiresAt || undefined,
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
      <Button onClick={onClose} variant="outline" disabled={isLoading || loadingData}>
        Cancel
      </Button>
      <Button onClick={handleSubmit} variant="primary" disabled={isLoading || loadingData}>
        {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Contract' : 'Add Contract'}
      size="md"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Provider */}
        {!initialData && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Provider <span className="text-red-500">*</span>
            </label>
            <select
              name="providerId"
              value={formData.providerId}
              onChange={handleChange}
              disabled={isLoading || loadingData}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.providerId
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-neutral-300'
              }`}
            >
              <option value="">
                {loadingData ? 'Loading...' : 'Select provider'}
              </option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.providerId && (
              <p className="text-red-500 text-xs mt-1">{errors.providerId}</p>
            )}
          </div>
        )}

        {/* Consumer */}
        {!initialData && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Consumer <span className="text-red-500">*</span>
            </label>
            <select
              name="consumerId"
              value={formData.consumerId}
              onChange={handleChange}
              disabled={isLoading || loadingData}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.consumerId
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-neutral-300'
              }`}
            >
              <option value="">
                {loadingData ? 'Loading...' : 'Select consumer'}
              </option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.consumerId && (
              <p className="text-red-500 text-xs mt-1">{errors.consumerId}</p>
            )}
          </div>
        )}

        {/* Dataset */}
        {!initialData && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Dataset <span className="text-red-500">*</span>
            </label>
            <select
              name="datasetId"
              value={formData.datasetId}
              onChange={handleChange}
              disabled={isLoading || loadingData}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.datasetId
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-neutral-300'
              }`}
            >
              <option value="">
                {loadingData ? 'Loading...' : 'Select dataset'}
              </option>
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.datasetId && (
              <p className="text-red-500 text-xs mt-1">{errors.datasetId}</p>
            )}
          </div>
        )}

        {/* Policy */}
        {!initialData && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Policy <span className="text-red-500">*</span>
            </label>
            <select
              name="policyId"
              value={formData.policyId}
              onChange={handleChange}
              disabled={isLoading || loadingData}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.policyId
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-neutral-300'
              }`}
            >
              <option value="">
                {loadingData ? 'Loading...' : 'Select policy'}
              </option>
              {policies.map((pol) => (
                <option key={pol.id} value={pol.id}>
                  {pol.name}
                </option>
              ))}
            </select>
            {errors.policyId && (
              <p className="text-red-500 text-xs mt-1">{errors.policyId}</p>
            )}
          </div>
        )}

        {/* Terms */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Terms <span className="text-red-500">*</span>
          </label>
          <textarea
            name="terms"
            value={formData.terms}
            onChange={handleChange}
            placeholder="Contract terms and conditions"
            disabled={isLoading}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.terms
                ? 'border-red-500 focus:ring-red-500'
                : 'border-neutral-300'
            }`}
          />
          {errors.terms && (
            <p className="text-red-500 text-xs mt-1">{errors.terms}</p>
          )}
        </div>

        {/* Expires At */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Expires At
          </label>
          <input
            type="datetime-local"
            name="expiresAt"
            value={formData.expiresAt}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status */}
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
              <option value="negotiating">Negotiating</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        )}
      </form>
    </Modal>
  );
};
