import { Trash2, RotateCcw, RotateCw } from 'lucide-react';
import { Button } from './Button';
import { useUndoRedoStore } from '@stores/undo-redo-store';

export interface BulkActionsToolbarProps {
  selectedCount: number;
  onBulkDelete?: () => void;
  onBulkStatusChange?: (status: string) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  isLoading?: boolean;
  statuses?: string[];
}

export const BulkActionsToolbar = ({
  selectedCount,
  onBulkDelete,
  onBulkStatusChange,
  onSelectAll,
  onClearSelection,
  isLoading = false,
  statuses = ['active', 'inactive', 'draft', 'deprecated'],
}: BulkActionsToolbarProps) => {
  const { canUndo, canRedo, undo, redo } = useUndoRedoStore();

  if (selectedCount === 0) return null;

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-blue-900">{selectedCount} item(s) selected</span>
        <button
          onClick={onClearSelection}
          className="text-sm text-blue-600 hover:text-blue-700 underline"
        >
          Clear
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Status change dropdown */}
        {onBulkStatusChange && (
          <select
            onChange={(e) => {
              if (e.target.value) {
                onBulkStatusChange(e.target.value);
                e.target.value = '';
              }
            }}
            className="px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="">Change Status...</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                Set to {status}
              </option>
            ))}
          </select>
        )}

        {/* Undo/Redo buttons */}
        <button
          onClick={() => undo()}
          disabled={!canUndo() || isLoading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw size={16} />
          Undo
        </button>

        <button
          onClick={() => redo()}
          disabled={!canRedo() || isLoading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <RotateCw size={16} />
          Redo
        </button>

        {/* Delete button */}
        {onBulkDelete && (
          <button
            onClick={onBulkDelete}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white border border-red-700 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 size={16} />
            Delete ({selectedCount})
          </button>
        )}
      </div>
    </div>
  );
};
