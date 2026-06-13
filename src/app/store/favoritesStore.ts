import { create } from 'zustand';
import { favoritesAPI } from '../lib/api';

export interface FavItem {
  type: string;
  itemId: string;
  title: string;
  createdAt?: string;
}

interface FavoritesStore {
  items: FavItem[];
  loaded: boolean;
  load: () => Promise<void>;
  isFavorite: (type: string, id: string) => boolean;
  toggle: (type: string, id: string, title: string) => Promise<boolean>;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  items: [],
  loaded: false,

  load: async () => {
    try {
      const d = await favoritesAPI.getAll();
      set({ items: d.favorites || [], loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  isFavorite: (type, id) => get().items.some((i) => i.type === type && i.itemId === id),

  toggle: async (type, id, title) => {
    const has = get().isFavorite(type, id);
    if (has) {
      const d = await favoritesAPI.remove(type, id);
      set({ items: d.favorites || [] });
      return false;
    } else {
      const d = await favoritesAPI.add(type, id, title);
      set({ items: d.favorites || [] });
      return true;
    }
  },

  clear: () => set({ items: [], loaded: false }),
}));
