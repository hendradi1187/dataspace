import { AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './Button';

export interface ProgressDialogProps {
  isOpen: boolean;
  title: string;
  currentProgress: number;
  totalProgress: number;
  status?: 'processing' | 'success' | 'error';
  errorMessage?: string;
  successMessage?: string;
  onClose: () => void;
}

export const ProgressDialog = ({
  isOpen,
  title,
  currentProgress,
  totalProgress,
  status = 'processing',
  errorMessage,
  successMessage,
  onClose,
}: ProgressDialogProps) => {
  if (!isOpen) return null;

  const percentage = totalProgress > 0 ? (currentProgress / totalProgress) * 100 : 0;
  const isComplete = currentProgress === totalProgress && totalProgress > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            status === 'error' ? 'bg-red-100' : status === 'success' ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            {status === 'error' ? (
              <AlertCircle size={20} className="text-red-600" />
            ) : status === 'success' ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-blue-300 border-t-blue-600 animate-spin"></div>
            )}
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        </div>

        {/* Progress */}
        {status === 'processing' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Progress</span>
              <span>{currentProgress} of {totalProgress}</span>
            </div>
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {status === 'success' && successMessage && (
          <p className="text-sm text-green-700 bg-green-50 p-3 rounded">{successMessage}</p>
        )}

        {/* Error Message */}
        {status === 'error' && errorMessage && (
          <p className="text-sm text-red-700 bg-red-50 p-3 rounded">{errorMessage}</p>
        )}

        {/* Close Button */}
        {(status === 'success' || status === 'error') && (
          <div className="flex justify-end pt-4 border-t border-neutral-200">
            <Button onClick={onClose} variant="primary">
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
