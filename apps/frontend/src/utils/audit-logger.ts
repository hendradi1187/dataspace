/**
 * Audit Logging System - Action tracking, user attribution, compliance
 */

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'bulk_delete'
  | 'bulk_update'
  | 'login'
  | 'logout'
  | 'filter'
  | 'search';

export type AuditStatus = 'success' | 'failure' | 'pending';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  action: AuditAction;
  resource: string; // e.g., 'participants', 'datasets'
  resourceId?: string;
  status: AuditStatus;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

// In-memory audit log (replace with backend service in production)
let auditLogs: AuditLog[] = [];

/**
 * Log an audit event
 */
export const logAuditEvent = (event: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog => {
  const auditLog: AuditLog = {
    ...event,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
  };

  auditLogs.push(auditLog);

  // Send to backend if available
  sendAuditToBackend(auditLog).catch((error) => {
    console.error('Failed to send audit log to backend:', error);
  });

  return auditLog;
};

/**
 * Send audit log to backend
 */
export const sendAuditToBackend = async (log: AuditLog): Promise<void> => {
  try {
    // This would be replaced with actual API call
    const response = await fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });

    if (!response.ok) {
      throw new Error(`Failed to log audit event: ${response.statusText}`);
    }
  } catch (error) {
    // Silently fail - don't interrupt user actions
    console.warn('Audit logging failed:', error);
  }
};

/**
 * Get all audit logs
 */
export const getAuditLogs = (): AuditLog[] => {
  return [...auditLogs];
};

/**
 * Filter audit logs
 */
export const filterAuditLogs = (
  filters: {
    userId?: string;
    action?: AuditAction;
    resource?: string;
    status?: AuditStatus;
    startDate?: string;
    endDate?: string;
  }
): AuditLog[] => {
  return auditLogs.filter((log) => {
    if (filters.userId && log.userId !== filters.userId) return false;
    if (filters.action && log.action !== filters.action) return false;
    if (filters.resource && log.resource !== filters.resource) return false;
    if (filters.status && log.status !== filters.status) return false;

    if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) {
      return false;
    }

    if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) {
      return false;
    }

    return true;
  });
};

/**
 * Export audit logs as CSV
 */
export const exportAuditLogsAsCSV = (logs: AuditLog[]): string => {
  const headers = [
    'Timestamp',
    'User',
    'Action',
    'Resource',
    'Status',
    'Details',
  ];

  const rows = logs.map((log) => [
    log.timestamp,
    log.userName || log.userId || 'Unknown',
    log.action,
    log.resource,
    log.status,
    log.details || '',
  ]);

  const csv = [
    headers.map((h) => `"${h}"`).join(','),
    ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csv;
};

/**
 * Clear all audit logs (for testing)
 */
export const clearAuditLogs = (): void => {
  auditLogs = [];
};

/**
 * Log create action
 */
export const logCreate = (
  resource: string,
  resourceId: string,
  data: Record<string, any>,
  userId?: string,
  userName?: string
): AuditLog => {
  return logAuditEvent({
    action: 'create',
    resource,
    resourceId,
    status: 'success',
    userId,
    userName,
    changes: { after: data },
    details: `Created ${resource} ${resourceId}`,
  });
};

/**
 * Log update action
 */
export const logUpdate = (
  resource: string,
  resourceId: string,
  before: Record<string, any>,
  after: Record<string, any>,
  userId?: string,
  userName?: string
): AuditLog => {
  return logAuditEvent({
    action: 'update',
    resource,
    resourceId,
    status: 'success',
    userId,
    userName,
    changes: { before, after },
    details: `Updated ${resource} ${resourceId}`,
  });
};

/**
 * Log delete action
 */
export const logDelete = (
  resource: string,
  resourceId: string,
  data: Record<string, any>,
  userId?: string,
  userName?: string
): AuditLog => {
  return logAuditEvent({
    action: 'delete',
    resource,
    resourceId,
    status: 'success',
    userId,
    userName,
    changes: { before: data },
    details: `Deleted ${resource} ${resourceId}`,
  });
};

/**
 * Log bulk delete action
 */
export const logBulkDelete = (
  resource: string,
  count: number,
  userId?: string,
  userName?: string
): AuditLog => {
  return logAuditEvent({
    action: 'bulk_delete',
    resource,
    status: 'success',
    userId,
    userName,
    details: `Bulk deleted ${count} ${resource}`,
  });
};

/**
 * Log export action
 */
export const logExport = (
  resource: string,
  format: string,
  count: number,
  userId?: string,
  userName?: string
): AuditLog => {
  return logAuditEvent({
    action: 'export',
    resource,
    status: 'success',
    userId,
    userName,
    metadata: { format, count },
    details: `Exported ${count} ${resource} as ${format}`,
  });
};
