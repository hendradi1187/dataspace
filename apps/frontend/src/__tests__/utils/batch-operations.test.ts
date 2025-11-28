/**
 * Tests for batch operations utilities
 */

import {
  performBatchDelete,
  performBatchStatusUpdate,
  areAllSelected,
  getSelectedItems,
} from '@utils/batch-operations';

describe('Batch Operations', () => {
  describe('performBatchDelete', () => {
    it('should delete multiple items successfully', async () => {
      const mockDelete = jest.fn(async () => {});
      const ids = ['1', '2', '3'];

      const result = await performBatchDelete(ids, mockDelete);

      expect(result.successful).toBe(3);
      expect(result.failed).toBe(0);
      expect(mockDelete).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures', async () => {
      const mockDelete = jest.fn(async (id: string) => {
        if (id === '2') throw new Error('Delete failed');
      });
      const ids = ['1', '2', '3'];

      const result = await performBatchDelete(ids, mockDelete);

      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors.has('2')).toBe(true);
    });

    it('should call onProgress callback', async () => {
      const mockDelete = jest.fn(async () => {});
      const onProgress = jest.fn();
      const ids = ['1', '2', '3'];

      await performBatchDelete(ids, mockDelete, { onProgress });

      expect(onProgress).toHaveBeenCalledWith(1, 3);
      expect(onProgress).toHaveBeenCalledWith(2, 3);
      expect(onProgress).toHaveBeenCalledWith(3, 3);
    });
  });

  describe('performBatchStatusUpdate', () => {
    it('should update status for multiple items', async () => {
      const mockUpdate = jest.fn(async () => {});
      const ids = ['1', '2', '3'];

      const result = await performBatchStatusUpdate(
        ids,
        'active',
        mockUpdate
      );

      expect(result.successful).toBe(3);
      expect(result.failed).toBe(0);
      expect(mockUpdate).toHaveBeenCalledWith('1', 'active');
    });
  });

  describe('areAllSelected', () => {
    it('should return true if all items are selected', () => {
      const items = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const selectedIds = ['1', '2', '3'];

      expect(areAllSelected(items, selectedIds)).toBe(true);
    });

    it('should return false if not all items are selected', () => {
      const items = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const selectedIds = ['1', '2'];

      expect(areAllSelected(items, selectedIds)).toBe(false);
    });

    it('should return false if items array is empty', () => {
      const items: any[] = [];
      const selectedIds = ['1'];

      expect(areAllSelected(items, selectedIds)).toBe(false);
    });
  });

  describe('getSelectedItems', () => {
    it('should return only selected items', () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
      ];
      const selectedIds = ['1', '3'];

      const result = getSelectedItems(items, selectedIds);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
    });
  });
});
