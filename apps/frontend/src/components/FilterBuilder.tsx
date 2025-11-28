import { X, Plus } from 'lucide-react';
import { Button } from './Button';
import { FilterCondition, FilterField, FilterOperator } from '@utils/filter-builder';

interface FilterBuilderProps {
  fields: FilterField[];
  conditions: FilterCondition[];
  onAddCondition: (condition: Omit<FilterCondition, 'id'>) => void;
  onRemoveCondition: (id: string) => void;
  onUpdateCondition: (id: string, updates: Partial<FilterCondition>) => void;
  onClear: () => void;
}

export const FilterBuilder = ({
  fields,
  conditions,
  onAddCondition,
  onRemoveCondition,
  onUpdateCondition,
  onClear,
}: FilterBuilderProps) => {
  const getFieldByName = (name: string) => fields.find((f) => f.name === name);

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900">Filters</h3>
        {conditions.length > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Existing Conditions */}
      {conditions.map((condition, index) => {
        const field = getFieldByName(condition.field);
        if (!field) return null;

        return (
          <div key={condition.id} className="flex items-end gap-3 bg-neutral-50 p-3 rounded">
            {/* Field Select */}
            <select
              value={condition.field}
              onChange={(e) => onUpdateCondition(condition.id, { field: e.target.value })}
              className="px-3 py-2 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {fields.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.label}
                </option>
              ))}
            </select>

            {/* Operator Select */}
            <select
              value={condition.operator}
              onChange={(e) => onUpdateCondition(condition.id, { operator: e.target.value as FilterOperator })}
              className="px-3 py-2 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {field?.operators.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>

            {/* Value Input */}
            {field?.type === 'select' && field.options ? (
              <select
                value={condition.value}
                onChange={(e) => onUpdateCondition(condition.id, { value: e.target.value })}
                className="px-3 py-2 text-sm border border-neutral-300 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select...</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field?.type === 'date' ? (
              <input
                type="date"
                value={condition.value}
                onChange={(e) => onUpdateCondition(condition.id, { value: e.target.value })}
                className="px-3 py-2 text-sm border border-neutral-300 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <input
                type={field?.type === 'number' ? 'number' : 'text'}
                value={condition.value}
                onChange={(e) => onUpdateCondition(condition.id, { value: e.target.value })}
                placeholder="Enter value..."
                className="px-3 py-2 text-sm border border-neutral-300 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            )}

            {/* Remove Button */}
            <button
              onClick={() => onRemoveCondition(condition.id)}
              className="p-2 text-neutral-600 hover:bg-neutral-200 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}

      {/* Add New Condition Button */}
      <Button
        onClick={() =>
          onAddCondition({
            field: fields[0].name,
            operator: fields[0].operators[0],
            value: '',
          })
        }
        variant="outline"
        icon={<Plus size={16} />}
        className="w-full"
      >
        Add Filter
      </Button>
    </div>
  );
};
