import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Button } from './Button';

interface SystemHealthOverviewProps {
  healthScore: number; // 0-100
  systemStatus: 'healthy' | 'degraded' | 'unhealthy';
  healthyServices: number;
  totalServices: number;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const SystemHealthOverview = ({
  healthScore,
  systemStatus,
  healthyServices,
  totalServices,
  onRefresh,
  isLoading = false,
}: SystemHealthOverviewProps) => {
  const statusConfig = {
    healthy: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'All Systems Operational',
    },
    degraded: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: 'Some Services Degraded',
    },
    unhealthy: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Critical Issues Detected',
    },
  };

  const config = statusConfig[systemStatus];
  const StatusIcon = config.icon;

  return (
    <div className={`border ${config.borderColor} rounded-lg p-6 ${config.bgColor} space-y-4`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusIcon size={24} className={config.color} />
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">System Status</h2>
            <p className={`text-sm ${config.color}`}>{config.label}</p>
          </div>
        </div>
        {onRefresh && (
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="outline"
            className="text-sm"
          >
            {isLoading ? 'Checking...' : 'Refresh'}
          </Button>
        )}
      </div>

      {/* Health Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-neutral-900">Overall Health Score</span>
          <span className="text-xl font-bold text-neutral-900">{healthScore}%</span>
        </div>
        <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              systemStatus === 'healthy'
                ? 'bg-green-600'
                : systemStatus === 'degraded'
                ? 'bg-yellow-600'
                : 'bg-red-600'
            }`}
            style={{ width: `${healthScore}%` }}
          ></div>
        </div>
      </div>

      {/* Services Status */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-white rounded p-3">
          <p className="text-neutral-600">Services Healthy</p>
          <p className="text-2xl font-bold text-green-600">
            {healthyServices}/{totalServices}
          </p>
        </div>
        <div className="bg-white rounded p-3">
          <p className="text-neutral-600">Services Down</p>
          <p className="text-2xl font-bold text-red-600">
            {totalServices - healthyServices}
          </p>
        </div>
      </div>
    </div>
  );
};
