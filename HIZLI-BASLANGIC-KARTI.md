# ⚡ OMURGAM - HIZLI BAŞLANGIÇ KARTI

**5 dakikada deployment özeti!**

---

## 📋 HAZIRLIK

```bash
✅ Node.js 20+
✅ Git kurulu
✅ GitHub hesabı
✅ Netlify hesabı
✅ Supabase hesabı
```

---

## 🚀 5 ADIMDA DEPLOY

### 1️⃣ SUPABASE KURULUM (5 dk)

```bash
# Supabase'de yeni proje oluştur
https://supabase.com → New Project
  Name: omurgam
  Password: [KAYDET!]
  Region: Europe West

# API bilgilerini kopyala
Project Settings → API
  ✅ Project URL
  ✅ anon public
  ✅ service_role
```

### 2️⃣ EDGE FUNCTION DEPLOY (3 dk)

```bash
# CLI kur
npm install -g supabase

# Login
supabase login

# Proje bağla
supabase link --project-ref XXXXX

# Deploy
cd supabase/functions
supabase functions deploy server

# Secrets ekle (Dashboard → Edge Functions → Secrets)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_DB_URL=postgresql://...

# Test
curl https://xxxxx.supabase.co/functions/v1/server/health
```

### 3️⃣ GITHUB PUSH (2 dk)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/omurgam.git
git push -u origin main
```

### 4️⃣ NETLIFY DEPLOY (3 dk)

```bash
# Netlify'da
https://app.netlify.com
  → Add new site → Import from GitHub
  → Seç: omurgam repository
  
# Build settings
Build command: npm run build
Publish directory: dist

# Environment Variables EKLE (ÖNEMLİ!)
VITE_SUPABASE_PROJECT_ID=xxxxx
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Deploy butonuna tıkla!
```

### 5️⃣ İLK ADMIN (1 dk)

```bash
# Tarayıcıda aç
https://omurgam.netlify.app/test-kullanici-olustur

# Form doldur
Email: admin@omurgam.com
Password: GüçlüŞifre123!
Name: Admin
Role: admin

# Giriş yap
https://omurgam.netlify.app/giris
```

---

## ✅ KONTROL LİSTESİ

```
□ Supabase projesi oluşturuldu
□ Edge Function deploy edildi
□ Secrets eklendi
□ Edge Function test edildi (curl)
□ GitHub'a push yapıldı
□ Netlify environment variables eklendi
□ Netlify deploy başarılı
□ Site açılıyor
□ Admin kullanıcı oluşturuldu
□ Admin panele giriş yapıldı
```

---

## 🆘 HATA KODLARI

| Hata | Çözüm |
|------|-------|
| **Build failed** | `package.json` → `"build": "vite build"` kontrol |
| **404 hatası** | `netlify.toml` dosyası var mı? |
| **Supabase bağlanamıyor** | Environment variables doğru mu? REDEPLOY! |
| **Edge Function çalışmıyor** | Secrets eklendi mi? Log kontrol: `supabase functions logs server` |
| **Admin panele giremiyorum** | `/test-kullanici-olustur` tekrar dene |

---

## 📞 DETAYLI REHBER

Full rehber için: `/OMURGAM-NETLIFY-DEPLOY-REHBERI.md`

---

**Deployment süresi:** ~15 dakika  
**İlk kez yapıyorsan:** ~30 dakika  
**Sonraki güncellemeler:** 2 dakika (otomatik)
