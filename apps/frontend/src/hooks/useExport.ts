import { useState } from 'react';
import {
  exportToCSV,
  exportToJSON,
  exportToJSONL,
  exportSelectedRecords,
  getTimestampedFilename,
} from '@utils/data-export';

interface UseExportOptions {
  idField?: string;
  entityName?: string;
}

export function useExport<T extends Record<string, any>>(
  options: UseExportOptions = {}
) {
  const { idField = 'id', entityName = 'data' } = options;
  const [isExporting, setIsExporting] = useState(false);

  const exportAll = async (
    data: T[],
    format: 'csv' | 'json' | 'jsonl' = 'csv',
    columns?: string[]
  ) => {
    setIsExporting(true);
    try {
      const filename = getTimestampedFilename(`${entityName}.${format}`);

      switch (format) {
        case 'csv':
          exportToCSV(data, { filename, columns });
          break;
        case 'json':
          exportToJSON(data, { filename, columns });
          break;
        case 'jsonl':
          exportToJSONL(data, { filename, columns });
          break;
      }
    } finally {
      setIsExporting(false);
    }
  };

  const exportSelected = async (
    allData: T[],
    selectedIds: string[],
    format: 'csv' | 'json' | 'jsonl' = 'csv',
    columns?: string[]
  ) => {
    if (selectedIds.length === 0) {
      console.warn('No items selected for export');
      return;
    }

    setIsExporting(true);
    try {
      const filename = getTimestampedFilename(`${entityName}-selected.${format}`);

      exportSelectedRecords(allData, selectedIds, idField, format, {
        filename,
        columns,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportAll,
    exportSelected,
  };
}
