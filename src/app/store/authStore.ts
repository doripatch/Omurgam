import { create } from 'zustand';
import { authAPI } from '../lib/api';
import type { Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  
  // Actions
  signup: (email: string, password: string, name: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,

  signup: async (email: string, password: string, name: string) => {
    try {
      await authAPI.signup(email, password, name);
      // Don't auto-login after signup - redirect to login page
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  signin: async (email: string, password: string) => {
    try {
      const data = await authAPI.signin(email, password);
      
      // Check if signin returned valid data
      if (!data || !data.user) {
        throw new Error('Giriş başarısız - kullanıcı bilgisi alınamadı');
      }
      
      set({
        user: data.user,
        session: data.session,
        isAuthenticated: true,
        isAdmin: data.user.role === 'admin',
      });
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  },

  signout: async () => {
    try {
      await authAPI.signout();
      
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isAdmin: false,
      });
    } catch (error) {
      console.error('Signout error:', error);
      // Clear local state even if API call fails
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isAdmin: false,
      });
    }
  },

  checkSession: async () => {
    try {
      set({ isLoading: true });
      
      const data = await authAPI.getSession();
      
      // Check if data exists and has user
      if (data && data.user) {
        set({
          user: data.user,
          session: data.session,
          isAuthenticated: true,
          isAdmin: data.user.role === 'admin',
          isLoading: false,
        });
      } else {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Session check error:', error);
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      });
    }
  },
}));