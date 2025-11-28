import { create } from 'zustand';

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: Record<string, any>;
  timestamp: string;
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
  resultCount?: number;
}

interface SearchState {
  searchHistory: SearchHistory[];
  savedSearches: SavedSearch[];
  recentSearches: string[];

  // History actions
  addToHistory: (query: string, resultCount?: number) => void;
  clearHistory: () => void;
  getHistory: () => SearchHistory[];

  // Saved searches actions
  saveSearch: (name: string, query: string, filters: Record<string, any>) => void;
  deleteSavedSearch: (id: string) => void;
  getSavedSearches: () => SavedSearch[];
  loadSavedSearch: (id: string) => SavedSearch | undefined;

  // Recent searches
  getRecentSearches: (limit?: number) => string[];
}

export const useSearchStore = create<SearchState>((set, get) => ({
  searchHistory: [],
  savedSearches: [],
  recentSearches: [],

  addToHistory: (query: string, resultCount?: number) => {
    if (!query.trim()) return;

    const newEntry: SearchHistory = {
      id: `${Date.now()}`,
      query,
      timestamp: new Date().toISOString(),
      resultCount,
    };

    set((state) => ({
      searchHistory: [newEntry, ...state.searchHistory].slice(0, 100), // Keep last 100
      recentSearches: [query, ...state.recentSearches].filter((q, i, arr) => arr.indexOf(q) === i).slice(0, 10),
    }));
  },

  clearHistory: () => {
    set({ searchHistory: [], recentSearches: [] });
  },

  getHistory: () => {
    return get().searchHistory;
  },

  saveSearch: (name: string, query: string, filters: Record<string, any>) => {
    const newSearch: SavedSearch = {
      id: `saved-${Date.now()}`,
      name,
      query,
      filters,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      savedSearches: [...state.savedSearches, newSearch],
    }));
  },

  deleteSavedSearch: (id: string) => {
    set((state) => ({
      savedSearches: state.savedSearches.filter((s) => s.id !== id),
    }));
  },

  getSavedSearches: () => {
    return get().savedSearches;
  },

  loadSavedSearch: (id: string) => {
    const search = get().savedSearches.find((s) => s.id === id);
    return search;
  },

  getRecentSearches: (limit = 5) => {
    return get().recentSearches.slice(0, limit);
  },
}));
