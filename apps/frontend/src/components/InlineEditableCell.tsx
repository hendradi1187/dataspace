import { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

export interface InlineEditableCellProps {
  value: any;
  onSave: (newValue: any) => void;
  type?: 'text' | 'number' | 'email' | 'url' | 'date';
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
}

export const InlineEditableCell = ({
  value,
  onSave,
  type = 'text',
  options,
  disabled = false,
}: InlineEditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue !== String(value)) {
      let finalValue: any = editValue;
      if (type === 'number') {
        finalValue = Number(editValue);
      }
      onSave(finalValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(value));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div
        onClick={() => !disabled && setIsEditing(true)}
        className={`
          px-3 py-2 rounded cursor-pointer group relative
          ${disabled ? '' : 'hover:bg-neutral-100'}
        `}
      >
        <span className="text-neutral-900">{value}</span>
        {!disabled && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-neutral-400">Edit</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 p-1">
      {options ? (
        <select
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 text-sm border border-primary-500 rounded focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={inputRef}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 text-sm border border-primary-500 rounded focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
      )}

      <button
        onClick={handleSave}
        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
        title="Save"
      >
        <Check size={16} />
      </button>

      <button
        onClick={handleCancel}
        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Cancel"
      >
        <X size={16} />
      </button>
    </div>
  );
};
