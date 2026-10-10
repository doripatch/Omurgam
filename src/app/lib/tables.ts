// Veritabanı tablo adları — supabase-js'e bağımlı değil; anasayfa/arama bunu Supabase paketini yüklemeden kullanır.
export const TABLES = {
  USERS: 'users',
  VIDEOS: 'videos',
  BLOG_POSTS: 'blog_posts',
  QUESTIONS: 'questions',
  ANSWERS: 'answers',
  MR_TERMS: 'mr_terms',
} as const;
