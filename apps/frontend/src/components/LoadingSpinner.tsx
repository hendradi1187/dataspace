export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({
  size = 'md',
  message = 'Loading...',
  fullScreen = false,
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50'
    : 'flex flex-col items-center justify-center gap-4 py-12';

  return (
    <div className={containerClasses}>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-neutral-200 border-t-primary-500 animate-spin`}
        ></div>
      </div>
      {message && <p className="text-neutral-600 font-medium">{message}</p>}
    </div>
  );
};
