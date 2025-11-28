import { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { Button } from './Button';

export interface ExportButtonProps {
  onExportCSV?: () => void;
  onExportJSON?: () => void;
  onExportJSONL?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  selectedCount?: number;
}

export const ExportButton = ({
  onExportCSV,
  onExportJSON,
  onExportJSONL,
  isLoading = false,
  disabled = false,
  selectedCount,
}: ExportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasOptions = onExportCSV || onExportJSON || onExportJSONL;

  if (!hasOptions) return null;

  const label = selectedCount ? `Export (${selectedCount})` : 'Export';

  return (
    <div className="relative inline-block">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        variant="outline"
        icon={<Download size={16} />}
        className="flex items-center gap-2"
      >
        {label}
        <ChevronDown size={16} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 min-w-max">
          {onExportCSV && (
            <button
              onClick={() => {
                onExportCSV();
                setIsOpen(false);
              }}
              disabled={isLoading}
              className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 first:rounded-t-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Export as CSV
            </button>
          )}

          {onExportJSON && (
            <button
              onClick={() => {
                onExportJSON();
                setIsOpen(false);
              }}
              disabled={isLoading}
              className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-t border-neutral-200"
            >
              Export as JSON
            </button>
          )}

          {onExportJSONL && (
            <button
              onClick={() => {
                onExportJSONL();
                setIsOpen(false);
              }}
              disabled={isLoading}
              className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 last:rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-t border-neutral-200"
            >
              Export as JSONL
            </button>
          )}
        </div>
      )}
    </div>
  );
};
