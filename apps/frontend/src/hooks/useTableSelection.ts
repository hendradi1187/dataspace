import { useState, useCallback } from 'react';

export interface SelectionState {
  selectedIds: Set<string>;
  isAllSelected: boolean;
}

export interface SelectionActions {
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: () => void;
  toggleSelectAll: (ids: string[]) => void;
  isSelected: (id: string) => boolean;
  getSelectedIds: () => string[];
  getSelectedCount: () => number;
}

export interface UseTableSelectionResult {
  selection: SelectionState;
  actions: SelectionActions;
}

export const useTableSelection = (): UseTableSelectionResult => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setIsAllSelected(false);
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
    setIsAllSelected(true);
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
    setIsAllSelected(false);
  }, []);

  const toggleSelectAll = useCallback((ids: string[]) => {
    if (isAllSelected || selectedIds.size > 0) {
      deselectAll();
    } else {
      selectAll(ids);
    }
  }, [isAllSelected, selectedIds.size, selectAll, deselectAll]);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const getSelectedIds = useCallback(() => Array.from(selectedIds), [selectedIds]);

  const getSelectedCount = useCallback(() => selectedIds.size, [selectedIds]);

  return {
    selection: {
      selectedIds,
      isAllSelected,
    },
    actions: {
      toggleSelect,
      selectAll,
      deselectAll,
      toggleSelectAll,
      isSelected,
      getSelectedIds,
      getSelectedCount,
    },
  };
};
