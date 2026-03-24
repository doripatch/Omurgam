# Omurgam - Prof. Dr. Defne Kaya Utlu Omurga Sağlığı Platformu

Modern, kullanıcı dostu omurga sağlığı bilgi platformu.

## 🚀 Teknolojiler

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Glassmorphism
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Routing**: React Router v7
- **State Management**: Zustand
- **Animations**: Motion (formerly Framer Motion)
- **UI Components**: Radix UI + shadcn/ui

## 📋 Özellikler

- ✅ Kullanıcı kayıt/giriş sistemi
- ✅ Admin panel ve yönetim sistemi
- ✅ Video arşivi (YouTube entegrasyonu)
- ✅ Blog sistemi
- ✅ Soru-cevap forumu
- ✅ MR raporu terim sözlüğü
- ✅ Video yorum ve beğeni sistemi
- ✅ Dark mode desteği
- ✅ Responsive tasarım
- ✅ SEO optimizasyonu
- ✅ CMS (Content Management System)

## 🛠️ Kurulum

### 1. Projeyi klonlayın
```bash
git clone <repository-url>
cd omurgam
```

### 2. Bağımlılıkları yükleyin
```bash
npm install
```

### 3. Environment variables oluşturun
`.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Supabase Setup

#### a) Supabase Edge Function Deploy
```bash
# Supabase CLI kurulumu
npm install -g supabase

# Supabase'e giriş yapın
supabase login

# Projenizi bağlayın
supabase link --project-ref your-project-ref

# Edge function'ı deploy edin
supabase functions deploy make-server-b69488c3
```

#### b) Environment Variables Ayarlayın
Supabase Dashboard → Edge Functions → Secrets:
```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=your-database-url
```

### 5. Development server'ı başlatın
```bash
npm run dev
```

## 🌐 Netlify Deployment

### Netlify'a Deploy (Otomatik)

1. **Netlify'a Giriş Yapın**: https://app.netlify.com
2. **"Add new site" → "Import an existing project"**
3. **GitHub/GitLab/Bitbucket** repository'nizi bağlayın
4. **Build ayarları**:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Environment Variables** ekleyin:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
6. **Deploy** butonuna tıklayın!

### Manuel Deployment

```bash
# Build alın
npm run build

# Netlify CLI ile deploy edin
npx netlify deploy --prod
```

## 🔐 İlk Admin Kullanıcısı Oluşturma

1. `/test-kullanici-olustur` sayfasına gidin
2. Admin bilgilerini girin:
   - Email: admin@omurgam.com
   - Password: güçlü-bir-şifre
   - Name: Admin
   - Role: admin
3. "Test Kullanıcı Oluştur" butonuna tıklayın
4. Artık admin paneline erişebilirsiniz!

## 📁 Proje Yapısı

```
omurgam/
├── src/
│   ├── app/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   │   ├── admin/        # Admin panel pages
│   │   │   ├── Home.tsx
│   │   │   ├── Videos.tsx
│   │   │   ├── Blog.tsx
│   │   │   └── ...
│   │   ├── lib/              # Utilities & API
│   │   │   ├── api.ts        # API functions
│   │   │   ├── supabase.ts   # Supabase client
│   │   │   └── utils.ts
│   │   ├── store/            # Zustand stores
│   │   ├── styles/           # Global styles
│   │   ├── App.tsx           # Main app component
│   │   └── routes.ts         # React Router config
│   ├── index.html
│   └── main.tsx
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx     # Edge function entry
│           ├── kv_store.tsx  # KV database utilities
│           └── seed.tsx      # Seed data
├── netlify.toml             # Netlify config
├── package.json
└── vite.config.ts

```

## 🎨 Tasarım Sistemi

- **Renk Paleti**: Amber/Orange gradients + Slate grays
- **Typography**: Modern, clean, büyük başlıklar
- **Components**: Glassmorphism + rounded corners
- **Animations**: Smooth, subtle transitions
- **Layout**: Bento Grid + Apple-inspired design

## 🔧 API Endpoints

Backend API endpoints (`/functions/v1/make-server-b69488c3`):

### Auth
- `POST /signup` - Kullanıcı kaydı
- `GET /session` - Oturum kontrolü

### Videos
- `GET /videos` - Tüm videoları listele
- `GET /videos/:id` - Video detayı
- `POST /videos` - Yeni video (admin)
- `PUT /videos/:id` - Video güncelle (admin)
- `DELETE /videos/:id` - Video sil (admin)
- `POST /videos/:id/view` - İzlenme sayısı artır
- `POST /videos/:id/like` - Beğeni toggle
- `GET /videos/:id/like-status` - Beğeni durumu
- `GET /videos/:id/comments` - Yorumları getir
- `POST /videos/:id/comments` - Yorum ekle
- `DELETE /videos/:videoId/comments/:commentId` - Yorum sil

### Questions
- `GET /questions` - Tüm soruları listele
- `POST /questions` - Yeni soru
- `POST /questions/:id/approve` - Soruyu onayla (admin)
- `POST /questions/:id/answer` - Soruyu yanıtla (admin)

### Blog
- `GET /blog` - Blog yazıları
- `POST /blog` - Yeni yazı (admin)
- `PUT /blog/:id` - Yazı güncelle (admin)

### MR Terms
- `GET /terms` - Terimleri listele
- `GET /terms/search?q=query` - Terim ara
- `POST /terms` - Yeni terim (admin)

### Admin
- `GET /admin/users` - Kullanıcıları listele
- `PUT /admin/users/role` - Kullanıcı rolü değiştir

### Site Settings
- `GET /site-settings` - Site ayarları
- `PUT /site-settings` - Ayarları güncelle (admin)

## 🔒 Güvenlik

- Supabase Row Level Security (RLS) policies
- Admin-only routes koruması
- JWT token authentication
- CORS konfigürasyonu
- XSS protection headers

## 🚨 Önemli Notlar

1. **Sağlık Bakanlığı Uyumlu**: Site sadece bilgilendirme amaçlıdır, tıbbi teşhis/tedavi vaadi içermez
2. **Prof. Dr. Unvanı**: "Doktor" ifadesi kullanılmaz (fizyoterapi profesörü)
3. **CMS Sistemi**: Tüm içerikler admin panelden düzenlenebilir
4. **Seed Data**: İlk kurulumda `/seed` endpoint'ini çağırarak örnek veri oluşturabilirsiniz

## 📞 Destek

Sorularınız için: [İletişim sayfası]

## 📄 Lisans

© 2026 Omurgam - Tüm hakları saklıdır.
