# 🚀 Netlify Deployment Rehberi

Bu rehber, "Omurgam Soruyor" projesini Netlify'da nasıl yayınlayacağınızı adım adım anlatıyor.

---

## 📋 Ön Hazırlık Kontrol Listesi

- ✅ Supabase projesi oluşturuldu
- ✅ Supabase veritabanı tabloları kuruldu (SUPABASE_SETUP.md'yi takip edin)
- ✅ Figma Make'den proje indirildi

---

## 🌐 Netlify Deployment Adımları

### 1️⃣ Projeyi Netlify'a Yükle

1. **Netlify Dashboard**'a git: https://app.netlify.com
2. **Sites** sekmesine tıkla
3. **Add new site** → **Deploy manually** seç
4. Figma Make'den indirdiğin **klasörü sürükle-bırak** (ya da "Browse to upload" ile seç)
5. Netlify otomatik olarak projeyi build edecek ve yayına alacak

---

### 2️⃣ Environment Variables (Çevre Değişkenleri) Ekle

Supabase'in çalışması için API anahtarlarını eklemelisin:

1. Netlify'da **Site settings** → **Environment variables** git
2. **Add a variable** tıkla
3. Şu değişkenleri ekle:

```
Key: VITE_SUPABASE_URL
Value: https://nfgtnnypfcnjnezwhbe.supabase.co
```

```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mZ3RubnlwY2ZjbmpuZXp3aGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MTQ0NTIsImV4cCI6MjA4OTA5MDQ1Mn0.hQoSGM9Dh-CAavLWAfUnXY278egV0siStejIQmdVSPE
```

4. **Save** tıkla

---

### 3️⃣ Siteyi Yeniden Deploy Et

Environment variables ekledikten sonra:

1. **Deploys** sekmesine git
2. **Trigger deploy** → **Clear cache and deploy site** tıkla
3. Build tamamlanana kadar bekle (~2-3 dakika)

---

### 4️⃣ Özel Domain Ekle (Opsiyonel)

Kendi domain'ini (örn: omurgamsoruyor.com) kullanmak istiyorsan:

1. **Domain settings** → **Add custom domain** tıkla
2. Domain adını gir (örn: `omurgamsoruyor.com`)
3. DNS ayarlarını domain sağlayıcında (GoDaddy, Namecheap vs.) düzenle:

**A Record:**
```
Type: A
Name: @
Value: 75.2.60.5
```

**CNAME Record (www için):**
```
Type: CNAME
Name: www
Value: your-site-name.netlify.app
```

4. Netlify otomatik olarak **SSL sertifikası** (HTTPS) ekleyecek

---

## 👤 İlk Admin Kullanıcısını Oluştur

Siten yayına alındıktan sonra:

### 1. Kayıt Ol
- Sitenize gidin: `https://your-site.netlify.app/login`
- **Kayıt Ol** tıklayın
- E-posta ve şifre belirleyin

### 2. Admin Yetkisi Ver

Supabase Dashboard'a git:

1. **SQL Editor** sekmesine tıkla
2. **New Query** tıkla
3. Şu SQL kodunu çalıştır:

```sql
-- Önce user_id'nizi bulun
SELECT id, email FROM auth.users;

-- YOUR_USER_ID'yi yukarıdaki sorgudan aldığınız ID ile değiştirin
INSERT INTO user_roles (user_id, role) 
VALUES ('YOUR_USER_ID', 'admin');
```

4. **Run** tıkla

### 3. Admin Paneline Giriş

Artık `/admin` sayfasına gidebilir ve içerik yönetmeye başlayabilirsiniz!

---

## 🔧 Güncelleme Nasıl Yapılır?

Projede değişiklik yaptığınızda:

### Manuel Deployment:
1. Figma Make'den güncel projeyi indir
2. Netlify'da **Deploys** → **Deploy manually** tıkla
3. Yeni klasörü yükle

### Otomatik Deployment (GitHub ile):
1. Projeyi GitHub'a yükle
2. Netlify'da **Site settings** → **Build & deploy** → **Link to Git repository**
3. Her commit'te otomatik deploy olur

---

## 🗄️ Veritabanı Yönetimi

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Table Editor**: Verileri manuel ekle/düzenle
- **SQL Editor**: Toplu işlemler için SQL komutları çalıştır
- **Storage**: Görsel ve video dosyaları yükle

---

## 📊 Admin Panel Özellikleri

Sitenizde `/admin` adresinden erişebileceğiniz özellikler:

### ✅ Dashboard
- Toplam video sayısı
- Bekleyen soru sayısı
- Blog yazıları
- İstatistikler

### 📹 Video Yönetimi
- Yeni video ekle
- Videoları düzenle/sil
- Yayınla/Yayından kaldır

### ❓ Soru Moderasyonu
- Kullanıcı sorularını gör
- Soruları onayla/reddet
- Yanıtlandı olarak işaretle
- Soruları sil

### 📝 Blog Yönetimi
- Yeni blog yazısı ekle
- Yazıları düzenle/sil
- Yayınla/Taslak

### 👥 Kullanıcı Yönetimi
- Kullanıcıları gör
- Admin yetkileri ata

---

## 🔒 Güvenlik Notları

⚠️ **ÖNEMLİ:**

1. **API Anahtarları**: `VITE_SUPABASE_ANON_KEY` public anahtardır, güvenlidir. Asla `service_role` anahtarını kullanmayın!

2. **Row Level Security (RLS)**: Supabase tablolarınızda RLS aktif. Normal kullanıcılar sadece izin verilen verileri görebilir.

3. **Admin Kontrol**: Admin paneline sadece `user_roles` tablosunda `admin` rolü olan kullanıcılar erişebilir.

4. **Hassas Veriler**: Figma Make, kişisel sağlık verileri veya hassas bilgiler toplamak için tasarlanmamıştır.

---

## 🆘 Sorun Giderme

### Sayfa Boş Görünüyor
- Environment variables eklenmiş mi kontrol et
- Netlify'da "Clear cache and deploy" yap
- Tarayıcı konsolunda hata var mı kontrol et (F12)

### "Yetkisiz Erişim" Hatası
- Supabase'de kendinize admin rolü atadınız mı kontrol edin
- `user_roles` tablosuna kayıt eklenmiş mi kontrol edin

### Supabase Bağlantı Hatası
- VITE_SUPABASE_URL doğru mu?
- VITE_SUPABASE_ANON_KEY doğru mu?
- Supabase projeniz aktif mi?

### Build Hatası
- `package.json` dosyası var mı?
- Node.js versiyonu uyumlu mu? (Netlify otomatik algılar)

---

## 📞 Destek

- **Netlify Dokümanlar**: https://docs.netlify.com
- **Supabase Dokümanlar**: https://supabase.com/docs

---

## 🎉 Tebrikler!

Siteniz artık canlı ve admin paneliniz hazır! 🚀

**Örnek URL'ler:**
- Ana Sayfa: `https://your-site.netlify.app`
- Giriş: `https://your-site.netlify.app/login`
- Admin Panel: `https://your-site.netlify.app/admin`
