import { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useHealthStore } from '@stores/health-store';
import { useHealthMonitoring } from '@hooks/useHealthMonitoring';
import { ServiceStatusCard } from '@components/ServiceStatusCard';
import { Button } from '@components/Button';

export const HealthDashboard = () => {
  const { services, overallHealth, isMonitoring } = useHealthStore();
  const { checkAllServices, startMonitoring, stopMonitoring } = useHealthMonitoring(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (autoRefresh) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [autoRefresh]);

  const healthyCount = services.filter((s) => s.status === 'healthy').length;
  const unhealthyCount = services.filter((s) => s.status === 'unhealthy').length;
  const checkingCount = services.filter((s) => s.status === 'checking').length;

  const getOverallHealthColor = () => {
    switch (overallHealth) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
    }
  };

  const getOverallHealthIcon = () => {
    switch (overallHealth) {
      case 'healthy':
        return <CheckCircle size={32} className="text-green-600" />;
      case 'warning':
        return <AlertTriangle size={32} className="text-yellow-600" />;
      case 'critical':
        return <AlertTriangle size={32} className="text-red-600" />;
    }
  };

  const getOverallHealthText = () => {
    switch (overallHealth) {
      case 'healthy':
        return 'All Systems Healthy';
      case 'warning':
        return 'Systems Warning';
      case 'critical':
        return 'Critical Issues';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">System Health</h1>
          <p className="text-neutral-600 mt-2">Monitor service status and performance</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => checkAllServices()}
            icon={<RefreshCw size={16} />}
            variant="outline"
          >
            Refresh
          </Button>
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? 'primary' : 'outline'}
          >
            {autoRefresh ? 'Auto-Refresh: On' : 'Auto-Refresh: Off'}
          </Button>
        </div>
      </div>

      {/* Overall Health Status */}
      <div className={`p-6 rounded-lg border-2 ${getOverallHealthColor()}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 mb-2">Overall Status</p>
            <h2 className="text-2xl font-bold text-neutral-900">
              {getOverallHealthText()}
            </h2>
            <p className="text-neutral-600 mt-2">
              {healthyCount} healthy · {unhealthyCount} unhealthy · {checkingCount} checking
            </p>
          </div>
          {getOverallHealthIcon()}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Healthy Services</p>
          <p className="text-3xl font-bold text-green-900 mt-2">{healthyCount}</p>
          <p className="text-xs text-green-700 mt-1">
            {services.length > 0 ? Math.round((healthyCount / services.length) * 100) : 0}% operational
          </p>
        </div>

        <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-600 font-medium">Checking</p>
          <p className="text-3xl font-bold text-yellow-900 mt-2">{checkingCount}</p>
          <p className="text-xs text-yellow-700 mt-1">Services being monitored</p>
        </div>

        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">Unhealthy Services</p>
          <p className="text-3xl font-bold text-red-900 mt-2">{unhealthyCount}</p>
          <p className="text-xs text-red-700 mt-1">Requires attention</p>
        </div>
      </div>

      {/* Services Grid */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Service Status</h3>
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <ServiceStatusCard key={service.name} service={service} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-neutral-50 rounded-lg border border-neutral-200">
            <p className="text-neutral-600">Initializing health checks...</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Activity</h3>
        <div className="space-y-2 text-sm text-neutral-600">
          <p>Last updated: {new Date().toLocaleTimeString()}</p>
          <p>Auto-refresh: {autoRefresh ? 'Enabled (every 30 seconds)' : 'Disabled'}</p>
          <p>Monitoring services: {services.length}</p>
        </div>
      </div>
    </div>
  );
};
