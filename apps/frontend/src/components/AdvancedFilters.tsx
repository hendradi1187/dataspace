import { useState } from 'react';
import { ChevronDown, X, RotateCcw } from 'lucide-react';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'checkbox';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export interface AdvancedFiltersProps {
  fields: FilterField[];
  onApply: (filters: Record<string, any>) => void;
  onReset: () => void;
}

export const AdvancedFilters = ({ fields, onApply, onReset }: AdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };

    // Remove empty filters
    Object.keys(newFilters).forEach((k) => {
      if (newFilters[k] === '' || newFilters[k] === null || newFilters[k] === undefined) {
        delete newFilters[k];
      }
    });

    setFilters(newFilters);
    setActiveFilterCount(Object.keys(newFilters).length);
  };

  const handleApply = () => {
    onApply(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters({});
    setActiveFilterCount(0);
    onReset();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
          ${isOpen ? 'bg-primary-50 border-primary-300' : 'bg-white border-neutral-200 hover:border-neutral-300'}
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="text-sm font-medium">Filters</span>
        {activeFilterCount > 0 && (
          <span className="ml-1 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full font-semibold">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-neutral-200 z-40 min-w-80 p-4">
          {/* Filter Fields */}
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-neutral-700 mb-2">{field.label}</label>

                {field.type === 'text' && (
                  <input
                    type="text"
                    placeholder={field.placeholder || `Filter by ${field.label.toLowerCase()}...`}
                    value={filters[field.key] || ''}
                    onChange={(e) => handleFilterChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                )}

                {field.type === 'select' && (
                  <select
                    value={filters[field.key] || ''}
                    onChange={(e) => handleFilterChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                  >
                    <option value="">All {field.label}</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === 'date' && (
                  <input
                    type="date"
                    value={filters[field.key] || ''}
                    onChange={(e) => handleFilterChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                )}

                {field.type === 'checkbox' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters[field.key] || false}
                      onChange={(e) => handleFilterChange(field.key, e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700">{field.label}</span>
                  </label>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6 pt-4 border-t border-neutral-200">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium text-neutral-700 flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              Reset
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
