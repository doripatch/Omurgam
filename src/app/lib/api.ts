import { projectId, publicAnonKey } from '/utils/supabase/info';
import { supabase } from './supabase';

// DEVELOPMENT: Use hardcoded project ID
// PRODUCTION: Will be overridden by environment variables
const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/server`;
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper to get auth token
const getAuthToken = async () => {
  try {
    // Get session from Supabase - wait for it to be ready
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      console.log('✅ Auth token found (first 30 chars):', session.access_token.substring(0, 30) + '...');
      console.log('✅ Auth token length:', session.access_token.length);
      return session.access_token;
    } else {
      console.log('❌ No auth token found in session');
      // Try to refresh session
      const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
      if (refreshedSession?.access_token) {
        console.log('✅ Auth token refreshed');
        return refreshedSession.access_token;
      }
      return null;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper to make authenticated requests
const makeRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = await getAuthToken();
  
  // Always send ANON_KEY in Authorization header for Supabase Edge Functions
  // Send user token in custom X-User-Token header if available
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
    ...(token && { 'X-User-Token': token }),
    ...options.headers,
  };

  try {
    console.log(`🌐 API Request: ${endpoint}`);
    console.log(`🔑 Has user token: ${!!token}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log(`📡 API Response (${endpoint}):`, response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP ${response.status}: ${response.statusText}` 
      }));
      console.error(`❌ API Error (${endpoint}):`, errorData);
      throw new Error(errorData.error || errorData.details || errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ API Success (${endpoint}):`, data);
    return data;
  } catch (error) {
    console.error(`❌ API Request failed (${endpoint}):`, error);
    throw error;
  }
};

// Auth API (placeholder - Supabase handles auth directly)
export const authAPI = {
  // Sign up new user
  signup: async (email: string, password: string, name: string) => {
    try {
      console.log('🔐 Signup attempt:', email);
      
      // Call backend signup endpoint with ANON_KEY
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      console.log('✅ Signup successful:', data);
      return data;
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      throw error;
    }
  },

  // Sign in existing user
  signin: async (email: string, password: string) => {
    try {
      console.log('🔐 Signin attempt:', email);
      
      // Debug: Check Supabase configuration
      console.log('🔍 Supabase URL:', `https://${projectId}.supabase.co`);
      console.log('🔍 Anon Key length:', publicAnonKey.length);
      console.log('🔍 Anon Key first 50 chars:', publicAnonKey.substring(0, 50));
      
      // USE DIRECT SUPABASE AUTH - BYPASS BACKEND!
      console.log('✨ Using direct Supabase Auth (bypassing backend)');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Supabase Auth error:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error status:', error.status);
        throw new Error(error.message);
      }

      if (!data.session || !data.user) {
        console.error('❌ No session/user returned from Supabase');
        throw new Error('Login failed - no session created');
      }

      console.log('✅ Supabase Auth successful!');
      console.log('👤 User ID:', data.user.id);
      console.log('📧 User email:', data.user.email);
      console.log('🔑 Session token length:', data.session.access_token.length);

      // Get user metadata from Supabase user
      const role = data.user.user_metadata?.role || 'user';
      const name = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User';

      console.log('👤 User role:', role);
      console.log('👤 User name:', name);

      // Return user data in expected format
      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: name,
          role: role as 'user' | 'admin',
        },
        session: data.session,
      };
    } catch (error: any) {
      console.error('❌ Signin error:', error);
      throw error;
    }
  },

  // Sign out current user
  signout: async () => {
    try {
      console.log('🔐 Signout attempt');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Signout error:', error);
        throw error;
      }

      console.log('✅ Signout successful');
    } catch (error: any) {
      console.error('❌ Signout error:', error);
      throw error;
    }
  },

  // Get current session
  getSession: async () => {
    try {
      console.log('🔍 Getting session from Supabase...');
      
      // Get session from Supabase - BYPASS BACKEND!
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        return null;
      }

      if (!session) {
        console.log('❌ No active session');
        return null;
      }

      console.log('✅ Active session found!');
      console.log('👤 User ID:', session.user.id);
      console.log('📧 User email:', session.user.email);

      // Get user metadata from Supabase user (bypass backend!)
      const role = session.user.user_metadata?.role || 'user';
      const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';

      console.log('👤 User role:', role);
      console.log('👤 User name:', name);

      // Return user data in expected format
      return {
        user: {
          id: session.user.id,
          email: session.user.email!,
          name: name,
          role: role as 'user' | 'admin',
        },
        session: session,
      };
    } catch (error: any) {
      console.error('❌ Get session error:', error);
      return null;
    }
  },
};

// Videos API
export const videosAPI = {
  getAll: () => makeRequest('/videos'),
  getById: (id: string) => makeRequest(`/videos/${id}`),
  create: (video: any) => makeRequest('/videos', {
    method: 'POST',
    body: JSON.stringify(video),
  }),
  update: (id: string, video: any) => makeRequest(`/videos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(video),
  }),
  delete: (id: string) => makeRequest(`/videos/${id}`, {
    method: 'DELETE',
  }),
  incrementViews: (id: string) => makeRequest(`/videos/${id}/view`, {
    method: 'POST',
  }),
  // Comments
  getComments: (id: string) => makeRequest(`/videos/${id}/comments`),
  addComment: (id: string, text: string) => makeRequest(`/videos/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  }),
  deleteComment: (videoId: string, commentId: string) => makeRequest(`/videos/${videoId}/comments/${commentId}`, {
    method: 'DELETE',
  }),
  // Likes
  toggleLike: (id: string) => makeRequest(`/videos/${id}/like`, {
    method: 'POST',
  }),
  getLikeStatus: (id: string) => makeRequest(`/videos/${id}/like-status`),
};

// Questions API
export const questionsAPI = {
  getAll: () => makeRequest('/questions'),
  getById: (id: string) => makeRequest(`/questions/${id}`),
  create: (question: any) => makeRequest('/questions', {
    method: 'POST',
    body: JSON.stringify(question),
  }),
  update: (id: string, question: any) => makeRequest(`/questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(question),
  }),
  delete: (id: string) => makeRequest(`/questions/${id}`, {
    method: 'DELETE',
  }),
  approve: (id: string) => makeRequest(`/questions/${id}/approve`, {
    method: 'POST',
  }),
  answer: (id: string, answer: string) => makeRequest(`/questions/${id}/answer`, {
    method: 'POST',
    body: JSON.stringify({ answer }),
  }),
};

// Blog API
export const blogAPI = {
  getAll: () => makeRequest('/blog'),
  getById: (id: string) => makeRequest(`/blog/${id}`),
  create: (post: any) => makeRequest('/blog', {
    method: 'POST',
    body: JSON.stringify(post),
  }),
  update: (id: string, post: any) => makeRequest(`/blog/${id}`, {
    method: 'PUT',
    body: JSON.stringify(post),
  }),
  delete: (id: string) => makeRequest(`/blog/${id}`, {
    method: 'DELETE',
  }),
  incrementViews: (id: string) => makeRequest(`/blog/${id}/view`, {
    method: 'POST',
  }),
};

// MR Terms API
export const termsAPI = {
  getAll: () => makeRequest('/terms'),
  getById: (id: string) => makeRequest(`/terms/${id}`),
  create: (term: any) => makeRequest('/terms', {
    method: 'POST',
    body: JSON.stringify(term),
  }),
  update: (id: string, term: any) => makeRequest(`/terms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(term),
  }),
  delete: (id: string) => makeRequest(`/terms/${id}`, {
    method: 'DELETE',
  }),
  search: (query: string) => makeRequest(`/terms/search?q=${encodeURIComponent(query)}`),
};

// Admin API
export const adminAPI = {
  getUsers: () => makeRequest('/admin/users'),
  updateUserRole: (userId: string, role: string) => makeRequest('/admin/users/role', {
    method: 'PUT',
    body: JSON.stringify({ userId, role }),
  }),
  deleteUser: (userId: string) => makeRequest(`/admin/users/${userId}`, {
    method: 'DELETE',
  }),
};

// Site Settings API
export const siteSettingsAPI = {
  get: () => makeRequest('/site-settings'),
  update: (settings: any) => makeRequest('/site-settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }),
};

// Health check
export const healthCheck = () => makeRequest('/health');

// Seed database
export const seedDatabase = () => makeRequest('/seed');

// Debug endpoint
export const debugAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/debug`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Debug API error:', error);
    throw error;
  }
};