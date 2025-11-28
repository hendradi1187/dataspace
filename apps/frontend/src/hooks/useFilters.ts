import { useState, useEffect } from 'react';
import {
  FilterCondition,
  SavedFilter,
  FilterField,
  applyFilters,
  filterToQueryString,
  queryStringToFilter,
  saveSavedFilters,
  loadSavedFilters,
  createSavedFilter,
  updateSavedFilter,
  deleteSavedFilter,
} from '@utils/filter-builder';

interface UseFiltersOptions {
  storageKey?: string;
  defaultFilters?: FilterCondition[];
}

export function useFilters(options: UseFiltersOptions = {}) {
  const { storageKey = 'defaultFilters', defaultFilters = [] } = options;

  const [conditions, setConditions] = useState<FilterCondition[]>(defaultFilters);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  // Load saved filters from localStorage on mount
  useEffect(() => {
    const loaded = loadSavedFilters(storageKey);
    setSavedFilters(loaded);
  }, [storageKey]);

  const addCondition = (condition: Omit<FilterCondition, 'id'>) => {
    setConditions((prev) => [
      ...prev,
      {
        ...condition,
        id: Math.random().toString(36).substr(2, 9),
      },
    ]);
  };

  const removeCondition = (id: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const clearConditions = () => {
    setConditions([]);
  };

  const applyCurrentFilters = <T extends Record<string, any>>(
    data: T[]
  ): T[] => {
    return applyFilters(data, conditions);
  };

  const saveCurrentAsFilter = (name: string, description?: string) => {
    const newFilter = createSavedFilter(name, conditions, description);
    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    saveSavedFilters(updated, storageKey);
    return newFilter;
  };

  const loadSavedFilter = (filter: SavedFilter) => {
    setConditions(filter.conditions.map((c) => ({ ...c })));
  };

  const updateFilter = (filterId: string, updates: Partial<SavedFilter>) => {
    setSavedFilters((prev) =>
      prev.map((f) =>
        f.id === filterId ? updateSavedFilter(f, updates) : f
      )
    );
  };

  const deleteFilter = (filterId: string) => {
    const updated = deleteSavedFilter(savedFilters, filterId);
    setSavedFilters(updated);
    saveSavedFilters(updated, storageKey);
  };

  const exportAsQueryString = (): string => {
    return filterToQueryString(conditions);
  };

  const importFromQueryString = (queryString: string) => {
    const parsed = queryStringToFilter(queryString);
    setConditions(parsed);
  };

  return {
    // Current filters
    conditions,
    addCondition,
    removeCondition,
    updateCondition,
    clearConditions,

    // Apply filters
    applyCurrentFilters,
    exportAsQueryString,
    importFromQueryString,

    // Saved filters
    savedFilters,
    saveCurrentAsFilter,
    loadSavedFilter,
    updateFilter,
    deleteFilter,
  };
}
