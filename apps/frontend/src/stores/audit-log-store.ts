import { create } from 'zustand';

export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'EXPORT'
  | 'IMPORT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PERMISSION_CHANGE'
  | 'ROLE_CHANGE'
  | 'POLICY_CHANGE'
  | 'SEARCH';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  details?: string;
  status: 'success' | 'failure';
  ipAddress?: string;
  timestamp: string;
}

interface AuditLogState {
  logs: AuditLog[];
  filters: {
    action?: AuditAction;
    userId?: string;
    status?: 'success' | 'failure';
    startDate?: string;
    endDate?: string;
  };

  // Log management
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  getLogs: () => AuditLog[];
  getLogsByUser: (userId: string) => AuditLog[];
  getLogsByAction: (action: AuditAction) => AuditLog[];
  getLogsByResource: (resourceType: string, resourceId?: string) => AuditLog[];
  getFilteredLogs: () => AuditLog[];

  // Filters
  setFilters: (filters: AuditLogState['filters']) => void;
  clearFilters: () => void;

  // Analytics
  getActionStats: () => Record<AuditAction, number>;
  getUserStats: () => Record<string, number>;
  getFailureRate: () => number;
}

export const useAuditLogStore = create<AuditLogState>((set, get) => ({
  logs: [
    {
      id: 'log-1',
      userId: 'user-1',
      userName: 'Admin User',
      action: 'LOGIN',
      resourceType: 'System',
      status: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: 'log-2',
      userId: 'user-2',
      userName: 'Jane Manager',
      action: 'CREATE',
      resourceType: 'Dataset',
      resourceName: 'Q4 Sales Data',
      status: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'log-3',
      userId: 'user-3',
      userName: 'Bob Analyst',
      action: 'EXPORT',
      resourceType: 'Dataset',
      resourceName: 'Customer Analytics',
      details: 'Exported 50000 records to CSV',
      status: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: 'log-4',
      userId: 'user-4',
      userName: 'Alice Viewer',
      action: 'READ',
      resourceType: 'Policy',
      resourceName: 'Data Access Control',
      status: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: 'log-5',
      userId: 'user-1',
      userName: 'Admin User',
      action: 'PERMISSION_CHANGE',
      resourceType: 'User',
      resourceName: 'Bob Analyst',
      details: 'Changed role from analyst to manager',
      status: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    },
    {
      id: 'log-6',
      userId: 'user-2',
      userName: 'Jane Manager',
      action: 'DELETE',
      resourceType: 'Dataset',
      resourceName: 'Old Backup Data',
      status: 'failure',
      details: 'Insufficient permissions',
      timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
  ],
  filters: {},

  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      logs: [newLog, ...state.logs].slice(0, 10000), // Keep last 10000 logs
    }));
  },

  getLogs: () => {
    return get().logs;
  },

  getLogsByUser: (userId: string) => {
    return get().logs.filter((log) => log.userId === userId);
  },

  getLogsByAction: (action: AuditAction) => {
    return get().logs.filter((log) => log.action === action);
  },

  getLogsByResource: (resourceType: string, resourceId?: string) => {
    return get().logs.filter((log) => log.resourceType === resourceType && (!resourceId || log.resourceId === resourceId));
  },

  getFilteredLogs: () => {
    const { logs, filters } = get();

    return logs.filter((log) => {
      if (filters.action && log.action !== filters.action) return false;
      if (filters.userId && log.userId !== filters.userId) return false;
      if (filters.status && log.status !== filters.status) return false;
      if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) return false;
      return true;
    });
  },

  setFilters: (filters: AuditLogState['filters']) => {
    set({ filters });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  getActionStats: () => {
    const logs = get().logs;
    const stats: Record<AuditAction, number> = {
      CREATE: 0,
      READ: 0,
      UPDATE: 0,
      DELETE: 0,
      EXPORT: 0,
      IMPORT: 0,
      LOGIN: 0,
      LOGOUT: 0,
      PERMISSION_CHANGE: 0,
      ROLE_CHANGE: 0,
      POLICY_CHANGE: 0,
      SEARCH: 0,
    };

    logs.forEach((log) => {
      stats[log.action]++;
    });

    return stats;
  },

  getUserStats: () => {
    const logs = get().logs;
    const stats: Record<string, number> = {};

    logs.forEach((log) => {
      stats[log.userName] = (stats[log.userName] || 0) + 1;
    });

    return stats;
  },

  getFailureRate: () => {
    const logs = get().logs;
    if (logs.length === 0) return 0;

    const failures = logs.filter((log) => log.status === 'failure').length;
    return (failures / logs.length) * 100;
  },
}));
