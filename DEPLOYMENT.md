# 🚀 NETLIFY DEPLOYMENT CHECKLIST

Bu dosya, Omurgam sitesini Netlify'a deploy etmek için gereken tüm adımları içerir.

---

## ✅ ADIM 1: SUPABASE KURULUMU

### 1.1. Supabase Projesi Oluştur
1. https://supabase.com adresine git
2. "New Project" butonuna tıkla
3. Proje adı: `omurgam`
4. Güçlü bir database password belirle (kaydet!)
5. Region seç: `Europe West (Frankfurt)` önerilir
6. "Create new project" butonuna tıkla
7. Projenin hazır olmasını bekle (~2 dakika)

### 1.2. Supabase API Credentials'ı Al
1. Supabase Dashboard → Project Settings → API
2. Şu bilgileri kopyala:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` ⚠️ GİZLİ!

### 1.3. Database URL'i Al
1. Supabase Dashboard → Project Settings → Database
2. **Connection String** → **URI** sekmesi
3. Connection string'i kopyala:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
4. `[YOUR-PASSWORD]` yerine 1.1'de belirlediğin şifreyi yaz

---

## ✅ ADIM 2: SUPABASE EDGE FUNCTION DEPLOY

### 2.1. Supabase CLI Kur
```bash
npm install -g supabase
```

### 2.2. Supabase'e Giriş Yap
```bash
supabase login
```
Tarayıcı açılacak → Supabase hesabınla giriş yap

### 2.3. Projeyi Bağla
```bash
supabase link --project-ref YOUR_PROJECT_REF
```
- `YOUR_PROJECT_REF` → Supabase URL'deki ID kısmı
- Örnek: `https://abcdefghijk.supabase.co` → `abcdefghijk`
- Database password'ünü gir

### 2.4. Edge Function'ı Deploy Et
```bash
supabase functions deploy make-server-b69488c3
```

### 2.5. Edge Function Secrets Ayarla
Supabase Dashboard → Edge Functions → `make-server-b69488c3` → Secrets

Ekle:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (⚠️ GİZLİ!)
SUPABASE_DB_URL=postgresql://postgres:...
```

### 2.6. Test Et
```bash
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/make-server-b69488c3/health
```
Yanıt: `{"status":"WORKING","server":"Omurgam Edge Function v2",...}`

---

## ✅ ADIM 3: GITHUB REPOSITORY OLUŞTUR

### 3.1. GitHub'da Yeni Repo Oluştur
1. https://github.com/new adresine git
2. Repository name: `omurgam`
3. Private/Public seç
4. **Create repository**

### 3.2. Kodu GitHub'a Push'la
Terminalden (proje klasöründe):
```bash
git init
git add .
git commit -m "Initial commit - Omurgam v1.0"
git branch -M main
git remote add origin https://github.com/USERNAME/omurgam.git
git push -u origin main
```

---

## ✅ ADIM 4: NETLIFY'A DEPLOY

### 4.1. Netlify'a Giriş Yap
1. https://app.netlify.com adresine git
2. GitHub ile giriş yap

### 4.2. Yeni Site Oluştur
1. **"Add new site"** → **"Import an existing project"**
2. **"Deploy with GitHub"** seç
3. GitHub'da `omurgam` repository'sini seç
4. Authorize et

### 4.3. Build Settings
```
Build command: npm run build
Publish directory: dist
```

### 4.4. Environment Variables Ekle
**Site settings** → **Environment variables** → **Add a variable**

Ekle:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

⚠️ **ÖNEMLİ**: `SUPABASE_SERVICE_ROLE_KEY` buraya EKLEMEYİN! (Güvenlik riski)

### 4.5. Deploy!
1. **"Deploy site"** butonuna tıkla
2. Build log'unu izle (~2-3 dakika)
3. Başarılı olursa → Site canlı! 🎉

---

## ✅ ADIM 5: İLK ADMIN KULLANICISI OLUŞTUR

### 5.1. Test Kullanıcı Sayfasına Git
```
https://your-site-name.netlify.app/test-kullanici-olustur
```

### 5.2. Admin Bilgilerini Gir
```
Email: admin@omurgam.com
Password: Güçlü-Şifre123!
Name: Admin
Role: admin
```

### 5.3. Oluştur
"Test Kullanıcı Oluştur" butonuna tıkla

### 5.4. Giriş Yap
```
https://your-site-name.netlify.app/giris
```
Email + Password ile giriş yap

### 5.5. Admin Panele Eriş
```
https://your-site-name.netlify.app/admin
```

---

## ✅ ADIM 6: İÇERİK YÖNETİMİ

### 6.1. Site Ayarları
Admin Panel → Site Ayarları
- Logo metni
- Site başlığı
- Sosyal medya linkleri
- Footer metinleri
- SEO ayarları

### 6.2. Örnek Veri Yükle (Opsiyonel)
1. Admin Panel → Dashboard
2. "Seed Database" butonuna tıkla
3. Örnek videolar, blog yazıları ve terimler yüklenecek

### 6.3. İlk Video Ekle
1. Admin Panel → Videolar
2. "Yeni Video" butonuna tıkla
3. YouTube URL'i yapıştır (thumbnail otomatik çekilir!)
4. Kaydet

---

## ✅ ADIM 7: DOMAIN BAĞLA (Opsiyonel)

### 7.1. Custom Domain Ekle
Netlify Dashboard → Domain management → Add custom domain

### 7.2. DNS Ayarları
Domain sağlayıcında (GoDaddy, Namecheap, vb.):
```
A Record: @ → Netlify IP
CNAME: www → your-site.netlify.app
```

### 7.3. SSL Sertifikası
Netlify otomatik Let's Encrypt SSL sertifikası kurar (ücretsiz)

---

## 🔥 SORUN GİDERME

### Build Hatası Alıyorum
```bash
# package.json'da scripts bölümünü kontrol et
"scripts": {
  "build": "vite build"
}
```

### Environment Variables Çalışmıyor
- Netlify'da değişken adları `VITE_` ile başlamalı
- Deploy ettikten sonra değişken eklediysen → **Redeploy** butonuna bas

### 404 Hatası Alıyorum
- `netlify.toml` dosyasının olduğundan emin ol
- Redirects ayarının doğru olduğundan emin ol

### Supabase Edge Function Çalışmıyor
```bash
# Function loglarını kontrol et
supabase functions logs make-server-b69488c3 --project-ref YOUR_REF
```

### Admin Panele Giremiyorum
1. `/test-kullanici-olustur` sayfasından yeni admin oluştur
2. Supabase Dashboard → Authentication → Users → Rol kontrolü

---

## 📞 DESTEK

Sorun yaşıyorsan:
1. Bu dosyadaki adımları tekrar kontrol et
2. Netlify build log'una bak
3. Supabase function log'una bak
4. Browser console'u kontrol et (F12)

---

## 🎉 TEBRIKLER!

Artık siteniz canlı! 🚀

**Sonraki Adımlar:**
- [ ] Google Analytics ekle
- [ ] Sosyal medya paylaşım butonları
- [ ] Email bildirimleri (Supabase Auth SMTP)
- [ ] Backup stratejisi (Supabase otomatik backup)
- [ ] Performance monitoring (Netlify Analytics)

**Site URL'in:** https://your-site-name.netlify.app 🌐
