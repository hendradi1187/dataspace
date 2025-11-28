import { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}: BadgeProps) => {
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    neutral: 'bg-neutral-100 text-neutral-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-full font-medium
        ${className}
      `}
    >
      {children}
    </span>
  );
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  const statusVariants: Record<string, BadgeVariant> = {
    active: 'success',
    online: 'success',
    published: 'success',
    signed: 'success',
    healthy: 'success',

    inactive: 'neutral',
    offline: 'neutral',
    draft: 'neutral',

    pending: 'warning',
    maintenance: 'warning',

    suspended: 'error',
    terminated: 'error',
    unhealthy: 'error',
  };

  const variant = (statusVariants[status.toLowerCase()] || 'neutral') as BadgeVariant;

  return (
    <Badge variant={variant} className={className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
