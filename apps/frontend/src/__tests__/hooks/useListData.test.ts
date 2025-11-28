/**
 * Tests for useListData hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useListData } from '@hooks/useListData';

describe('useListData Hook', () => {
  const mockData = [
    { id: '1', name: 'Item 1', status: 'active' },
    { id: '2', name: 'Item 2', status: 'inactive' },
    { id: '3', name: 'Item 3', status: 'active' },
  ];

  const mockFetchFunction = jest.fn(async (params) => {
    return {
      data: mockData,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      total: mockData.length,
      totalPages: 1,
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useListData(mockFetchFunction, { pageSize: 10 })
    );

    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.currentPageSize).toBe(10);
  });

  it('should fetch data on mount', async () => {
    const { result } = renderHook(() =>
      useListData(mockFetchFunction, { pageSize: 10 })
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });
  });

  it('should handle page changes', async () => {
    const { result } = renderHook(() =>
      useListData(mockFetchFunction, { pageSize: 10 })
    );

    await act(async () => {
      result.current.handlePageChange(2);
    });

    expect(mockFetchFunction).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 })
    );
  });

  it('should handle search', async () => {
    const { result } = renderHook(() =>
      useListData(mockFetchFunction, { pageSize: 10 })
    );

    await act(async () => {
      result.current.handleSearch('test');
    });

    expect(result.current.searchQuery).toBe('test');
  });

  it('should handle sorting', async () => {
    const { result } = renderHook(() =>
      useListData(mockFetchFunction, { pageSize: 10 })
    );

    await act(async () => {
      result.current.handleSort('name', 'asc');
    });

    expect(result.current.sortField).toBe('name');
    expect(result.current.sortOrder).toBe('asc');
  });

  it('should handle page size changes', async () => {
    const { result } = renderHook(() =>
      useListData(mockFetchFunction, { pageSize: 10 })
    );

    await act(async () => {
      result.current.handlePageSizeChange(20);
    });

    expect(result.current.currentPageSize).toBe(20);
  });
});
