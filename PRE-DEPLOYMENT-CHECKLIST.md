# ✅ PRE-DEPLOYMENT CHECKLIST

Netlify'a deploy etmeden önce bu listeyi kontrol edin!

---

## 📋 DOSYA KONTROLÜ

- [x] `netlify.toml` → Build configuration
- [x] `.gitignore` → Git ignore patterns
- [x] `.env.example` → Environment variable template
- [x] `README.md` → Proje dokümantasyonu
- [x] `DEPLOYMENT.md` → Detaylı deployment rehberi
- [x] `QUICKSTART.md` → Hızlı deployment rehberi
- [x] `package.json` → Dependencies ve scripts
- [x] `.nvmrc` → Node.js version

---

## 🔧 KOD KONTROLÜ

### Environment Variables
- [x] `/utils/supabase/info.tsx` → `import.meta.env` kullanıyor
- [x] `/src/app/lib/supabase.ts` → Environment'tan okuyor
- [x] Backend secrets Supabase'de ayarlanmalı (manuel)

### Build Sistemi
- [x] `vite.config.ts` → Doğru konfigürasyon
- [x] `package.json` → Build script mevcut
- [x] Tailwind CSS v4 → Doğru çalışıyor

### Router
- [x] React Router v7 → Data mode
- [x] SPA redirects → netlify.toml'da mevcut

---

## 🌐 SUPABASE HAZIRLIĞI

### Gerekli Adımlar (Manuel - Deployment sırasında)
- [ ] Supabase projesi oluşturuldu
- [ ] Edge function deploy edildi: `make-server-b69488c3`
- [ ] Edge function secrets ayarlandı:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `SUPABASE_DB_URL`
- [ ] Health check testi yapıldı

---

## 🚀 NETLIFY HAZIRLIĞI

### Gerekli Adımlar (Manuel - Deployment sırasında)
- [ ] GitHub repository oluşturuldu
- [ ] Kod GitHub'a push'landı
- [ ] Netlify hesabı var
- [ ] Netlify environment variables ayarlandı:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`

---

## 🔒 GÜVENLİK KONTROLÜ

### Kritik Kontroller
- [x] `.env` dosyası `.gitignore`'da
- [x] Service role key frontend'e expose olmuyor
- [x] Environment variables `VITE_` prefix ile public
- [x] Private keys sadece backend'de (Supabase secrets)

### Headers
- [x] Security headers netlify.toml'da
- [x] CORS backend'de yapılandırılmış

---

## 📦 BUILD TESTİ

Lokal'de build'i test edin:

```bash
# 1. Dependencies kur
npm install

# 2. Build al
npm run build

# 3. Build başarılı mı kontrol et
ls -la dist/

# 4. Preview mod ile test et
npm run preview
# → http://localhost:4173 açılır

# 5. Tarayıcıda test et
# - Ana sayfa açılıyor mu?
# - Routing çalışıyor mu?
# - API çağrıları başarılı mı?
```

---

## 🎯 DEPLOYMENT SONRASI

Deploy ettikten sonra bunları kontrol et:

### Fonksiyonellik Testi
- [ ] Ana sayfa açılıyor
- [ ] Routing çalışıyor (404 yok)
- [ ] Login/Logout çalışıyor
- [ ] Admin panel erişilebilir (admin kullanıcıyla)
- [ ] Video sayfası açılıyor
- [ ] Blog sayfası açılıyor
- [ ] API çağrıları başarılı

### Performance
- [ ] Sayfa yükleme hızı < 3 saniye
- [ ] Images optimize
- [ ] CSS/JS minified

### Mobile Test
- [ ] Responsive tasarım çalışıyor
- [ ] Mobile menü açılıyor
- [ ] Touch events çalışıyor

### Browser Test
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## 🆘 SORUN GİDERME

### Build Hatası
```
Error: Cannot find module...
→ npm install çalıştır
→ node_modules silip yeniden npm install
```

### Environment Variable Hatası
```
Undefined import.meta.env.VITE_...
→ Netlify environment variables kontrol et
→ VITE_ prefix var mı?
→ Redeploy yap
```

### 404 Hatası
```
Pages return 404
→ netlify.toml var mı?
→ Redirects doğru mu?
→ Publish directory "dist" mi?
```

### API Hatası
```
Failed to fetch from backend
→ Supabase edge function deploy edildi mi?
→ Secrets doğru mu?
→ CORS headers var mı?
```

---

## 📝 NOTLAR

### Önemli
- ⚠️ `.env` dosyası ASLA Git'e pushlanmamalı
- ⚠️ Service role key ASLA frontend'de kullanılmamalı
- ⚠️ İlk deploy'dan sonra mutlaka admin kullanıcı oluşturun

### Best Practices
- ✅ Her deployment'tan önce bu listeyi kontrol et
- ✅ Staging environment kullan (Netlify branch deploys)
- ✅ Database backup düzenli al (Supabase otomatik)
- ✅ Error monitoring ekle (Sentry, vb.)

---

## ✅ HAZIR MI?

Tüm checklistleri tamamladıysan:

```bash
# Git'e commit
git add .
git commit -m "🚀 Production ready"
git push origin main

# Netlify otomatik deploy edecek!
```

**BAŞARILAR! 🚀**
