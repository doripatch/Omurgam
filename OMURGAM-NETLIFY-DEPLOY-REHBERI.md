# 🚀 OMURGAM.COM - NETLIFY DEPLOYMENT REHBERİ

**PTR Digital deneyimli kullanıcılar için hazırlanmıştır.**  
Bu rehber SADECE Omurgam.com için geçerlidir - PTR Digital'i karıştırmayın!

---

## 📋 ÖN HAZIRLIK

### Gereksinimler
- ✅ Netlify hesabı (varsa PTR Digital ile aynı hesap kullanılabilir)
- ✅ GitHub hesabı
- ✅ Supabase hesabı (ücretsiz plan yeterli)
- ✅ Node.js 20+ kurulu (terminal: `node -v`)
- ✅ Git kurulu (terminal: `git --version`)

### Gerekli Süre
- **İlk kurulum**: 30-45 dakika
- **Sonraki deploy'lar**: 2-3 dakika (otomatik)

---

## 🗂️ ADIM 1: KODU HAZIRLA

### 1.1. Proje Dosyalarını İndir
Figma Make'den tüm proje dosyalarını bilgisayarına indir.

**Klasör yapısı şöyle olmalı:**
```
omurgam/
├── src/
├── supabase/
├── package.json
├── netlify.toml
├── vite.config.ts
└── ... (diğer dosyalar)
```

### 1.2. Terminal'i Aç
Proje klasörüne git:
```bash
cd /path/to/omurgam
```

### 1.3. Node Modules Kur (Opsiyonel - Test için)
```bash
npm install
```

⚠️ **NOT**: Netlify build sırasında zaten kuracak, bu sadece lokal test için.

---

## 🗄️ ADIM 2: SUPABASE KURULUMU

### 2.1. Yeni Supabase Projesi Oluştur

1. 🌐 https://supabase.com adresine git
2. **"New Project"** butonuna tıkla
3. **Organization seç** (yoksa oluştur)
4. Proje bilgilerini gir:
   ```
   Name: omurgam
   Database Password: [GÜÇLÜ ŞİFRE - KAYDET!]
   Region: Europe West (Frankfurt) - TR için en yakın
   Pricing Plan: Free
   ```
5. **"Create new project"** tıkla
6. ⏳ 2-3 dakika bekle (proje hazırlanıyor)

### 2.2. Supabase API Bilgilerini Kopyala

**Önemli bilgiler:**

#### A) Project URL ve Anon Key
1. Sol menü: **Project Settings** (⚙️ icon) → **API**
2. Şunları kopyala ve bir yere kaydet:
   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   Project ID: xxxxxxxxxxxxx (URL'deki ilk kısım)
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... [⚠️ GİZLİ!]
   ```

#### B) Database URL
1. Sol menü: **Project Settings** → **Database**
2. **Connection String** → **URI** sekmesine tıkla
3. Şunu kopyala:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
4. `[YOUR-PASSWORD]` yerine 2.1'de oluşturduğun şifreyi yaz

**💾 Bu bilgileri güvenli bir yere (şifre yöneticisi) kaydet!**

---

## 🔧 ADIM 3: SUPABASE EDGE FUNCTION DEPLOY

### 3.1. Supabase CLI Kur

**macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```bash
npm install -g supabase
```

**Kontrol et:**
```bash
supabase --version
```

### 3.2. Supabase'e Login

```bash
supabase login
```

- Tarayıcı açılacak
- **"Authorize"** butonuna tıkla
- Terminal'e dön - "Logged in." mesajını göreceksin

### 3.3. Projeyi Bağla

```bash
supabase link --project-ref XXXXXXXX
```

- `XXXXXXXX` yerine **Project ID**'yi yaz (Adım 2.2'den)
- Database password'ünü gir (görünmez yazılır - normal)
- "Finished supabase link." mesajını göreceksin

### 3.4. Edge Function Deploy Et

```bash
cd supabase/functions
supabase functions deploy server
```

⚠️ **Hata alırsan:**
```bash
# Function ismi farklı olabilir, kontrol et:
ls supabase/functions/
# Çıktıya göre doğru ismi kullan
```

**Başarılı olursa:**
```
Deployed Function server version xxx
URL: https://xxxxxxx.supabase.co/functions/v1/server
```

### 3.5. Edge Function Environment Variables

**MANÜEL YÖNTEM (Önerilen):**

1. 🌐 Supabase Dashboard → **Edge Functions** → `server`
2. **"Manage secrets"** tıkla
3. Her birini tek tek ekle:

```bash
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci... (anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (service role key)
SUPABASE_DB_URL=postgresql://postgres...
```

**CLI YÖNTEM (Alternatif):**
```bash
supabase secrets set SUPABASE_URL=https://xxxxx.supabase.co
supabase secrets set SUPABASE_ANON_KEY=eyJhbGci...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
supabase secrets set SUPABASE_DB_URL=postgresql://...
```

### 3.6. Test Et

```bash
curl https://xxxxxxxxxxxxx.supabase.co/functions/v1/server/health
```

**Başarılı yanıt:**
```json
{
  "status": "WORKING",
  "server": "Omurgam Edge Function v2",
  "timestamp": "2026-03-23T..."
}
```

❌ **Hata alırsan:**
- Environment variables doğru mu? (Dashboard → Edge Functions → Secrets)
- Function deploy oldu mu? (Dashboard → Edge Functions → server var mı?)
- URL doğru mu? `/functions/v1/server/health` (make-server-b69488c3 DEĞİL!)

---

## 📦 ADIM 4: GITHUB'A PUSH

### 4.1. GitHub Repository Oluştur

1. 🌐 https://github.com/new
2. Repository bilgileri:
   ```
   Repository name: omurgam
   Description: Omurgam - Omurga Sağlığı Platformu
   Private/Public: Seçimine göre
   ❌ Initialize this repository... seçeneklerini işaretleme!
   ```
3. **"Create repository"** tıkla

### 4.2. Git Init & Push

Terminal'de (proje klasöründe):

```bash
# Git'i başlat
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit - Omurgam v1.0"

# Main branch oluştur
git branch -M main

# GitHub'ı remote olarak ekle (USERNAME yerine kendi kullanıcı adın)
git remote add origin https://github.com/USERNAME/omurgam.git

# Push!
git push -u origin main
```

**✅ Başarılı oldu mu?**
GitHub'da repository sayfasını yenile - dosyalar görünmeli!

---

## 🌐 ADIM 5: NETLIFY'A DEPLOY

### 5.1. Netlify'a Giriş

1. 🌐 https://app.netlify.com
2. GitHub ile giriş yap (PTR Digital ile aynı hesap kullanılabilir)

### 5.2. Yeni Site Ekle

1. **"Add new site"** → **"Import an existing project"**
2. **"Deploy with GitHub"** seç
3. **"omurgam"** repository'sini bul ve seç
4. **Authorize** et (gerekirse)

### 5.3. Build Settings

Netlify otomatik algılar ama kontrol et:

```
Base directory: (boş bırak)
Build command: npm run build
Publish directory: dist
```

**⚠️ DURDUR! Environment Variables eklemeden deploy etme!**

### 5.4. Environment Variables Ekle

**Site configuration** → **Environment variables** → **Add a variable**

Ekle (değerleri Adım 2.2'den al):

```bash
VITE_SUPABASE_PROJECT_ID=xxxxxxxxxxxxx
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **SADECE BU İKİSİNİ EKLE!**
- ❌ `SUPABASE_SERVICE_ROLE_KEY` buraya EKLEMEYİN! (Güvenlik riski)
- ❌ `SUPABASE_DB_URL` buraya EKLEMEYİN!
- ✅ Bu ikisi SADECE Edge Function'da olmalı

### 5.5. Deploy!

1. **"Deploy [site-name]"** butonuna tıkla
2. Build log'unu izle (real-time)
3. ⏳ 2-5 dakika bekle

**Başarılı olursa:**
```
✓ Site is live
  https://random-name-xxxxx.netlify.app
```

### 5.6. Site İsmini Değiştir (Opsiyonel)

1. **Site settings** → **Site details** → **Change site name**
2. Örnek: `omurgam` → https://omurgam.netlify.app

---

## 👤 ADIM 6: İLK ADMIN KULLANICISI

### 6.1. Test Kullanıcı Sayfası

Tarayıcıda aç:
```
https://omurgam.netlify.app/test-kullanici-olustur
```

### 6.2. Admin Bilgileri

Formu doldur:
```
Email: admin@omurgam.com (veya kendi emailin)
Password: GüçlüŞifre123!
Name: Admin
Role: admin
```

**"Test Kullanıcı Oluştur"** tıkla

✅ **Başarılı:** "Kullanıcı başarıyla oluşturuldu" mesajı

### 6.3. Giriş Yap

```
https://omurgam.netlify.app/giris
```

Email + Password ile giriş yap

### 6.4. Admin Paneli

```
https://omurgam.netlify.app/admin
```

**Tebrikler! Admin panele eriştiniz!** 🎉

---

## 📝 ADIM 7: İÇERİK YÖNETİMİ

### 7.1. Site Ayarları

**Admin Panel** → **Site Ayarları**

Düzenle:
- ✏️ Logo metni
- ✏️ Site sloganı
- ✏️ Sosyal medya linkleri (Instagram, YouTube, LinkedIn...)
- ✏️ Footer metinleri
- ✏️ SEO ayarları (title, description)

**"Ayarları Kaydet"** tıkla

### 7.2. Örnek Veri Yükle (Opsiyonel)

**Admin Panel** → **Dashboard** → **"Seed Database"**

Bu, örnek videolar ve blog yazıları ekler.

### 7.3. İlk Video Ekle

**Admin Panel** → **Videolar** → **"Yeni Video"**

```
Başlık: Omurga Sağlığı Temelleri
Kategori: Eğitim
YouTube URL: https://www.youtube.com/watch?v=XXXXXXX
Açıklama: ...
Süre: 12:34
```

**"Video Ekle"** tıkla

✅ Thumbnail otomatik çekilecek!

---

## 🌍 ADIM 8: CUSTOM DOMAIN (OMURGAM.COM)

### 8.1. Domain Satın Al (Eğer yoksa)

GoDaddy, Namecheap, Google Domains vb.

### 8.2. Netlify'da Domain Ekle

1. **Site settings** → **Domain management**
2. **"Add custom domain"**
3. `omurgam.com` yaz
4. **"Verify"** tıkla
5. Netlify DNS kullanmak ister misin? → **"Yes"** veya **"No"** (tercihine göre)

### 8.3. DNS Ayarları

**Domain sağlayıcında (GoDaddy, Namecheap...):**

#### Netlify DNS Kullanmıyorsan:
```
A Record:
  Host: @
  Value: 75.2.60.5 (Netlify IP)

CNAME Record:
  Host: www
  Value: omurgam.netlify.app
```

#### Netlify DNS Kullanıyorsan:
Netlify'ın verdiği nameserver'ları domain'e ekle:
```
dns1.p03.nsone.net
dns2.p03.nsone.net
dns3.p03.nsone.net
dns4.p03.nsone.net
```

### 8.4. SSL Sertifikası

✅ Netlify otomatik Let's Encrypt SSL kurar (5-10 dakika)

**Kontrol:**
- **Site settings** → **Domain management** → **HTTPS**
- "Certificate" bölümünde ✅ işareti görmeli

---

## 🔄 GELECEKTEKİ GÜNCELLEMELER

### Kod Değişikliği Yaptın mı?

```bash
git add .
git commit -m "Açıklama mesajı"
git push
```

✨ **Netlify otomatik detect edip deploy edecek!** (2-3 dakika)

### Environment Variable Değiştirdin mi?

1. Netlify → **Site settings** → **Environment variables**
2. Değişiklik yap
3. **"Redeploy"** butonuna bas

---

## 🆘 SORUN GİDERME

### ❌ Build Hatası

**Hata:** `Module not found` veya `Cannot find package`

**Çözüm:**
```bash
# package.json'a bak - scripts bölümü:
"scripts": {
  "build": "vite build"  ← Bu olmalı
}
```

### ❌ Environment Variables Çalışmıyor

**Hata:** Site açılıyor ama Supabase'e bağlanamıyor

**Kontrol:**
1. Netlify → Environment variables
2. `VITE_SUPABASE_PROJECT_ID` var mı?
3. `VITE_SUPABASE_ANON_KEY` var mı?
4. **Redeploy** butonuna bastın mı?

### ❌ 404 Hatası (Sayfa yenilediğinde)

**Hata:** Ana sayfa çalışıyor ama `/videolar` gibi sayfalarda 404

**Çözüm:**
- `netlify.toml` dosyası var mı kontrol et
- Redirect rule'u var mı:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### ❌ Edge Function Çalışmıyor

**Hata:** Giriş yapamıyorum, video eklenmiyor

**Test:**
```bash
curl https://xxxxx.supabase.co/functions/v1/server/health
```

**Çözüm:**
1. Supabase → Edge Functions → `server` var mı?
2. Secrets eklenmiş mi?
3. Function deploy oldu mu?

**Log kontrol:**
```bash
supabase functions logs server --project-ref xxxxx
```

### ❌ Admin Panele Giremiyorum

**Çözüm:**
1. `/test-kullanici-olustur` sayfasından tekrar admin oluştur
2. Supabase Dashboard → Authentication → Users → user_metadata kontrolü

---

## 📊 PERFORMANS & ANALİZ

### Google Analytics Ekle (Opsiyonel)

1. Google Analytics hesabı oluştur
2. Tracking ID al (G-XXXXXXXXXX)
3. Admin Panel → Site Ayarları → SEO → GA Tracking ID

### Netlify Analytics

**Site settings** → **Analytics** → **Enable analytics**

- Sayfa görüntülemeleri
- Trafik kaynakları
- 404 hataları

---

## 🔐 GÜVENLİK

### ✅ Güvenlik Checklist

- [x] `netlify.toml` security headers var
- [x] SERVICE_ROLE_KEY frontend'de yok (sadece Edge Function)
- [x] HTTPS aktif (SSL sertifikası)
- [x] Admin sayfaları auth korumalı
- [x] XSS koruması var (React varsayılan)

### Düzenli Bakım

- 🔄 Haftalık: Supabase Auth users kontrolü
- 🔄 Aylık: Database backup (Supabase otomatik)
- 🔄 Aylık: Package güncellemeleri (`npm outdated`)

---

## 🎉 BAŞARILI!

Site artık canlı: **https://omurgam.netlify.app** 🚀

### Sonraki Adımlar:

- [ ] Sosyal medya paylaşım butonları ekle
- [ ] Email bildirimleri (Supabase Auth SMTP)
- [ ] Sitemap.xml oluştur (SEO)
- [ ] robots.txt ekle
- [ ] Favicon ekle
- [ ] Open Graph images (sosyal medya önizleme)

---

## 📞 DESTEK

Sorun mu yaşıyorsun?

1. ✅ Bu rehberi baştan tekrar oku
2. ✅ Netlify build log'una bak
3. ✅ Browser console'u aç (F12 → Console)
4. ✅ Supabase Edge Function log'una bak

---

**Son Güncelleme:** 23 Mart 2026  
**Versiyon:** 1.0  
**Yazar:** Omurgam Development Team
