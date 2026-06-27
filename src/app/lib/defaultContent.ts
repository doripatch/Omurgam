// =============================================================
// OMURGAM - MERKEZİ İÇERİK VARSAYILANLARI
// Sitedeki tüm metinlerin varsayılan değerleri burada tutulur.
// Admin panelinden yapılan değişiklikler bu değerlerin ÜZERİNE yazılır.
// Bir alan panelde boş/eksik olsa bile site buradaki değerle çalışır,
// yani site ASLA boş/bozuk görünmez.
// =============================================================

export const DEFAULT_CONTENT = {
  // ---- Genel ----
  siteName: 'Omurgam',
  siteTagline: 'Prof. Dr. Defne Kaya Utlu',
  logoText: 'Omurgam',

  // ---- İletişim Bilgileri (footer + iletişim sayfası ortak) ----
  email: 'info@omurgam.com',
  phone: '+90 (212) 123 45 67',
  address: 'İstanbul, Türkiye',

  // ---- Sosyal Medya ----
  instagram: '',
  youtube: '',
  linkedin: '',
  facebook: '',
  twitter: '',

  // ---- Footer ----
  footerAbout: 'Omurga sağlığınız hakkında bilimsel bilgiler ve eğitici içerikler.',
  footerDisclaimer: 'Bu sitede sunulan bilgiler tıbbi değerlendirme, tanı veya tedavinin yerine geçmez. Genel bilgilendirme amacıyla hazırlanmıştır. Doğru tedavinin ilk adımı doğru tanıdır. Bunun için öncelikle bir hekim değerlendirmesi gereklidir. Tedavi süreci ise tanıya ve bireysel ihtiyaçlara göre planlanmalıdır.',
  footerCopyright: '© 2026 Omurgam. Tüm hakları saklıdır.',

  // ---- Yasal ----
  privacyPolicy: '',
  termsOfService: '',

  // ---- SEO ----
  metaDescription: 'Omurga sağlığı hakkında bilimsel bilgiler, videolar ve uzman yanıtlar.',
  metaKeywords: 'omurga, bel ağrısı, boyun ağrısı, fizyoterapi',

  // ---- Hakkımda (kısa alanlar; detaylı özgeçmiş sayfada) ----
  aboutTitle: 'Prof. Dr. Defne Kaya Utlu',
  aboutContent: 'Fizyoterapi Profesörü',

  // ---- Menü (Navigasyon) ----
  nav: {
    videos: 'Omurgam Anlatıyor',
    blog: 'Blog',
    forum: 'Forum',
    glossary: 'Sözlük',
    about: 'Hakkımızda',
    faq: 'SSS',
    contact: 'İletişim',
    loginButton: 'Giriş / Kayıt',
    adminButton: 'Admin',
    profileButton: 'Profilim',
    logoutButton: 'Çıkış Yap',
  },

  // ---- Footer bölüm başlıkları ----
  footer: {
    quickLinksTitle: 'Hızlı Erişim',
    infoTitle: 'Bilgi',
    followTitle: 'Takip Edin',
  },

  // ---- ANA SAYFA ----
  home: {
    // Hero
    badge: 'Prof. Dr. Defne Kaya Utlu',
    title: 'Omurgam',
    subtitlePrefix: 'Omurga sağlığınız için',
    subtitleHighlight: 'bilimsel bilgilendirme',
    subtitleSuffix: 'platformu',
    ctaVideos: 'Omurgam Anlatıyor',
    ctaGlossary: 'Terim Sözlüğü',
    scrollText: 'Aşağı Kaydır',

    // İstatistik barı
    stats: [
      { number: '150+', label: 'Bilgilendirme Videosu' },
      { number: '50+', label: 'Tıbbi Terim' },
      { number: '24/7', label: 'Erişim' },
      { number: '100%', label: 'Bilimsel İçerik' },
    ],

    // Forum bölümü
    forumBadge: 'Topluluk Forumu',
    forumTitle: 'Soru & Cevap',
    forumDesc: 'Omurga sağlığı hakkında merak ettiklerinizi sorun, deneyimlerinizi paylaşın',
    forumCta: 'Yeni Soru Sor',
    forumViewAll: 'Tüm Soruları Görüntüle',
    forumLoading: 'Sorular yükleniyor...',

    // Özellikler (Bento) bölümü
    featuresTitle: 'Neler Sunuyoruz?',
    featuresDesc: 'Omurga sağlığınız için ihtiyacınız olan her şey, bir arada',
    cardVideoBadge: '150+ VİDEO',
    cardVideoTitle: 'Omurgam Anlatıyor',
    cardVideoDesc: 'Profesyonel fizyoterapist rehberliğinde hazırlanmış egzersiz ve bilgilendirme videoları',
    cardVideoCta: 'Keşfet',
    cardGlossaryTitle: 'Terim Sözlüğü',
    cardGlossaryDesc: 'MR raporu terimlerini anlayın',
    cardAskTitle: 'Soru Sor',
    cardAskDesc: 'Sorularınızı paylaşın',
    cardBlogTitle: 'Blog & Makaleler',
    cardBlogDesc: 'Güncel sağlık bilgileri',
    cardAccountTitle: 'Hesap Oluştur',
    cardAccountDesc: 'Tüm özelliklere erişim',
    cardAccountCta: 'Başla',

    // Neden Omurgam bölümü
    whyBadge: 'Neden Omurgam?',
    whyTitleLine1: 'Bilimsel ve',
    whyTitleHighlight: 'Güvenilir İçerik',
    whyDesc: "Prof. Dr. Defne Kaya Utlu'nun akademik bilgi birikimi ve klinik deneyimiyle hazırlanmış, Sağlık Bakanlığı prosedürlerine uygun bilgilendirme içerikleri.",
    whyItems: [
      'Fizyoterapi profesörü tarafından hazırlanmış içerikler',
      'Bilimsel araştırmalara dayalı bilgiler',
      'Sağlık Bakanlığı prosedürlerine uygun',
      'Sürekli güncellenen video arşivi',
    ],
    whyCardName: 'Prof. Dr. Defne Kaya Utlu',
    whyCardRole: 'Fizyoterapi Profesörü',
    whyImage: '/assets/defne-hoca.jpg',

    // Ana sayfa "Hakkımızda" bölümü
    aboutTitle: 'Omurgam Hakkında',
    aboutText: "Omurgam, Prof. Dr. Defne Kaya Utlu öncülüğünde hazırlanan, omurga sağlığı konusunda bilimsel ve anlaşılır bilgi sunan bir platformdur. Amacımız; MR raporundaki terimlerden egzersiz önerilerine, sık yapılan yanlışlardan uzman yanıtlarına kadar güvenilir bilgiyi herkes için erişilebilir kılmaktır.",
    aboutCta: 'Daha Fazla Bilgi',

    // Ana sayfa "Sözlük" tanıtım bölümü
    glossaryTitle: 'Tıbbi Terimleri Anlayın',
    glossaryDesc: 'MR raporunuzdaki ya da doktorunuzun kullandığı terimleri sade Türkçe açıklamalarıyla öğrenin.',
    glossaryCta: 'Sözlüğe Göz At',

    // Ana sayfa "Doğru Bilinen Yanlışlar" bölümü
    mythsTitle: 'Doğru Bilinen Yanlışlar',
    mythsDesc: 'Omurga sağlığı hakkında en sık karşılaşılan yanlış inanışlar ve doğruları.',

    // Ana sayfa sosyal medya bölümü
    socialTitle: 'Bizi Takip Edin',
    socialDesc: 'Yeni içerikler ve sağlık ipuçları için sosyal medyada bize katılın.',

    // Final CTA bölümü
    ctaTitle: 'Omurga Sağlığınız İçin İlk Adım',
    ctaDesc: 'Hemen üye olun, video arşivine erişin ve omurga sağlığınız hakkında bilgi edinin',
    ctaPrimary: 'Ücretsiz Kayıt Ol',
    ctaSecondary: 'Videoları İncele',

    // Disclaimer
    disclaimer:
      'ÖNEMLİ: Bu platform yalnızca bilgilendirme amaçlıdır. Burada yer alan bilgiler tıbbi teşhis, tedavi veya reçete yerine geçmez. Sağlık sorunlarınız için mutlaka hekiminize danışın. Prof. Dr. Defne Kaya Utlu fizyoterapi profesörü olup, tıbbi tedavi uygulamaz.',
  },

  // ---- İLETİŞİM SAYFASI ----
  contact: {
    badge: 'Bize Ulaşın',
    title: 'İletişim',
    subtitle: 'Sorularınız, önerileriniz veya görüşleriniz için bizimle iletişime geçebilirsiniz.',
    emailCardTitle: 'E-posta',
    emailCardDesc: 'Bize e-posta gönderin',
    phoneCardTitle: 'Telefon',
    phoneCardDesc: 'Hafta içi 09:00 - 18:00',
    addressCardTitle: 'Adres',
    addressText: 'İstanbul Üniversitesi Tıp Fakültesi\nFiziksel Tıp ve Rehabilitasyon Ana Bilim Dalı\nFatih / İstanbul',
    hoursTitle: 'Çalışma Saatleri',
    hoursWeekdayLabel: 'Pazartesi - Cuma',
    hoursWeekdayValue: '09:00 - 18:00',
    hoursSatLabel: 'Cumartesi',
    hoursSatValue: '09:00 - 13:00',
    hoursSunLabel: 'Pazar',
    hoursSunValue: 'Kapalı',
    formTitle: 'Mesaj Gönderin',
    formNameLabel: 'Adınız Soyadınız',
    formEmailLabel: 'E-posta Adresiniz',
    formSubjectLabel: 'Konu',
    formMessageLabel: 'Mesajınız',
    formButton: 'Mesajı Gönder',
    note: 'Mesajınız en geç 2 iş günü içerisinde yanıtlanacaktır. Acil durumlar için lütfen telefon ile iletişime geçiniz.',
    successToast: 'Mesajınız alındı! En kısa sürede dönüş yapacağız.',
  },

  // ---- SSS SAYFASI (sorular dinamik; sadece çerçeve metinleri) ----
  faq: {
    badge: 'Sıkça Sorulan Sorular',
    title: 'SSS',
    subtitle: 'Platform kullanımı ve omurga sağlığı hakkında merak ettikleriniz',
    searchPlaceholder: 'Soru ara...',
    notFound: 'Aradığınız soruyu bulamadık.',
    notFoundHint: 'Farklı bir arama terimi deneyin veya soru-cevap forumundan sorun.',
    helpTitle: 'Sorunuzu bulamadınız mı?',
    helpDesc: 'Soru-cevap forumundan sorunuzu sorabilir veya bizimle iletişime geçebilirsiniz.',
    helpCta1: 'Soru Sor',
    helpCta2: 'İletişime Geç',
  },
};

export type SiteContent = typeof DEFAULT_CONTENT;
