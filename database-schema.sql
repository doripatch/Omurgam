-- ========================================
-- OMURGAM DATABASE SCHEMA
-- ========================================
-- Bu SQL'i Supabase Dashboard → SQL Editor'a yapıştır ve çalıştır
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. USERS TABLE (Supabase Auth ile entegre)
-- ========================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users are viewable by everyone" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can do anything" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- 2. VIDEOS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration TEXT,
  views INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Videos policies
CREATE POLICY "Published videos are viewable by everyone" ON public.videos
  FOR SELECT USING (published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage videos" ON public.videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- 3. BLOG POSTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Blog posts policies
CREATE POLICY "Published posts are viewable by everyone" ON public.blog_posts
  FOR SELECT USING (published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- 4. QUESTIONS TABLE (Forum)
-- ========================================
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  category TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  is_answered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Questions policies
CREATE POLICY "Questions are viewable by everyone" ON public.questions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create questions" ON public.questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions" ON public.questions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions" ON public.questions
  FOR DELETE USING (auth.uid() = user_id);

-- Admin can manage all questions
CREATE POLICY "Admins can manage all questions" ON public.questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- ========================================
-- 5. ANSWERS TABLE (Forum Cevapları)
-- ========================================
CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  is_best_answer BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Answers policies
CREATE POLICY "Answers are viewable by everyone" ON public.answers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create answers" ON public.answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own answers" ON public.answers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own answers" ON public.answers
  FOR DELETE USING (auth.uid() = user_id);

-- Admin can manage all answers
CREATE POLICY "Admins can manage all answers" ON public.answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- ========================================
-- 6. MR TERMS TABLE (Sözlük)
-- ========================================
CREATE TABLE IF NOT EXISTS public.mr_terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term TEXT NOT NULL,
  category TEXT NOT NULL,
  definition TEXT NOT NULL,
  related_terms TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.mr_terms ENABLE ROW LEVEL SECURITY;

-- MR Terms policies
CREATE POLICY "Terms are viewable by everyone" ON public.mr_terms
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage terms" ON public.mr_terms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- INDEXES for better performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_videos_published ON public.videos(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON public.questions(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_mr_terms_category ON public.mr_terms(category);

-- ========================================
-- SEED DATA - ADMIN USERS
-- ========================================
-- NOT: Supabase Auth kullanıyoruz, bu yüzden adminleri manuel oluşturacağız
-- Şimdilik users tablosuna örnek veri ekleyelim

INSERT INTO public.users (id, email, name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'defne.kayautlu@omurgam.com', 'Prof. Dr. Defne Kaya Utlu', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'dorukhan.sayim@omurgam.com', 'Dorukhan Sayım', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- SEED DATA - SAMPLE VIDEOS
-- ========================================
INSERT INTO public.videos (title, description, category, video_url, thumbnail_url, duration, views, published) VALUES
  ('Boyun Egzersizleri - Temel Seviye', 'Boyun ağrılarını önlemek için günlük yapabileceğiniz basit egzersizler', 'Boyun', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800', '12:34', 1245, true),
  ('Bel Sağlığı İçin 5 Altın Kural', 'Bel fıtığından korunmak için mutlaka bilmeniz gerekenler', 'Bel', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800', '15:20', 2103, true),
  ('Skolyoz Egzersizleri', 'Skolyoz hastalarına özel omurga sağlığı egzersizleri', 'Skolyoz', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800', '18:45', 987, true)
ON CONFLICT DO NOTHING;

-- ========================================
-- SEED DATA - SAMPLE BLOG POSTS
-- ========================================
INSERT INTO public.blog_posts (title, excerpt, content, category, image_url, views, published) VALUES
  ('Doğru Oturuş Pozisyonu Nasıl Olmalı?', 'Günümüzde masa başında geçirdiğimiz uzun saatler, omurga sağlığımızı olumsuz etkiliyor...', '<p>Günümüzde masa başında geçirdiğimiz uzun saatler, omurga sağlığımızı olumsuz etkiliyor. Doğru oturuş pozisyonu için dikkat edilmesi gerekenler:</p><ul><li>Ayaklarınız yere tam basmalı</li><li>Sırtınız sandalyeye yaslanmalı</li><li>Ekran göz hizasında olmalı</li></ul>', 'Egzersiz', 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=800', 3421, true),
  ('Bel Fıtığı Belirtileri Nelerdir?', 'Bel fıtığı, omurga sağlığını etkileyen en yaygın sorunlardan biridir...', '<p>Bel fıtığı belirtileri şunlardır:</p><ul><li>Bel ve bacakta ağrı</li><li>Uyuşma ve karıncalanma</li><li>Hareket kısıtlılığı</li></ul><p>Bu belirtileri fark ettiğinizde mutlaka bir uzmana danışmalısınız.</p>', 'Sağlık', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800', 2891, true)
ON CONFLICT DO NOTHING;

-- ========================================
-- SEED DATA - MR TERMS
-- ========================================
INSERT INTO public.mr_terms (term, category, definition, related_terms) VALUES
  ('Herniye Disk', 'Genel', 'Omurlar arasındaki yumuşak diskin dışarıya doğru çıkması durumudur. Genellikle bel veya boyun bölgesinde görülür.', ARRAY['Disk Protrüzyonu', 'Bel Fıtığı', 'Sinir Basısı']),
  ('Disk Protrüzyonu', 'Genel', 'Diskin dış tabakasının zayıflaması ve içteki jelatinsi yapının dışa doğru baskı yapması durumudur. Herniye olmamış ancak şişkinlik gösteren disk durumudur.', ARRAY['Herniye Disk', 'Disk Dejenerasyonu']),
  ('Spinal Stenoz', 'Genel', 'Omuriliğin geçtiği kanal içinde daralmalar olması durumudur. Yaşlanmayla birlikte kemik ve bağ dokusunun kalınlaşması sonucu oluşur.', ARRAY['Sinir Basısı', 'Foraminal Stenoz']),
  ('Lordoz', 'Bel', 'Omurganın öne doğru normal eğriliğidir. Boyun ve bel bölgelerinde görülür. Aşırı lordoz veya lordoz kaybı problemlere yol açabilir.', ARRAY['Kifoz', 'Skolyoz']),
  ('Kifoz', 'Sırt', 'Omurganın arkaya doğru eğriliğidir. Göğüs bölgesinde normaldir, ancak aşırı kifoz (kamburlaşma) sorun oluşturabilir.', ARRAY['Lordoz', 'Postür Bozukluğu']),
  ('Skolyoz', 'Skolyoz', 'Omurganın yan tarafa eğriliğidir. S veya C şeklinde eğrilik gösterebilir. Genellikle çocukluk ve ergenlik döneminde ortaya çıkar.', ARRAY['Kifoz', 'Lordoz', 'Postür Bozukluğu'])
ON CONFLICT DO NOTHING;

-- ========================================
-- DONE! ✅
-- ========================================
-- Şimdi Supabase Dashboard'a git:
-- 1. Authentication → Users → Create User ile admin users oluştur
-- 2. Storage → Create Bucket: "omurgam-videos" ve "omurgam-images" (public)