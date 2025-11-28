/**
 * Data Export Utilities - CSV and JSON export functionality
 */

export interface ExportOptions {
  filename?: string;
  columns?: string[];
}

/**
 * Export data to CSV format
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = {}
) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const { filename = 'export.csv', columns } = options;

  // Determine columns to export
  const keys = columns || Object.keys(data[0]);

  // Create CSV header
  const header = keys.map((key) => `"${key}"`).join(',');

  // Create CSV rows
  const rows = data.map((item) =>
    keys
      .map((key) => {
        const value = item[key];
        // Escape quotes and wrap in quotes
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        return `"${stringValue.replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  // Combine header and rows
  const csv = [header, ...rows].join('\n');

  // Create blob and download
  downloadFile(csv, `${filename}`, 'text/csv;charset=utf-8;');
};

/**
 * Export data to JSON format
 */
export const exportToJSON = <T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = {}
) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const { filename = 'export.json', columns } = options;

  // Filter columns if specified
  let exportData = data;
  if (columns) {
    exportData = data.map((item) => {
      const filtered: Record<string, any> = {};
      columns.forEach((col) => {
        filtered[col] = item[col];
      });
      return filtered;
    });
  }

  const json = JSON.stringify(exportData, null, 2);
  downloadFile(json, filename, 'application/json;charset=utf-8;');
};

/**
 * Export data to JSONL (JSON Lines) format - one JSON object per line
 */
export const exportToJSONL = <T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = {}
) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const { filename = 'export.jsonl', columns } = options;

  let exportData = data;
  if (columns) {
    exportData = data.map((item) => {
      const filtered: Record<string, any> = {};
      columns.forEach((col) => {
        filtered[col] = item[col];
      });
      return filtered;
    });
  }

  const jsonl = exportData.map((item) => JSON.stringify(item)).join('\n');
  downloadFile(jsonl, filename, 'application/jsonl;charset=utf-8;');
};

/**
 * Export multiple records with selection
 */
export const exportSelectedRecords = <T extends Record<string, any>>(
  allData: T[],
  selectedIds: string[],
  idField: string = 'id',
  format: 'csv' | 'json' | 'jsonl' = 'csv',
  options: ExportOptions = {}
) => {
  const selectedData = allData.filter((item) =>
    selectedIds.includes(String(item[idField]))
  );

  if (selectedData.length === 0) {
    console.warn('No records selected for export');
    return;
  }

  switch (format) {
    case 'csv':
      exportToCSV(selectedData, options);
      break;
    case 'json':
      exportToJSON(selectedData, options);
      break;
    case 'jsonl':
      exportToJSONL(selectedData, options);
      break;
  }
};

/**
 * Helper function to create and trigger file download
 */
export const downloadFile = (
  content: string,
  filename: string,
  mimeType: string
) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate a timestamp suffix for filenames
 */
export const getTimestampedFilename = (baseFilename: string): string => {
  const timestamp = new Date().toISOString().slice(0, 10);
  const [name, ext] = baseFilename.split('.');
  return `${name}_${timestamp}.${ext}`;
};
