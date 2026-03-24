# 🏥 Omurgam Soruyor - Sağlık Platformu

Modern, kullanıcı dostu bir omurga sağlığı platformu. Prof. Dr. Defne Kaya Utlu'nun video cevapları, kullanıcı soruları ve blog içerikleriyle donatılmış tam özellikli bir web uygulaması.

---

## ✨ Özellikler

### 🎯 Kullanıcı Özellikleri
- ✅ Video arşivi (Prof. Dr. DKU'nun cevapları)
- ✅ Soru-cevap sistemi
- ✅ Blog yazıları
- ✅ MR analiz motoru
- ✅ Kategori bazlı içerikler (Bel Fıtığı, Boyun Ağrısı, Skolyoz, Postür)
- ✅ Akıllı soru akışı

### 🔐 Admin Panel Özellikleri
- ✅ Dashboard (istatistikler)
- ✅ Video yönetimi (ekle, düzenle, sil, yayınla)
- ✅ Soru moderasyonu (onayla, reddet, yanıtla, sil)
- ✅ Blog yönetimi
- ✅ Kullanıcı yönetimi
- ✅ Rol tabanlı erişim kontrolü

### 🛠️ Teknik Özellikler
- ⚡ React 18 + TypeScript
- 🎨 Tailwind CSS v4
- 🗄️ Supabase (PostgreSQL veritabanı)
- 🔐 Güvenli kimlik doğrulama
- 📱 Responsive tasarım
- 🚀 Netlify-ready deployment

---

## 📦 Hızlı Başlangıç

### 1️⃣ Supabase Kurulumu

1. [Supabase](https://supabase.com) hesabı oluştur
2. Yeni proje oluştur (Region: **Frankfurt**)
3. `SUPABASE_SETUP.md` dosyasındaki SQL komutlarını çalıştır
4. API anahtarlarını al (Project Settings → API)

### 2️⃣ Netlify'a Deploy

1. Projeyi klasör olarak indir
2. [Netlify](https://netlify.com)'da **Deploy manually** seç
3. Klasörü sürükle-bırak
4. **Environment Variables** ekle:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. **Clear cache and deploy** yap

Detaylı adımlar için `DEPLOYMENT_GUIDE.md` dosyasına bakın.

### 3️⃣ İlk Admin Kullanıcısı

1. Sitenize gidin: `/login`
2. Kayıt olun
3. Supabase SQL Editor'de kendinize admin rolü verin:

```sql
INSERT INTO user_roles (user_id, role) 
VALUES ('YOUR_USER_ID', 'admin');
```

4. `/admin` sayfasına girin ve içerik yönetmeye başlayın!

---

## 📁 Proje Yapısı

```
omurgam-soruyor/
├── src/
│   ├── app/
│   │   ├── components/         # React bileşenleri
│   │   ├── pages/              # Sayfa bileşenleri
│   │   ├── layouts/            # Layout bileşenleri
│   │   └── routes.tsx          # React Router yapılandırması
│   ├── contexts/               # React Context'ler (Auth)
│   ├── lib/                    # Supabase client
│   └── styles/                 # CSS dosyaları
├── SUPABASE_SETUP.md           # Veritabanı kurulum rehberi
├── DEPLOYMENT_GUIDE.md         # Netlify deployment rehberi
└── README.md                   # Bu dosya
```

---

## 🗄️ Veritabanı Tabloları

- **videos** - Video içerikleri
- **questions** - Kullanıcı soruları
- **blog_posts** - Blog yazıları
- **categories** - Kategori yönetimi
- **user_roles** - Kullanıcı yetkileri (admin/user)

Detaylı tablo yapısı için `SUPABASE_SETUP.md` dosyasına bakın.

---

## 🎨 Tasarım Sistemi

### Renk Paleti
- **Koyu Turkuaz**: `#0f3d44` (Header, footer, sidebar)
- **Turkuaz**: `#0e7490` (Başlıklar, linkler)
- **Mint Yeşili**: `#a7f3d0` (Vurgular)
- **Mercan**: `#f97316` (Butonlar, CTA'lar)

### Yazı Tipleri
- **Syne**: Başlıklar ve logo
- **Space Grotesk**: Hero başlık
- **Poppins**: Body metinleri
- **Inter**: UI elementleri

---

## 🔒 Güvenlik

- ✅ Row Level Security (RLS) aktif
- ✅ Rol tabanlı erişim kontrolü
- ✅ Güvenli API anahtarları (sadece `anon` key public)
- ✅ Admin-only işlemler korumalı

⚠️ **Önemli**: Bu platform hassas sağlık verileri toplamak için tasarlanmamıştır.

---

## 📚 Dokümanlar

- [Supabase Kurulum Rehberi](SUPABASE_SETUP.md)
- [Netlify Deployment Rehberi](DEPLOYMENT_GUIDE.md)
- [Supabase Dokümanlar](https://supabase.com/docs)
- [Netlify Dokümanlar](https://docs.netlify.com)

---

## 🚀 Deployment

### Netlify (Önerilen)
- ✅ Ücretsiz 100GB bandwidth
- ✅ Otomatik SSL
- ✅ CDN
- ✅ Kolay domain bağlama

### Alternatifler
- Vercel
- Cloudflare Pages
- AWS Amplify

---

## 📊 Admin Panel

Admin paneline `/admin` adresinden erişebilirsiniz.

**Özellikler:**
- 📈 Dashboard (istatistikler)
- 📹 Video CRUD işlemleri
- ❓ Soru moderasyonu
- 📝 Blog yönetimi
- 👥 Kullanıcı yönetimi

---

## 🆘 Sorun Giderme

### Sayfa Boş
→ Environment variables eklenmiş mi kontrol edin

### Admin Paneline Erişemiyorum
→ `user_roles` tablosunda admin rolü var mı kontrol edin

### Supabase Hatası
→ API anahtarları doğru mu? Proje aktif mi?

Detaylar için `DEPLOYMENT_GUIDE.md` → Sorun Giderme bölümüne bakın.

---

## 📝 Lisans

Bu proje eğitim ve ticari kullanım için uygundur.

---

## 🙏 Teşekkürler

Bu platform şu teknolojiler kullanılarak geliştirilmiştir:

- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com)
- [Lucide Icons](https://lucide.dev)
- [Netlify](https://netlify.com)

---

**İyi kullanımlar! 🎉**
