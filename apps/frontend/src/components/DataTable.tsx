import { Search, ChevronLeft, ChevronRight, Download, RotateCcw } from 'lucide-react';
import { useTableState } from '@hooks/useTableState';
import { exportData, ExportFormat } from '@utils/export';
import { Button } from './Button';
import { useState } from 'react';

export interface DataTableProps<T extends Record<string, any>> {
  items: T[];
  columns: Array<{
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: any, item: T) => React.ReactNode;
  }>;
  title?: string;
  onRowClick?: (item: T) => void;
  pageSize?: number;
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSort?: (field: string, order: 'asc' | 'desc') => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  currentPageSize?: number;
}

export const DataTable = <T extends Record<string, any>>({
  items,
  columns,
  title,
  onRowClick,
  pageSize = 10,
  isLoading,
  currentPage: _currentPage,
  totalPages: _totalPages,
  onPageChange: _onPageChange,
  onPageSizeChange: _onPageSizeChange,
  onSort: _onSort,
  onSearch: _onSearch,
  searchQuery: _searchQuery,
  sortField: _sortField,
  sortOrder: _sortOrder,
  currentPageSize: _currentPageSize,
}: DataTableProps<T>) => {
  const table = useTableState(items, pageSize);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleSort = (key: keyof T) => {
    if (table.state.sortBy === key) {
      table.actions.setSortOrder(table.state.sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      table.actions.setSortBy(key);
      table.actions.setSortOrder('asc');
    }
  };

  const handleExport = (format: ExportFormat) => {
    const filename = title ? title.toLowerCase().replace(/\s+/g, '-') : 'export';
    exportData(table.filteredItems, format, filename);
    setShowExportMenu(false);
  };

  const getSortIcon = (key: keyof T) => {
    if (table.state.sortBy !== key) {
      return <span className="text-neutral-400 text-xs">⇅</span>;
    }
    return table.state.sortOrder === 'asc' ? (
      <span className="text-primary-600 text-xs">↑</span>
    ) : (
      <span className="text-primary-600 text-xs">↓</span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with search, export, and reset */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {title && <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={table.state.searchQuery}
              onChange={(e) => {
                table.actions.setSearchQuery(e.target.value);
                table.actions.setPage(1);
              }}
              className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Export button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center gap-2 px-3 py-2 text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              title="Export data"
            >
              <Download size={18} />
              <span className="text-sm font-medium">Export</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  JSON
                </button>
              </div>
            )}
          </div>

          {/* Reset filters */}
          {(table.state.searchQuery || table.state.sortBy) && (
            <button
              onClick={table.actions.resetFilters}
              className="inline-flex items-center gap-2 px-3 py-2 text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              title="Reset filters"
            >
              <RotateCcw size={18} />
              <span className="text-sm font-medium">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between text-sm text-neutral-600">
        <span>
          Showing {table.paginatedItems.length > 0 ? (table.currentPage - 1) * table.pageSize + 1 : 0} to{' '}
          {Math.min(table.currentPage * table.pageSize, table.totalItems)} of {table.totalItems} results
        </span>
        {table.state.searchQuery && (
          <span className="text-neutral-500">
            Filtered from {table.state.items.length} total items
          </span>
        )}
      </div>

      {/* Table */}
      <div className={`overflow-x-auto border border-neutral-200 rounded-lg relative ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-4 py-3 text-left text-sm font-semibold text-neutral-900 ${
                    column.sortable ? 'cursor-pointer hover:bg-neutral-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.paginatedItems.length > 0 ? (
              table.paginatedItems.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => onRowClick?.(item)}
                  className={`border-b border-neutral-200 ${
                    onRowClick ? 'cursor-pointer hover:bg-neutral-50' : ''
                  } transition-colors`}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-4 py-3 text-sm text-neutral-700"
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : String(item[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-neutral-500"
                >
                  {isLoading ? 'Loading...' : 'No items found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
            <div className="text-center">
              <div className="inline-block animate-spin h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full"></div>
              <p className="mt-2 text-sm text-neutral-600">Loading...</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {table.totalPages > 1 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-600">Items per page:</label>
            <select
              value={table.pageSize}
              onChange={(e) => {
                table.actions.setPageSize(Number(e.target.value));
                table.actions.setPage(1);
              }}
              className="px-2 py-1 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.actions.setPage(table.currentPage - 1)}
              disabled={!table.hasPrevPage}
              className="inline-flex items-center gap-2 px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, table.totalPages) }, (_, i) => {
                let page = i + 1;
                if (table.totalPages > 5) {
                  if (table.currentPage <= 3) {
                    page = i + 1;
                  } else if (table.currentPage >= table.totalPages - 2) {
                    page = table.totalPages - 4 + i;
                  } else {
                    page = table.currentPage - 2 + i;
                  }
                }

                return (
                  <button
                    key={page}
                    onClick={() => table.actions.setPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      table.currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'border border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => table.actions.setPage(table.currentPage + 1)}
              disabled={!table.hasNextPage}
              className="inline-flex items-center gap-2 px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>

            <span className="text-sm text-neutral-600">
              Page {table.currentPage} of {table.totalPages}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
