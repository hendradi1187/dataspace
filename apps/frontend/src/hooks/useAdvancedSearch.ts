import { useMemo } from 'react';
import { useSearchStore } from '@stores/search-store';

export interface SearchableItem {
  id: string;
  title: string;
  description?: string;
  type: string;
  category?: string;
  tags?: string[];
  [key: string]: any;
}

export interface AdvancedSearchOptions {
  searchFields?: string[]; // Fields to search in (title, description, etc)
  matchMode?: 'exact' | 'partial' | 'fuzzy';
  caseSensitive?: boolean;
}

export const useAdvancedSearch = (
  items: SearchableItem[],
  query: string,
  filters?: Record<string, any>,
  options: AdvancedSearchOptions = {}
) => {
  const { matchMode = 'partial', caseSensitive = false, searchFields = ['title', 'description'] } = options;
  const { addToHistory } = useSearchStore();

  const results = useMemo(() => {
    if (!query.trim()) return items;

    const searchQuery = caseSensitive ? query : query.toLowerCase();

    return items.filter((item) => {
      // Text search
      const matchesSearch = searchFields.some((field) => {
        const fieldValue = item[field];
        if (!fieldValue) return false;

        const stringValue = caseSensitive ? String(fieldValue) : String(fieldValue).toLowerCase();

        if (matchMode === 'exact') {
          return stringValue === searchQuery;
        } else if (matchMode === 'fuzzy') {
          // Simple fuzzy matching
          let searchIdx = 0;
          for (let i = 0; i < stringValue.length && searchIdx < searchQuery.length; i++) {
            if (stringValue[i] === searchQuery[searchIdx]) {
              searchIdx++;
            }
          }
          return searchIdx === searchQuery.length;
        } else {
          // partial (default)
          return stringValue.includes(searchQuery);
        }
      });

      if (!matchesSearch) return false;

      // Apply filters
      if (filters) {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true; // Skip empty filters

          const itemValue = item[key];

          if (typeof value === 'boolean') {
            return itemValue === value;
          }

          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }

          return String(itemValue).toLowerCase() === String(value).toLowerCase();
        });
      }

      return true;
    });
  }, [items, query, filters, matchMode, caseSensitive, searchFields]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      addToHistory(searchQuery, results.length);
    }
  };

  return {
    results,
    resultCount: results.length,
    performSearch: handleSearch,
  };
};
