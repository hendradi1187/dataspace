/**
 * Tests for audit logger utilities
 */

import {
  logAuditEvent,
  logCreate,
  logDelete,
  filterAuditLogs,
  clearAuditLogs,
} from '@utils/audit-logger';

describe('Audit Logger', () => {
  beforeEach(() => {
    clearAuditLogs();
  });

  describe('logAuditEvent', () => {
    it('should create an audit log entry', () => {
      const log = logAuditEvent({
        action: 'create',
        resource: 'participants',
        status: 'success',
      });

      expect(log.id).toBeDefined();
      expect(log.timestamp).toBeDefined();
      expect(log.action).toBe('create');
      expect(log.resource).toBe('participants');
    });

    it('should have unique IDs', () => {
      const log1 = logAuditEvent({
        action: 'create',
        resource: 'participants',
        status: 'success',
      });

      const log2 = logAuditEvent({
        action: 'create',
        resource: 'datasets',
        status: 'success',
      });

      expect(log1.id).not.toBe(log2.id);
    });
  });

  describe('logCreate', () => {
    it('should log create action with data', () => {
      const log = logCreate('participants', '123', { name: 'Test' }, 'user1', 'User One');

      expect(log.action).toBe('create');
      expect(log.resource).toBe('participants');
      expect(log.resourceId).toBe('123');
      expect(log.userId).toBe('user1');
      expect(log.userName).toBe('User One');
      expect(log.changes?.after).toEqual({ name: 'Test' });
    });
  });

  describe('logDelete', () => {
    it('should log delete action with data', () => {
      const log = logDelete('participants', '123', { name: 'Test' }, 'user1', 'User One');

      expect(log.action).toBe('delete');
      expect(log.changes?.before).toEqual({ name: 'Test' });
    });
  });

  describe('filterAuditLogs', () => {
    beforeEach(() => {
      clearAuditLogs();
      logCreate('participants', '1', {}, 'user1');
      logCreate('datasets', '2', {}, 'user2');
      logDelete('participants', '3', {}, 'user1');
    });

    it('should filter by user', () => {
      const logs = filterAuditLogs({ userId: 'user1' });

      expect(logs).toHaveLength(2);
      expect(logs.every((l) => l.userId === 'user1')).toBe(true);
    });

    it('should filter by action', () => {
      const logs = filterAuditLogs({ action: 'create' });

      expect(logs).toHaveLength(2);
      expect(logs.every((l) => l.action === 'create')).toBe(true);
    });

    it('should filter by resource', () => {
      const logs = filterAuditLogs({ resource: 'participants' });

      expect(logs).toHaveLength(2);
      expect(logs.every((l) => l.resource === 'participants')).toBe(true);
    });

    it('should support combined filters', () => {
      const logs = filterAuditLogs({ userId: 'user1', action: 'create' });

      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('create');
      expect(logs[0].userId).toBe('user1');
    });
  });
});
