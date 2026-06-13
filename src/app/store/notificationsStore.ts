import { create } from 'zustand';
import { notificationsAPI } from '../lib/api';

export interface Notif {
  id: string;
  title: string;
  message?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

interface NotifStore {
  items: Notif[];
  loaded: boolean;
  load: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  unreadCount: () => number;
  clear: () => void;
}

export const useNotificationsStore = create<NotifStore>((set, get) => ({
  items: [],
  loaded: false,

  load: async () => {
    try {
      const d = await notificationsAPI.getAll();
      set({ items: d.notifications || [], loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  markRead: async (id: string) => {
    set({ items: get().items.map((n) => (n.id === id ? { ...n, read: true } : n)) });
    try {
      await notificationsAPI.markRead(id);
    } catch {}
  },

  markAllRead: async () => {
    set({ items: get().items.map((n) => ({ ...n, read: true })) });
    try {
      await notificationsAPI.markRead();
    } catch {}
  },

  unreadCount: () => get().items.filter((n) => !n.read).length,

  clear: () => set({ items: [], loaded: false }),
}));
