import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import type { ServiceHealth } from '@stores/health-store';

export interface ServiceStatusCardProps {
  service: ServiceHealth;
}

export const ServiceStatusCard = ({ service }: ServiceStatusCardProps) => {
  const getStatusIcon = () => {
    switch (service.status) {
      case 'healthy':
        return <CheckCircle2 size={24} className="text-green-600" />;
      case 'unhealthy':
        return <AlertCircle size={24} className="text-red-600" />;
      case 'checking':
        return <Clock size={24} className="text-yellow-600 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (service.status) {
      case 'healthy':
        return 'border-green-200 bg-green-50';
      case 'unhealthy':
        return 'border-red-200 bg-red-50';
      case 'checking':
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  const getStatusText = () => {
    switch (service.status) {
      case 'healthy':
        return 'Healthy';
      case 'unhealthy':
        return 'Unhealthy';
      case 'checking':
        return 'Checking...';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-neutral-900">{service.name}</h3>
        {getStatusIcon()}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-600">Status</span>
          <span className="font-medium">{getStatusText()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Port</span>
          <code className="bg-neutral-200 px-2 py-1 rounded">{service.port}</code>
        </div>
        {service.status !== 'checking' && (
          <>
            <div className="flex justify-between">
              <span className="text-neutral-600">Response Time</span>
              <span className="font-mono">{service.responseTime}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Uptime</span>
              <span className="font-mono">{service.uptime}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Last Checked</span>
              <span className="text-xs">{new Date(service.lastChecked).toLocaleTimeString()}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
