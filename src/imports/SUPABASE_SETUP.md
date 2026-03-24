# 🗄️ Supabase Veritabanı Kurulumu

Supabase dashboard'unuzda bu SQL komutlarını çalıştırın.

## 📍 Nasıl Çalıştırılır?

1. Supabase Dashboard → **SQL Editor** gidin
2. **New Query** tıklayın
3. Aşağıdaki SQL kodunu yapıştırın
4. **Run** tıklayın

---

## 🗂️ Veritabanı Tabloları

```sql
-- 1. Categories (Kategori Yönetimi)
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Videos (Prof. Dr. DKU Video Arşivi)
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  duration TEXT,
  views INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Questions (Kullanıcı Soruları)
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  question_text TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'answered', 'rejected')),
  answer_text TEXT,
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Blog Posts (Blog Yazıları)
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  category TEXT,
  author TEXT DEFAULT 'Prof. Dr. Defne Kaya Utlu',
  published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User Roles (Admin/Kullanıcı Rolleri)
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Indexes (Performans için)
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_published ON videos(published);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_user ON questions(user_id);
CREATE INDEX idx_blog_slug ON blog_posts(slug);
CREATE INDEX idx_blog_published ON blog_posts(published);
```

---

## 🔐 Row Level Security (RLS) Politikaları

```sql
-- Videos: Herkes okuyabilir, sadece admin yazabilir
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes yayınlanmış videoları görebilir" ON videos
  FOR SELECT USING (published = true);

CREATE POLICY "Adminler tüm videoları görebilir" ON videos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "Sadece adminler video ekleyebilir" ON videos
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "Sadece adminler video güncelleyebilir" ON videos
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "Sadece adminler video silebilir" ON videos
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- Questions: Kullanıcılar kendi sorularını görebilir, adminler hepsini
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi sorularını görebilir" ON questions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Adminler tüm soruları görebilir" ON questions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "Giriş yapan kullanıcılar soru sorabilir" ON questions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Sadece adminler soruları güncelleyebilir" ON questions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "Adminler soruları silebilir" ON questions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- Blog Posts: Herkes okuyabilir, sadece admin yazabilir
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes yayınlanmış blogları görebilir" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Adminler tüm blogları görebilir" ON blog_posts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "Sadece adminler blog ekleyebilir" ON blog_posts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "Sadece adminler blog güncelleyebilir" ON blog_posts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "Sadece adminler blog silebilir" ON blog_posts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- Categories: Herkes okuyabilir, sadece admin yazabilir
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes kategorileri görebilir" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Sadece adminler kategori ekleyebilir" ON categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "Sadece adminler kategori güncelleyebilir" ON categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "Sadece adminler kategori silebilir" ON categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- User Roles: Sadece adminler görebilir/düzenleyebilir
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Adminler tüm rolleri görebilir" ON user_roles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

CREATE POLICY "Sadece adminler rol atayabilir" ON user_roles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

CREATE POLICY "Sadece adminler rol güncelleyebilir" ON user_roles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );
```

---

## 📦 Storage Buckets (Dosya Yükleme)

```sql
-- Storage bucket'larını oluşturmak için Supabase Dashboard kullanın:
-- Storage → New Bucket

-- 1. video-thumbnails (Video küçük resimleri)
-- 2. blog-images (Blog görselleri)

-- Her bucket için Public Access: AÇIK
```

---

## 🌱 Örnek Veriler (Test İçin)

```sql
-- Örnek Kategoriler
INSERT INTO categories (name, slug, description, icon, color) VALUES
  ('Bel Fıtığı', 'bel-fitigi', 'Bel fıtığı ile ilgili tüm içerikler', '🔴', '#ef4444'),
  ('Boyun Ağrısı', 'boyun-agrisi', 'Boyun ağrısı ve tedavileri', '🟡', '#f59e0b'),
  ('Skolyoz', 'skolyoz', 'Skolyoz egzersizleri ve tedaviler', '🟢', '#10b981'),
  ('Postür Bozukluğu', 'postur-bozuklugu', 'Postür düzeltme yöntemleri', '🔵', '#3b82f6');

-- Örnek Video
INSERT INTO videos (title, description, youtube_url, category, published) VALUES
  ('Bel Fıtığı Nedir? Belirtileri Nelerdir?', 
   'Prof. Dr. Defne Kaya Utlu bel fıtığının ne olduğunu ve belirtilerini anlatıyor.', 
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   'Bel Fıtığı',
   true);

-- Örnek Blog Yazısı
INSERT INTO blog_posts (title, slug, content, excerpt, category, published) VALUES
  ('Evde Bel Ağrısına İyi Gelen 5 Egzersiz',
   'evde-bel-agrisina-iyi-gelen-egzersizler',
   'Detaylı blog içeriği buraya gelecek...',
   'Bel ağrınızı evde basit egzersizlerle hafifletin.',
   'Bel Fıtığı',
   true);
```

---

## ✅ Kurulum Tamamlandı!

Şimdi admin paneline giriş yapabilirsiniz:
1. Kayıt olun (ilk kullanıcı)
2. Supabase SQL Editor'de kendinizi admin yapın:

```sql
-- YOUR_USER_ID'yi auth.users tablosundan alın
INSERT INTO user_roles (user_id, role) VALUES ('YOUR_USER_ID', 'admin');
```

3. `/admin` sayfasına gidin ve içerik yönetmeye başlayın!
