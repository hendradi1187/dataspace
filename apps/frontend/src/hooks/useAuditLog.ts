import { useCallback } from 'react';
import {
  logAuditEvent,
  logCreate,
  logUpdate,
  logDelete,
  logBulkDelete,
  logExport,
  AuditAction,
} from '@utils/audit-logger';
import { useAuthStore } from '@stores/auth-store';

export function useAuditLog() {
  const { user } = useAuthStore();

  const log = useCallback(
    (
      action: AuditAction,
      resource: string,
      details: string,
      metadata?: Record<string, any>
    ) => {
      logAuditEvent({
        action,
        resource,
        status: 'success',
        userId: user?.id,
        userName: user?.name,
        details,
        metadata,
      });
    },
    [user]
  );

  const logCreateAction = useCallback(
    (resource: string, resourceId: string, data: Record<string, any>) => {
      logCreate(resource, resourceId, data, user?.id, user?.name);
    },
    [user]
  );

  const logUpdateAction = useCallback(
    (
      resource: string,
      resourceId: string,
      before: Record<string, any>,
      after: Record<string, any>
    ) => {
      logUpdate(resource, resourceId, before, after, user?.id, user?.name);
    },
    [user]
  );

  const logDeleteAction = useCallback(
    (resource: string, resourceId: string, data: Record<string, any>) => {
      logDelete(resource, resourceId, data, user?.id, user?.name);
    },
    [user]
  );

  const logBulkDeleteAction = useCallback(
    (resource: string, count: number) => {
      logBulkDelete(resource, count, user?.id, user?.name);
    },
    [user]
  );

  const logExportAction = useCallback(
    (resource: string, format: string, count: number) => {
      logExport(resource, format, count, user?.id, user?.name);
    },
    [user]
  );

  return {
    log,
    logCreateAction,
    logUpdateAction,
    logDeleteAction,
    logBulkDeleteAction,
    logExportAction,
  };
}
