import { Clock, CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { ServiceMetrics, formatResponseTime, getStatusColor, getStatusBgColor } from '@utils/health-monitor';

interface ServiceHealthCardProps {
  service: ServiceMetrics;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const ServiceHealthCard = ({
  service,
  onRefresh,
  isLoading = false,
}: ServiceHealthCardProps) => {
  const statusIcon = {
    healthy: <CheckCircle size={20} className="text-green-600" />,
    degraded: <AlertCircle size={20} className="text-yellow-600" />,
    unhealthy: <XCircle size={20} className="text-red-600" />,
  };

  const bgColor = getStatusBgColor(service.status);

  return (
    <div className={`border border-neutral-200 rounded-lg p-4 space-y-3 ${bgColor}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {statusIcon[service.status]}
          <div>
            <h3 className="font-semibold text-neutral-900">{service.serviceName}</h3>
            <p className="text-xs text-neutral-600">{service.serviceId}</p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 hover:bg-neutral-200 rounded transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {/* Response Time */}
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-neutral-600" />
          <div>
            <p className="text-xs text-neutral-600">Response</p>
            <p className="font-medium text-neutral-900">
              {formatResponseTime(service.responseTime)}
            </p>
          </div>
        </div>

        {/* Success Rate */}
        <div>
          <p className="text-xs text-neutral-600">Success Rate</p>
          <p className="font-medium text-neutral-900">{service.successRate}%</p>
        </div>

        {/* Uptime */}
        <div>
          <p className="text-xs text-neutral-600">Uptime</p>
          <p className="font-medium text-neutral-900">{service.uptime}%</p>
        </div>

        {/* Errors */}
        <div>
          <p className="text-xs text-neutral-600">Errors</p>
          <p className="font-medium text-neutral-900">{service.errors}</p>
        </div>
      </div>

      {/* Last Check */}
      <div className="text-xs text-neutral-600 border-t border-neutral-200 pt-2">
        Last check: {new Date(service.lastCheck).toLocaleTimeString()}
      </div>
    </div>
  );
};
