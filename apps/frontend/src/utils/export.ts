/**
 * Export utilities for data tables
 */

export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  filename: string = 'export.csv'
) => {
  if (data.length === 0) return;

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = <T extends Record<string, any>>(
  data: T[],
  filename: string = 'export.json'
) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToXLSX = <T extends Record<string, any>>(
  data: T[],
  filename: string = 'export.xlsx'
) => {
  if (data.length === 0) return;

  // For now, we'll use a simple approach - can be enhanced with xlsx library
  // Convert to CSV and let user open in Excel
  exportToCSV(data, filename.replace('.xlsx', '.csv'));
};

export type ExportFormat = 'csv' | 'json' | 'xlsx';

export const exportData = <T extends Record<string, any>>(
  data: T[],
  format: ExportFormat = 'csv',
  filename: string = 'export'
) => {
  const timestampedFilename = `${filename}-${new Date().toISOString().split('T')[0]}`;

  switch (format) {
    case 'csv':
      exportToCSV(data, `${timestampedFilename}.csv`);
      break;
    case 'json':
      exportToJSON(data, `${timestampedFilename}.json`);
      break;
    case 'xlsx':
      exportToXLSX(data, `${timestampedFilename}.xlsx`);
      break;
    default:
      exportToCSV(data, `${timestampedFilename}.csv`);
  }
};
