import { ReactNode } from 'react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, row: T) => ReactNode;
  width?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  className?: string;
}

export const Table = <T extends { id: string }>({
  data,
  columns,
  isLoading = false,
  onRowClick,
  className = '',
}: TableProps<T>) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">No data available</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-6 py-3 text-left text-sm font-semibold text-neutral-700"
                style={{ width: column.width }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id}
              className={`border-b border-neutral-200 hover:bg-neutral-50 transition-colors ${
                onRowClick ? 'cursor-pointer' : ''
              } ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => {
                const value = row[column.key as keyof T];
                return (
                  <td
                    key={String(column.key)}
                    className="px-6 py-4 text-sm text-neutral-700"
                  >
                    {column.render ? column.render(value, row) : value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
