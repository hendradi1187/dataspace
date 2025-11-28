/**
 * Reusable hook untuk list pages dengan pagination, search, sorting
 * Mengurangi code duplication di semua pages
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PaginatedResponse } from '@types';

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface UseListDataOptions {
  pageSize?: number;
  debounceMs?: number;
}

export function useListData<T>(
  fetchFn: (params: ListParams) => Promise<PaginatedResponse<T>>,
  options: UseListDataOptions = {}
) {
  const { pageSize = 10, debounceMs = 500 } = options;

  // Use ref to store fetchFn to avoid dependency issues
  const fetchFnRef = useRef(fetchFn);

  // Update ref when fetchFn changes
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch data whenever filters change
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchFnRef.current({
        page: currentPage,
        pageSize: currentPageSize,
        search: searchQuery || undefined,
        sort: sortField || undefined,
        order: sortOrder,
      });

      setData(response.data);
      setTotalItems(response.total);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load data';
      setError(message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentPageSize, searchQuery, sortField, sortOrder]);

  // Auto-fetch on mount and dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle search with debounce
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);

      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Debounce the fetch
      const timeout = setTimeout(() => {
        setSearchQuery(query);
      }, debounceMs);

      setSearchTimeout(timeout);
    },
    [debounceMs, searchTimeout]
  );

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((size: number) => {
    setCurrentPageSize(size);
    setCurrentPage(1);
  }, []);

  // Handle sort
  const handleSort = useCallback((field: string, order: 'asc' | 'desc') => {
    setSortField(field);
    setSortOrder(order);
    setCurrentPage(1);
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    totalItems,
    currentPage,
    currentPageSize,
    searchQuery,
    sortField,
    sortOrder,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    refresh,
    totalPages: Math.ceil(totalItems / currentPageSize),
  };
}

export default useListData;
