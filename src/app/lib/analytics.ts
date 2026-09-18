// Google Analytics 4 (GA4) + Google Consent Mode v2 — KVKK/GDPR uyumlu
// Varsayılan olarak tüm izinler "denied"; kullanıcı analitiği onaylayınca "granted".
const GA_ID = 'G-V0F1HS8QCH';
let gaScriptLoaded = false;
let consentDefaultsSet = false;
let analyticsAllowed = false;
type Visit = { path: string; key: string; url: string; sent: boolean };
let visit: Visit | null = null;
let metadata: { key: string; title: string; ready: boolean } | null = null;
let pageviewTimer: ReturnType<typeof setTimeout> | undefined;

function cancelPageviewTimer() {
  clearTimeout(pageviewTimer);
  pageviewTimer = undefined;
}

function sendPageview() {
  cancelPageviewTimer();
  if (!analyticsAllowed || !gaScriptLoaded || !visit || visit.sent) return;
  visit.sent = true;
  const title = metadata?.key === visit.key && metadata.ready ? metadata.title : visit.path;
  ensureGtag()('event', 'page_view', {
    page_path: visit.path,
    page_location: visit.url,
    // Never attribute a previous page's title to this visit.
    page_title: title,
  });
}

function schedulePageview() {
  cancelPageviewTimer();
  if (!analyticsAllowed || !visit || visit.sent) return;
  // Let React finish its effects. Async titles may arrive later; pages without
  // SEO metadata still get counted, with their path as a neutral title.
  const ready = metadata?.key === visit.key && metadata.ready;
  pageviewTimer = setTimeout(sendPageview, ready ? 0 : 3000);
}

export function setAnalyticsPageTitle(key: string, title: string, ready = true) {
  metadata = { key, title, ready };
  schedulePageview();
}

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

function loadGA() {
  if (gaScriptLoaded || typeof window === 'undefined') return;
  gaScriptLoaded = true;
  // Flush a short visit before a full navigation/tab close, without waiting for
  // async metadata. The consent/sent guards still apply.
  window.addEventListener('pagehide', sendPageview);

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
  analyticsAllowed = true;
  loadGA();
  schedulePageview();
}

// Analitik onayı geri çekildiğinde: izni "denied" yap
export function revokeAnalyticsConsent() {
  if (typeof window === 'undefined') return;
  initConsentDefaults();
  analyticsAllowed = false;
  cancelPageviewTimer();
  const gtag = ensureGtag();
  gtag('consent', 'update', { analytics_storage: 'denied' });
}

export function trackPageview(path: string, key: string) {
  if (typeof window === 'undefined') return;
  // Repeated effects/consent changes are not new visits. Returning via Back
  // after another route IS a new visit, even if its history key was seen before.
  if (visit?.key === key && visit.path === path) return;
  sendPageview();
  visit = { path, key, url: window.location.href, sent: false };
  schedulePageview();
}

export function isGALoaded() {
  return gaScriptLoaded;
}
