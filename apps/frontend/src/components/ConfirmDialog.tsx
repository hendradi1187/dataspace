import { AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            isDangerous ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            {isDangerous ? (
              <AlertCircle size={20} className="text-red-600" />
            ) : (
              <CheckCircle size={20} className="text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          </div>
        </div>

        {/* Message */}
        <p className="text-neutral-600 text-sm">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-neutral-200">
          <Button
            onClick={onCancel}
            disabled={isLoading}
            variant="outline"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            variant={isDangerous ? 'danger' : 'primary'}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
