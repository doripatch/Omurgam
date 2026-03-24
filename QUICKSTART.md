# ⚡ QUICKSTART - 10 DAKİKADA DEPLOY!

Omurgam'ı **10 dakikada** Netlify'a deploy etmek için bu hızlı rehberi takip edin.

---

## 🎯 SENARYO: En Hızlı Yol

Bu rehber, **mümkün olan en hızlı şekilde** sitenin canlıya alınması için hazırlanmıştır.

---

## ✅ ÖN KOŞULLAR

Bilgisayarınızda bunlar yüklü olmalı:
- ✅ **Node.js 20+** (https://nodejs.org)
- ✅ **Git** (https://git-scm.com)
- ✅ **Supabase CLI** → `npm install -g supabase`

Hesaplarınız olmalı:
- ✅ **Supabase Account** (https://supabase.com)
- ✅ **GitHub Account** (https://github.com)
- ✅ **Netlify Account** (https://netlify.com)

---

## 🚀 10 DAKİKADA DEPLOYMENT

### ⏱️ ADIM 1: Supabase Projesi (2 dakika)

```bash
# 1. https://supabase.com → "New Project"
# 2. Proje adı: omurgam
# 3. Password: Güçlü123! (kaydet!)
# 4. Region: Europe West
# 5. "Create new project" → Bekle

# 6. Project Settings → API → Kopyala:
PROJECT_URL="https://xxxxx.supabase.co"
ANON_KEY="eyJhbGci..."
SERVICE_KEY="eyJhbGci..." # GİZLİ!
```

---

### ⏱️ ADIM 2: Edge Function Deploy (3 dakika)

```bash
# Terminal aç (proje klasöründe)

# 1. Supabase'e giriş
supabase login

# 2. Projeyi bağla
supabase link --project-ref XXXXX
# XXXXX = URL'deki ID: https://XXXXX.supabase.co

# 3. Database password gir (Güçlü123!)

# 4. Function'ı deploy et
supabase functions deploy make-server-b69488c3

# 5. Supabase Dashboard → Edge Functions → make-server-b69488c3 → Secrets
# Ekle (Replace ile değiştir):
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... # GİZLİ!
SUPABASE_DB_URL=postgresql://postgres:Güçlü123!@db.xxxxx.supabase.co:5432/postgres

# 6. Test et
curl https://XXXXX.supabase.co/functions/v1/make-server-b69488c3/health
# Yanıt: {"status":"WORKING",...}
```

---

### ⏱️ ADIM 3: GitHub'a Push (2 dakika)

```bash
# 1. GitHub'da repo oluştur: https://github.com/new
# Repo adı: omurgam

# 2. Terminal'de (proje klasöründe):
git init
git add .
git commit -m "🚀 Omurgam v1.0"
git branch -M main
git remote add origin https://github.com/USERNAME/omurgam.git
git push -u origin main
```

---

### ⏱️ ADIM 4: Netlify Deploy (3 dakika)

```bash
# 1. https://app.netlify.com → GitHub ile giriş

# 2. "Add new site" → "Import an existing project"

# 3. "Deploy with GitHub" → "omurgam" repo seç

# 4. Build settings:
Build command: npm run build
Publish directory: dist

# 5. "Add environment variables":
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# 6. "Deploy site" → Bekle (2-3 dakika)

# 7. ✅ Canlı! → https://YOUR-SITE.netlify.app
```

---

### ⏱️ BONUS: İlk Admin Oluştur (+1 dakika)

```bash
# 1. Git: https://YOUR-SITE.netlify.app/test-kullanici-olustur

# 2. Gir:
Email: admin@omurgam.com
Password: Admin123!
Name: Admin
Role: admin

# 3. "Oluştur" → Başarılı!

# 4. Giriş yap: https://YOUR-SITE.netlify.app/giris

# 5. Admin panel: https://YOUR-SITE.netlify.app/admin
```

---

## 🎉 TEBRIKLER - CANLIDA!

Site şu adreste: **https://YOUR-SITE.netlify.app**

---

## 📝 SONRAKI ADIMLAR

### Hemen Yapılacaklar:
1. ✅ **Admin Panel** → Site Ayarları → Logo/sosyal medya linklerini düzenle
2. ✅ **İlk Video** ekle → Admin Panel → Videolar → Yeni Video
3. ✅ **İlk Blog** yazısı yaz → Admin Panel → Blog → Yeni Yazı
4. ✅ **MR Terimleri** ekle → Admin Panel → Terimler

### Özel Domain Ekle (Opsiyonel):
```
Netlify Dashboard → Domain Management → Add custom domain
→ DNS ayarları yap → SSL otomatik kuruluyor
```

### Örnek Veri Yükle (Opsiyonel):
```
Admin Panel → Dashboard → "Seed Database" butonu
→ Örnek videolar, blog yazıları ve terimler otomatik eklenir
```

---

## 🆘 SORUN GİDERME

### Build hatası alıyorum
```bash
# Netlify build log'una bak
# Environment variables doğru mu kontrol et
# VITE_ prefix'i var mı?
```

### 404 hatası alıyorum (sayfalar açılmıyor)
```bash
# netlify.toml dosyası var mı kontrol et
# Redirects ayarı doğru mu?
```

### Backend çalışmıyor
```bash
# Supabase function log'una bak:
supabase functions logs make-server-b69488c3 --project-ref XXXXX

# Secrets doğru mu kontrol et:
# Supabase Dashboard → Edge Functions → Secrets
```

### Admin panele giremiyorum
```bash
# /test-kullanici-olustur sayfasından yeni admin oluştur
# Supabase Dashboard → Authentication → Users → Rol kontrolü
```

---

## 📞 DESTEK

Detaylı rehber için: **DEPLOYMENT.md**

---

**⚡ 10 DAKIKADA DEPLOY - BAŞARILAR!** 🚀
