import { X } from 'lucide-react';
import { FilterCondition, FilterField } from '@utils/filter-builder';

interface FilterChipsProps {
  conditions: FilterCondition[];
  fields: FilterField[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const FilterChips = ({
  conditions,
  fields,
  onRemove,
  onClear,
}: FilterChipsProps) => {
  if (conditions.length === 0) return null;

  const getFieldLabel = (fieldName: string) => {
    return fields.find((f) => f.name === fieldName)?.label || fieldName;
  };

  return (
    <div className="flex flex-wrap gap-2 items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <span className="text-sm font-medium text-blue-900">Filters:</span>

      {conditions.map((condition) => (
        <div
          key={condition.id}
          className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-900 text-sm rounded-full"
        >
          <span>
            <strong>{getFieldLabel(condition.field)}</strong> {condition.operator}{' '}
            {condition.value}
          </span>
          <button
            onClick={() => onRemove(condition.id)}
            className="p-1 hover:bg-blue-200 rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <button
        onClick={onClear}
        className="text-xs text-blue-600 hover:text-blue-700 font-medium ml-auto"
      >
        Clear all
      </button>
    </div>
  );
};
