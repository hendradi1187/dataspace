import { create } from 'zustand';

export interface ServiceHealth {
  name: string;
  port: number;
  status: 'healthy' | 'unhealthy' | 'checking';
  lastChecked: string;
  responseTime: number;
  uptime: number;
}

interface HealthState {
  services: ServiceHealth[];
  isMonitoring: boolean;
  overallHealth: 'healthy' | 'warning' | 'critical';

  // Actions
  setServices: (services: ServiceHealth[]) => void;
  updateServiceStatus: (name: string, status: ServiceHealth) => void;
  setMonitoring: (isMonitoring: boolean) => void;
  calculateOverallHealth: () => 'healthy' | 'warning' | 'critical';
}

export const useHealthStore = create<HealthState>((set, get) => ({
  services: [],
  isMonitoring: false,
  overallHealth: 'healthy',

  setServices: (services: ServiceHealth[]) => {
    set({
      services,
      overallHealth: get().calculateOverallHealth(),
    });
  },

  updateServiceStatus: (name: string, status: ServiceHealth) => {
    set((state) => {
      const updated = state.services.map((s) => (s.name === name ? status : s));
      return {
        services: updated,
        overallHealth: get().calculateOverallHealth(),
      };
    });
  },

  setMonitoring: (isMonitoring: boolean) => {
    set({ isMonitoring });
  },

  calculateOverallHealth: () => {
    const state = get();
    const services = state.services;

    if (services.length === 0) return 'healthy';

    const unhealthyCount = services.filter((s) => s.status === 'unhealthy').length;
    const checkingCount = services.filter((s) => s.status === 'checking').length;

    if (unhealthyCount > 0) return 'critical';
    if (checkingCount > services.length / 2) return 'warning';

    return 'healthy';
  },
}));
