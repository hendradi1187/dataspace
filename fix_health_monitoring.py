#!/usr/bin/env python3

content = '''import { useEffect, useRef } from 'react';
import { useHealthStore, ServiceHealth } from '@stores/health-store';

const SERVICES = [
  { name: 'IDP Service', port: 3000 },
  { name: 'Broker Service', port: 3001 },
  { name: 'Hub Service', port: 3002 },
  { name: 'Policy Service', port: 3003 },
  { name: 'Contract Service', port: 3004 },
  { name: 'Compliance Service', port: 3005 },
  { name: 'Ledger Service', port: 3006 },
  { name: 'Clearing Service', port: 3007 },
  { name: 'AppStore Service', port: 3008 },
  // { name: 'Connector Service', port: 3009 }, // TODO: Enable when connector service is implemented
];

const CHECK_INTERVAL = 30000; // 30 seconds

export const useHealthMonitoring = (autoStart = true) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { setServices, updateServiceStatus, setMonitoring } = useHealthStore();

  const checkServiceHealth = async (service: { name: string; port: number }) => {
    const startTime = Date.now();
    try {
      const response = await fetch(`http://localhost:${service.port}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const health: ServiceHealth = {
          ...service,
          status: 'healthy',
          lastChecked: new Date().toISOString(),
          responseTime,
          uptime: 100,
        };
        updateServiceStatus(service.name, health);
      } else {
        const health: ServiceHealth = {
          ...service,
          status: 'unhealthy',
          lastChecked: new Date().toISOString(),
          responseTime,
          uptime: 0,
        };
        updateServiceStatus(service.name, health);
      }
    } catch (error) {
      const health: ServiceHealth = {
        ...service,
        status: 'unhealthy',
        lastChecked: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        uptime: 0,
      };
      updateServiceStatus(service.name, health);
    }
  };

  const checkAllServices = async () => {
    // Mark all as checking
    const checking = SERVICES.map((s) => ({
      ...s,
      status: 'checking',
      lastChecked: new Date().toISOString(),
      responseTime: 0,
      uptime: 0,
    })) as ServiceHealth[];
    setServices(checking);

    // Check each service
    await Promise.all(SERVICES.map((service) => checkServiceHealth(service)));
  };

  const startMonitoring = () => {
    setMonitoring(true);
    checkAllServices(); // Initial check
    intervalRef.current = setInterval(checkAllServices, CHECK_INTERVAL);
  };

  const stopMonitoring = () => {
    setMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    if (autoStart) {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [autoStart]);

  return {
    checkAllServices,
    startMonitoring,
    stopMonitoring,
  };
};
'''

filepath = 'D:/BMAD-METHOD/dataspace/apps/frontend/src/hooks/useHealthMonitoring.ts'
with open(filepath, 'w') as f:
    f.write(content)

print("Updated useHealthMonitoring.ts - Disabled Connector Service health check")
