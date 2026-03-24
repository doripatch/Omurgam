// Supabase client configuration for Omurgam
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import type { Session } from '@supabase/supabase-js';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Create a single supabase client for interacting with your database
// with persistent session storage
export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Create an authenticated client with session
export const createAuthenticatedClient = (session: Session | null) => {
  const client = createClient(supabaseUrl, publicAnonKey);
  
  if (session) {
    // Set the session on the client
    client.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
  }
  
  return client;
};

// Database table names (for type safety)
export const TABLES = {
  USERS: 'users',
  VIDEOS: 'videos',
  BLOG_POSTS: 'blog_posts',
  QUESTIONS: 'questions',
  ANSWERS: 'answers',
  MR_TERMS: 'mr_terms',
} as const;