// Google Analytics 4 (GA4) + Google Consent Mode v2 — KVKK/GDPR uyumlu
// Varsayılan olarak tüm izinler "denied"; kullanıcı analitiği onaylayınca "granted".
const GA_ID = 'G-V0F1HS8QCH';
let gaScriptLoaded = false;
let consentDefaultsSet = false;

function ensureGtag(): (...args: any[]) => void {
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  if (!w.gtag) {
    w.gtag = function () {
      w.dataLayer.push(arguments);
    };
  }
  return w.gtag;
}

// Consent Mode v2 varsayılanları — uygulama açılır açılmaz, GA yüklenmeden ÖNCE çağrılır.
// Hiçbir çerez yazmaz; yalnızca izin durumunu "denied" olarak kaydeder.
export function initConsentDefaults() {
  if (typeof window === 'undefined' || consentDefaultsSet) return;
  consentDefaultsSet = true;
  const gtag = ensureGtag();
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500,
  });
}

export function loadGA() {
  if (gaScriptLoaded || typeof window === 'undefined') return;
  gaScriptLoaded = true;

  const gtag = ensureGtag();
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  gtag('js', new Date());
  // SPA: ilk sayfa görüntülemeyi otomatik gönderme; elle göndereceğiz
  gtag('config', GA_ID, { send_page_view: false, anonymize_ip: true });
}

// Analitik onayı verildiğinde: Consent Mode'u güncelle + GA'yı yükle
export function grantAnalyticsConsent() {
  if (typeof window === 'undefined') return;
  initConsentDefaults();
  const gtag = ensureGtag();
  gtag('consent', 'update', { analytics_storage: 'granted' });
  loadGA();
}

// Analitik onayı geri çekildiğinde: izni "denied" yap
export function revokeAnalyticsConsent() {
  if (typeof window === 'undefined') return;
  initConsentDefaults();
  const gtag = ensureGtag();
  gtag('consent', 'update', { analytics_storage: 'denied' });
}

export function trackPageview(path: string) {
  const w = window as any;
  if (!gaScriptLoaded || !w.gtag) return;
  w.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function isGALoaded() {
  return gaScriptLoaded;
}
