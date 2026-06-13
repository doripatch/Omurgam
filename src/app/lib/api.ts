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
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      return session.access_token;
    } else {
      const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
      if (refreshedSession?.access_token) {
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
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
    ...(token && { 'X-User-Token': token }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`
      }));
      console.error(`API Error (${endpoint}):`, errorData);
      throw new Error(errorData.error || errorData.details || errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ API Request failed (${endpoint}):`, error);
    throw error;
  }
};

// 🪄 SİHİRLİ DOKUNUŞ: Frontend ID'lerin başına yanlışlıkla "video_" veya "blog_" eklerse onu temizleyen kurtarıcımız
const cleanId = (id: string | number) => String(id).replace(/^(video_|blog_|question_|term_)/, '');

// Auth API 
export const authAPI = {
  signup: async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Signup failed');
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  signin: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      if (!data.session || !data.user) throw new Error('Login failed - no session created');

      const role = data.user.user_metadata?.role || 'user';
      const name = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User';

      return {
        user: { id: data.user.id, email: data.user.email!, name: name, role: role as 'user' | 'admin' },
        session: data.session,
      };
    } catch (error: any) {
      throw error;
    }
  },

  signout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      throw error;
    }
  },

  getSession: async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) return null;

      const role = session.user.user_metadata?.role || 'user';
      const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';

      return {
        user: { id: session.user.id, email: session.user.email!, name: name, role: role as 'user' | 'admin' },
        session: session,
      };
    } catch (error: any) {
      return null;
    }
  },
};

// Videos API
export const videosAPI = {
  getAll: () => makeRequest('/videos'),
  getById: (id: string) => makeRequest(`/videos/${cleanId(id)}`),
  create: (video: any) => makeRequest('/videos', {
    method: 'POST',
    body: JSON.stringify(video),
  }),
  update: (id: string, video: any) => makeRequest(`/videos/${cleanId(id)}`, {
    method: 'PUT',
    body: JSON.stringify(video),
  }),
  delete: (id: string) => makeRequest(`/videos/${cleanId(id)}`, {
    method: 'DELETE',
  }),
  // Yeni Toplu Silme Fonksiyonumuz
  bulkDelete: (ids: string[]) => makeRequest('/videos/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids: ids.map(cleanId) }),
  }),
  incrementViews: (id: string) => makeRequest(`/videos/${cleanId(id)}/view`, {
    method: 'POST',
  }),
  getComments: (id: string) => makeRequest(`/videos/${cleanId(id)}/comments`),
  addComment: (id: string, text: string) => makeRequest(`/videos/${cleanId(id)}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  }),
  deleteComment: (videoId: string, commentId: string) => makeRequest(`/videos/${cleanId(videoId)}/comments/${cleanId(commentId)}`, {
    method: 'DELETE',
  }),
  toggleLike: (id: string) => makeRequest(`/videos/${cleanId(id)}/like`, {
    method: 'POST',
  }),
  getLikeStatus: (id: string) => makeRequest(`/videos/${cleanId(id)}/like-status`),
};

// Questions API
export const questionsAPI = {
  getAll: () => makeRequest('/questions'),
  getById: (id: string) => makeRequest(`/questions/${cleanId(id)}`),
  create: (question: any) => makeRequest('/questions', {
    method: 'POST',
    body: JSON.stringify(question),
  }),
  update: (id: string, question: any) => makeRequest(`/questions/${cleanId(id)}`, {
    method: 'PUT',
    body: JSON.stringify(question),
  }),
  delete: (id: string) => makeRequest(`/questions/${cleanId(id)}`, {
    method: 'DELETE',
  }),
  approve: (id: string) => makeRequest(`/questions/${cleanId(id)}/approve`, {
    method: 'POST',
  }),
  answer: (id: string, answer: string) => makeRequest(`/questions/${cleanId(id)}/answer`, {
    method: 'POST',
    body: JSON.stringify({ answer }),
  }),
};

// Blog API
export const blogAPI = {
  getAll: () => makeRequest('/blog'),
  getById: (id: string) => makeRequest(`/blog/${cleanId(id)}`),
  create: (post: any) => makeRequest('/blog', {
    method: 'POST',
    body: JSON.stringify(post),
  }),
  update: (id: string, post: any) => makeRequest(`/blog/${cleanId(id)}`, {
    method: 'PUT',
    body: JSON.stringify(post),
  }),
  delete: (id: string) => makeRequest(`/blog/${cleanId(id)}`, {
    method: 'DELETE',
  }),
  // Yeni Toplu Silme Fonksiyonumuz
  bulkDelete: (ids: string[]) => makeRequest('/blog/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids: ids.map(cleanId) }),
  }),
  incrementViews: (id: string) => makeRequest(`/blog/${cleanId(id)}/view`, {
    method: 'POST',
  }),
};

// MR Terms API
export const termsAPI = {
  getAll: () => makeRequest('/terms'),
  getById: (id: string) => makeRequest(`/terms/${cleanId(id)}`),
  create: (term: any) => makeRequest('/terms', {
    method: 'POST',
    body: JSON.stringify(term),
  }),
  update: (id: string, term: any) => makeRequest(`/terms/${cleanId(id)}`, {
    method: 'PUT',
    body: JSON.stringify(term),
  }),
  delete: (id: string) => makeRequest(`/terms/${cleanId(id)}`, {
    method: 'DELETE',
  }),
  search: (query: string) => makeRequest(`/terms/search?q=${encodeURIComponent(query)}`),
};

// Sağlık Sözlüğü (Genel Tıbbi & Tedavi Terimleri) API
export const medicalTermsAPI = {
  getAll: () => makeRequest('/medical-terms'),
  getById: (id: string) => makeRequest(`/medical-terms/${cleanId(id)}`),
  create: (term: any) => makeRequest('/medical-terms', {
    method: 'POST',
    body: JSON.stringify(term),
  }),
  update: (id: string, term: any) => makeRequest(`/medical-terms/${cleanId(id)}`, {
    method: 'PUT',
    body: JSON.stringify(term),
  }),
  delete: (id: string) => makeRequest(`/medical-terms/${cleanId(id)}`, {
    method: 'DELETE',
  }),
  search: (query: string) => makeRequest(`/medical-terms/search?q=${encodeURIComponent(query)}`),
};

// Favoriler API (kullanıcıya özel)
export const favoritesAPI = {
  getAll: () => makeRequest('/favorites'),
  add: (type: string, itemId: string, title: string) => makeRequest('/favorites', {
    method: 'POST',
    body: JSON.stringify({ type, itemId, title }),
  }),
  remove: (type: string, itemId: string) => makeRequest('/favorites', {
    method: 'DELETE',
    body: JSON.stringify({ type, itemId }),
  }),
};

// Randevu / Danışma Talepleri API
export const appointmentsAPI = {
  send: (data: { name: string; phone: string; email?: string; subject?: string; preferredDate?: string; message?: string }) =>
    makeRequest('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => makeRequest('/appointments'),
  update: (id: string, data: any) => makeRequest(`/appointments/${cleanId(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => makeRequest(`/appointments/${cleanId(id)}`, { method: 'DELETE' }),
};

// E-bülten API
export const newsletterAPI = {
  subscribe: (email: string) => makeRequest('/newsletter', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  getAll: () => makeRequest('/newsletter'),
  delete: (id: string) => makeRequest(`/newsletter/${cleanId(id)}`, { method: 'DELETE' }),
};

// İletişim Mesajları API
export const contactAPI = {
  send: (msg: { name: string; email: string; subject: string; message: string }) =>
    makeRequest('/contact-messages', { method: 'POST', body: JSON.stringify(msg) }),
  getAll: () => makeRequest('/contact-messages'),
  markRead: (id: string) => makeRequest(`/contact-messages/${cleanId(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ read: true }),
  }),
  delete: (id: string) => makeRequest(`/contact-messages/${cleanId(id)}`, { method: 'DELETE' }),
};

// SSS (Sıkça Sorulan Sorular) API
export const faqAPI = {
  getAll: () => makeRequest('/faq'),
  getById: (id: string) => makeRequest(`/faq/${cleanId(id)}`),
  create: (item: any) => makeRequest('/faq', {
    method: 'POST',
    body: JSON.stringify(item),
  }),
  update: (id: string, item: any) => makeRequest(`/faq/${cleanId(id)}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  }),
  delete: (id: string) => makeRequest(`/faq/${cleanId(id)}`, {
    method: 'DELETE',
  }),
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