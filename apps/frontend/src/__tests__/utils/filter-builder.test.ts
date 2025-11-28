/**
 * Tests for filter builder utilities
 */

import {
  applyFilters,
  evaluateCondition,
  filterToQueryString,
  queryStringToFilter,
} from '@utils/filter-builder';

describe('Filter Builder', () => {
  describe('evaluateCondition', () => {
    it('should evaluate equals operator', () => {
      const item = { status: 'active' };
      const condition = { field: 'status', operator: 'equals' as const, value: 'active', id: '1' };

      expect(evaluateCondition(item, condition)).toBe(true);
    });

    it('should evaluate contains operator', () => {
      const item = { name: 'John Doe' };
      const condition = { field: 'name', operator: 'contains' as const, value: 'John', id: '1' };

      expect(evaluateCondition(item, condition)).toBe(true);
    });

    it('should evaluate gt operator', () => {
      const item = { age: 25 };
      const condition = { field: 'age', operator: 'gt' as const, value: 20, id: '1' };

      expect(evaluateCondition(item, condition)).toBe(true);
    });

    it('should evaluate in operator', () => {
      const item = { status: 'active' };
      const condition = {
        field: 'status',
        operator: 'in' as const,
        value: ['active', 'pending'],
        id: '1',
      };

      expect(evaluateCondition(item, condition)).toBe(true);
    });

    it('should handle null values', () => {
      const item = { description: null };
      const condition = { field: 'description', operator: 'equals' as const, value: null, id: '1' };

      expect(evaluateCondition(item, condition)).toBe(true);
    });
  });

  describe('applyFilters', () => {
    it('should apply multiple conditions', () => {
      const data = [
        { id: '1', name: 'Item 1', status: 'active' },
        { id: '2', name: 'Item 2', status: 'inactive' },
        { id: '3', name: 'Item 3', status: 'active' },
      ];

      const conditions = [
        { field: 'status', operator: 'equals' as const, value: 'active', id: '1' },
      ];

      const result = applyFilters(data, conditions);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
    });

    it('should return all items when no conditions', () => {
      const data = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];

      const result = applyFilters(data, []);

      expect(result).toEqual(data);
    });
  });

  describe('filterToQueryString', () => {
    it('should convert conditions to query string', () => {
      const conditions = [
        { field: 'status', operator: 'equals' as const, value: 'active', id: '1' },
        { field: 'name', operator: 'contains' as const, value: 'test', id: '2' },
      ];

      const query = filterToQueryString(conditions);

      expect(query).toContain('status__equals=active');
      expect(query).toContain('name__contains=test');
    });
  });

  describe('queryStringToFilter', () => {
    it('should parse query string to conditions', () => {
      const query = 'status__equals=active&name__contains=test';

      const conditions = queryStringToFilter(query);

      expect(conditions).toHaveLength(2);
      expect(conditions[0].field).toBe('status');
      expect(conditions[0].value).toBe('active');
    });
  });
});
