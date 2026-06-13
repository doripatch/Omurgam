import { create } from 'zustand';
import { siteSettingsAPI } from '../lib/api';
import { DEFAULT_CONTENT, type SiteContent } from '../lib/defaultContent';

// Geriye dönük uyumluluk: eski SiteSettings tipi yerine artık tam içerik tipi kullanılıyor
export type SiteSettings = SiteContent;

// İç içe nesneleri güvenli şekilde birleştiren yardımcı (varsayılan + kaydedilen)
function isPlainObject(v: any): v is Record<string, any> {
  return v && typeof v === 'object' && !Array.isArray(v);
}

function deepMerge<T>(base: T, override: any): T {
  if (!isPlainObject(base)) {
    return (override === undefined ? base : override) as T;
  }
  const result: any = Array.isArray(base) ? [...(base as any)] : { ...base };
  if (!isPlainObject(override)) return result;
  for (const key of Object.keys(override)) {
    const o = override[key];
    if (o === undefined || o === null) continue;
    if (isPlainObject((base as any)[key]) && isPlainObject(o)) {
      result[key] = deepMerge((base as any)[key], o);
    } else {
      result[key] = o;
    }
  }
  return result;
}

interface SiteSettingsStore {
  settings: SiteContent;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<SiteContent> | Record<string, any>) => Promise<void>;
}

export const useSiteSettingsStore = create<SiteSettingsStore>((set, get) => ({
  // Başlangıçta tam varsayılan içerik -> site hiçbir zaman boş görünmez
  settings: DEFAULT_CONTENT,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await siteSettingsAPI.get();
      // Kaydedilen değerleri varsayılanların üzerine yaz (eksik alanlar varsayılanla dolar)
      set({ settings: deepMerge(DEFAULT_CONTENT, data), isLoading: false });
    } catch (error) {
      console.error('Error fetching site settings:', error);
      // Hata olsa bile varsayılanlarla devam et
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  updateSettings: async (newSettings) => {
    set({ isLoading: true, error: null });
    try {
      const current = get().settings;
      const merged = deepMerge(current, newSettings);
      const data = await siteSettingsAPI.update(merged);
      set({ settings: deepMerge(DEFAULT_CONTENT, data), isLoading: false });
    } catch (error) {
      console.error('Error updating site settings:', error);
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
      throw error;
    }
  },
}));
