import { create } from 'zustand';

export interface RecentItem {
  id: string;
  title: string;
  type: 'participant' | 'dataset' | 'schema' | 'vocabulary' | 'policy' | 'contract' | 'compliance' | 'transaction' | 'clearing' | 'app' | 'connector';
  path: string;
  timestamp: string;
}

interface RecentItemsState {
  items: RecentItem[];

  // Actions
  addRecentItem: (item: Omit<RecentItem, 'id' | 'timestamp'>) => void;
  getRecentItems: (limit?: number) => RecentItem[];
  getRecentItemsByType: (type: RecentItem['type'], limit?: number) => RecentItem[];
  clearRecentItems: () => void;
  removeRecentItem: (id: string) => void;
}

export const useRecentItemsStore = create<RecentItemsState>((set, get) => ({
  items: [],

  addRecentItem: (item: Omit<RecentItem, 'id' | 'timestamp'>) => {
    const newItem: RecentItem = {
      ...item,
      id: `${item.type}-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    set((state) => {
      // Remove duplicate if it exists, then add new one to beginning
      const filtered = state.items.filter((i) => !(i.type === item.type && i.path === item.path));
      return {
        items: [newItem, ...filtered].slice(0, 50), // Keep last 50
      };
    });
  },

  getRecentItems: (limit = 10) => {
    return get().items.slice(0, limit);
  },

  getRecentItemsByType: (type: RecentItem['type'], limit = 5) => {
    return get().items.filter((item) => item.type === type).slice(0, limit);
  },

  clearRecentItems: () => {
    set({ items: [] });
  },

  removeRecentItem: (id: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
}));
