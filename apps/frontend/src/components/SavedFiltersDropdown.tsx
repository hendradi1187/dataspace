import { useState } from 'react';
import { Save, Trash2, ChevronDown } from 'lucide-react';
import { Button } from './Button';
import { SavedFilter } from '@utils/filter-builder';

interface SavedFiltersDropdownProps {
  savedFilters: SavedFilter[];
  onLoad: (filter: SavedFilter) => void;
  onDelete: (id: string) => void;
  onSaveNew?: (name: string) => void;
}

export const SavedFiltersDropdown = ({
  savedFilters,
  onLoad,
  onDelete,
  onSaveNew,
}: SavedFiltersDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [filterName, setFilterName] = useState('');

  const handleSave = () => {
    if (filterName.trim()) {
      onSaveNew?.(filterName);
      setFilterName('');
      setShowSaveForm(false);
    }
  };

  return (
    <div className="relative inline-block">
      {/* Main Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        icon={<Save size={16} />}
        className="flex items-center gap-2"
      >
        Filters
        <ChevronDown size={16} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 min-w-64">
          {/* Save Current Filter */}
          {onSaveNew && (
            <div className="border-b border-neutral-200">
              {!showSaveForm ? (
                <button
                  onClick={() => setShowSaveForm(true)}
                  className="w-full text-left px-4 py-2 text-sm text-primary-600 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  Save current filter
                </button>
              ) : (
                <div className="px-4 py-3 space-y-2">
                  <input
                    autoFocus
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="Filter name..."
                    className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') setShowSaveForm(false);
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowSaveForm(false)}
                      className="flex-1 px-2 py-1 text-xs bg-neutral-200 rounded hover:bg-neutral-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Saved Filters List */}
          {savedFilters.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              {savedFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center justify-between px-4 py-2 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 text-sm group"
                >
                  <button
                    onClick={() => {
                      onLoad(filter);
                      setIsOpen(false);
                    }}
                    className="flex-1 text-left text-neutral-700 hover:text-primary-600"
                  >
                    <div className="font-medium">{filter.name}</div>
                    {filter.description && (
                      <div className="text-xs text-neutral-500">{filter.description}</div>
                    )}
                  </button>
                  <button
                    onClick={() => onDelete(filter.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-neutral-500 text-center">
              No saved filters
            </div>
          )}
        </div>
      )}
    </div>
  );
};
