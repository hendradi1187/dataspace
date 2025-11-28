import { create } from 'zustand';

export interface UndoRedoAction {
  id: string;
  type: string;
  description: string;
  data: any;
  timestamp: number;
}

interface UndoRedoState {
  past: UndoRedoAction[];
  present: UndoRedoAction | null;
  future: UndoRedoAction[];

  // Actions
  execute: (action: UndoRedoAction) => void;
  undo: () => UndoRedoAction | null;
  redo: () => UndoRedoAction | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
  getHistory: () => UndoRedoAction[];
}

export const useUndoRedoStore = create<UndoRedoState>((set, get) => ({
  past: [],
  present: null,
  future: [],

  execute: (action: UndoRedoAction) => {
    set((state) => ({
      past: state.present ? [...state.past, state.present] : state.past,
      present: action,
      future: [],
    }));
  },

  undo: () => {
    const { past, present } = get();
    if (past.length === 0) return null;

    const newPresent = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    set((state) => ({
      past: newPast,
      present: newPresent,
      future: present ? [present, ...state.future] : state.future,
    }));

    return newPresent;
  },

  redo: () => {
    const { future, present } = get();
    if (future.length === 0) return null;

    const newPresent = future[0];
    const newFuture = future.slice(1);

    set((state) => ({
      past: present ? [...state.past, present] : state.past,
      present: newPresent,
      future: newFuture,
    }));

    return newPresent;
  },

  canUndo: () => {
    return get().past.length > 0;
  },

  canRedo: () => {
    return get().future.length > 0;
  },

  clear: () => {
    set({
      past: [],
      present: null,
      future: [],
    });
  },

  getHistory: () => {
    const state = get();
    return [...state.past, ...(state.present ? [state.present] : []), ...state.future];
  },
}));
