import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  elevation?: 'sm' | 'md' | 'lg';
}

export const Card = ({ children, className = '', elevation = 'md' }: CardProps) => {
  const elevationClasses = {
    sm: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  return (
    <div
      className={`bg-white rounded-lg ${elevationClasses[elevation]} p-6 ${className}`}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const CardHeader = ({ title, subtitle, action }: CardHeaderProps) => (
  <div className="flex justify-between items-start mb-4">
    <div>
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      {subtitle && <p className="text-sm text-neutral-600">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export const CardBody = ({ children, className = '' }: CardBodyProps) => (
  <div className={className}>{children}</div>
);

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter = ({ children, className = '' }: CardFooterProps) => (
  <div className={`mt-4 pt-4 border-t border-neutral-200 ${className}`}>
    {children}
  </div>
);
