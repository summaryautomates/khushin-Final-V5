import { create } from "zustand";
import { Product } from "@shared/schema";

interface CompareState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  clearItems: () => void;
  isInCompare: (productId: number) => boolean;
}

export const useCompare = create<CompareState>((set, get) => ({
  items: [],
  addItem: (product) => {
    set((state) => {
      if (state.items.length >= 4) {
        return state;
      }
      if (state.items.some(item => item.id === product.id)) {
        return state;
      }
      return { items: [...state.items, product] };
    });
  },
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    }));
  },
  clearItems: () => set({ items: [] }),
  isInCompare: (productId) => {
    return get().items.some(item => item.id === productId);
  },
}));
