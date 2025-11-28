import { useState, useMemo, useCallback } from 'react';

export interface TableState<T> {
  items: T[];
  searchQuery: string;
  sortBy: keyof T | null;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface TableActions<T> {
  setSearchQuery: (query: string) => void;
  setSortBy: (key: keyof T | null) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  resetFilters: () => void;
}

export interface TableResult<T> {
  filteredItems: T[];
  paginatedItems: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  state: TableState<T>;
  actions: TableActions<T>;
}

export const useTableState = <T extends Record<string, any>>(
  items: T[],
  initialPageSize: number = 10
): TableResult<T> => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(query)
        )
      );
    }

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [items, searchQuery, sortBy, sortOrder]);

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Ensure page is within valid range
  const validPage = Math.min(page, Math.max(1, totalPages));

  const paginatedItems = useMemo(() => {
    const startIdx = (validPage - 1) * pageSize;
    return filteredItems.slice(startIdx, startIdx + pageSize);
  }, [filteredItems, validPage, pageSize]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSortBy(null);
    setSortOrder('asc');
    setPage(1);
  }, []);

  return {
    filteredItems,
    paginatedItems,
    totalItems,
    totalPages,
    currentPage: validPage,
    pageSize,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1,
    state: {
      items,
      searchQuery,
      sortBy,
      sortOrder,
      page: validPage,
      pageSize,
    },
    actions: {
      setSearchQuery,
      setSortBy,
      setSortOrder,
      setPage,
      setPageSize,
      resetFilters,
    },
  };
};
