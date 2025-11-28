/**
 * Health & Monitoring System - Service status, metrics, health checks
 */

export interface ServiceMetrics {
  serviceId: string;
  serviceName: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number; // ms
  uptime: number; // percentage
  lastCheck: string; // ISO timestamp
  errors: number;
  successRate: number; // percentage
  endpoint: string;
}

export interface SystemMetrics {
  timestamp: string;
  services: ServiceMetrics[];
  averageResponseTime: number;
  systemHealthScore: number; // 0-100
  alertCount: number;
}

// Service definitions
export const SERVICES = [
  { id: 'idp', name: 'Identity Provider', port: 3000, endpoint: 'http://localhost:3000' },
  { id: 'broker', name: 'Broker', port: 3001, endpoint: 'http://localhost:3001' },
  { id: 'hub', name: 'Hub', port: 3002, endpoint: 'http://localhost:3002' },
  { id: 'policy', name: 'Policy', port: 3003, endpoint: 'http://localhost:3003' },
  { id: 'contract', name: 'Contract', port: 3004, endpoint: 'http://localhost:3004' },
  { id: 'compliance', name: 'Compliance', port: 3005, endpoint: 'http://localhost:3005' },
  { id: 'ledger', name: 'Ledger', port: 3006, endpoint: 'http://localhost:3006' },
  { id: 'clearing', name: 'Clearing', port: 3007, endpoint: 'http://localhost:3007' },
  { id: 'appstore', name: 'AppStore', port: 3008, endpoint: 'http://localhost:3008' },
  { id: 'connector', name: 'Connector', port: 3009, endpoint: 'http://localhost:3009' },
];

/**
 * Check health of a single service
 */
export const checkServiceHealth = async (
  endpoint: string
): Promise<{
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  statusCode?: number;
}> => {
  const startTime = performance.now();

  try {
    const response = await fetch(`${endpoint}/health`, {
      method: 'GET',
      timeout: 5000,
    });

    const responseTime = Math.round(performance.now() - startTime);

    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      responseTime,
      statusCode: response.status,
    };
  } catch (error) {
    const responseTime = Math.round(performance.now() - startTime);
    return {
      status: 'unhealthy',
      responseTime,
    };
  }
};

/**
 * Check all services health
 */
export const checkAllServicesHealth = async (): Promise<ServiceMetrics[]> => {
  const checks = await Promise.all(
    SERVICES.map(async (service) => {
      const health = await checkServiceHealth(service.endpoint);

      return {
        serviceId: service.id,
        serviceName: service.name,
        status: health.status === 'healthy' ? 'healthy' : 'unhealthy',
        responseTime: health.responseTime,
        uptime: 99, // Would be calculated from historical data
        lastCheck: new Date().toISOString(),
        errors: 0,
        successRate: health.status === 'healthy' ? 100 : 0,
        endpoint: service.endpoint,
      } as ServiceMetrics;
    })
  );

  return checks;
};

/**
 * Calculate system health score
 */
export const calculateSystemHealthScore = (services: ServiceMetrics[]): number => {
  if (services.length === 0) return 0;

  const healthyCount = services.filter((s) => s.status === 'healthy').length;
  const avgResponseTime = services.reduce((sum, s) => sum + s.responseTime, 0) / services.length;

  let score = (healthyCount / services.length) * 80; // 80 points for service health

  // Add points for response time (lower is better)
  const responseTimeScore = Math.max(0, 20 - (avgResponseTime / 100) * 20);
  score += responseTimeScore;

  return Math.round(score);
};

/**
 * Get system status
 */
export const getSystemStatus = (services: ServiceMetrics[]): 'healthy' | 'degraded' | 'unhealthy' => {
  const healthyCount = services.filter((s) => s.status === 'healthy').length;
  const totalCount = services.length;

  if (healthyCount === totalCount) return 'healthy';
  if (healthyCount >= totalCount * 0.7) return 'degraded';
  return 'unhealthy';
};

/**
 * Get service status color
 */
export const getStatusColor = (
  status: 'healthy' | 'degraded' | 'unhealthy'
): string => {
  switch (status) {
    case 'healthy':
      return 'text-green-600';
    case 'degraded':
      return 'text-yellow-600';
    case 'unhealthy':
      return 'text-red-600';
  }
};

/**
 * Get service status background
 */
export const getStatusBgColor = (
  status: 'healthy' | 'degraded' | 'unhealthy'
): string => {
  switch (status) {
    case 'healthy':
      return 'bg-green-50';
    case 'degraded':
      return 'bg-yellow-50';
    case 'unhealthy':
      return 'bg-red-50';
  }
};

/**
 * Format response time for display
 */
export const formatResponseTime = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};
