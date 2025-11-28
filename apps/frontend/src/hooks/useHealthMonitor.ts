import { useState, useEffect, useCallback } from 'react';
import {
  checkAllServicesHealth,
  calculateSystemHealthScore,
  getSystemStatus,
  ServiceMetrics,
} from '@utils/health-monitor';

interface UseHealthMonitorOptions {
  pollInterval?: number; // ms, default 30000 (30 seconds)
  autoStart?: boolean;
}

export function useHealthMonitor(options: UseHealthMonitorOptions = {}) {
  const { pollInterval = 30000, autoStart = true } = options;

  const [services, setServices] = useState<ServiceMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const healthChecks = await checkAllServicesHealth();
      setServices(healthChecks);
      setLastCheck(new Date().toISOString());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check health';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-check on mount
  useEffect(() => {
    if (autoStart) {
      checkHealth();
    }
  }, [autoStart, checkHealth]);

  // Set up polling
  useEffect(() => {
    if (!autoStart) return;

    const interval = setInterval(() => {
      checkHealth();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [autoStart, pollInterval, checkHealth]);

  const systemHealthScore = calculateSystemHealthScore(services);
  const systemStatus = getSystemStatus(services);

  return {
    services,
    systemHealthScore,
    systemStatus,
    isLoading,
    error,
    lastCheck,
    checkHealth,
  };
}
