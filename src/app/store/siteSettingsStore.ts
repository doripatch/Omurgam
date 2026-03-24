import { create } from 'zustand';
import { siteSettingsAPI } from '../lib/api';

export interface SiteSettings {
  // Genel Ayarlar
  siteName: string;
  siteTagline: string;
  logoText: string;
  
  // İletişim Bilgileri
  email: string;
  phone: string;
  address: string;
  
  // Sosyal Medya
  instagram: string;
  youtube: string;
  linkedin: string;
  facebook: string;
  twitter: string;
  
  // Ana Sayfa
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  
  // Hakkımda
  aboutTitle: string;
  aboutContent: string;
  
  // Footer
  footerAbout: string;
  footerDisclaimer: string;
  footerCopyright: string;
  
  // Yasal Sayfalar
  privacyPolicy: string;
  termsOfService: string;
  
  // SEO
  metaDescription: string;
  metaKeywords: string;
}

interface SiteSettingsStore {
  settings: SiteSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<SiteSettings>) => Promise<void>;
}

export const useSiteSettingsStore = create<SiteSettingsStore>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await siteSettingsAPI.get();
      set({ settings: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching site settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      });
    }
  },

  updateSettings: async (newSettings: Partial<SiteSettings>) => {
    set({ isLoading: true, error: null });
    try {
      const currentSettings = get().settings || {};
      const updatedSettings = { ...currentSettings, ...newSettings };
      const data = await siteSettingsAPI.update(updatedSettings);
      set({ settings: data, isLoading: false });
    } catch (error) {
      console.error('Error updating site settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      });
    }
  },
}));