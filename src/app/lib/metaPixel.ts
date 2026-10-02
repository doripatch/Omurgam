// Meta (Facebook/Instagram) Pixel — KVKK/GDPR uyumlu
// Yalnızca "Pazarlama" çerez onayı verildiğinde yüklenir. Onay yoksa script yüklenmez, çerez yazılmaz.
// Onay geri çekilirse gönderim durur ve Meta çerezleri (_fbp, _fbc) silinir.
// Pixel ID: Meta Events Manager → Veri kaynakları → Pixel. Boşken modül hiçbir şey yapmaz.
export const META_PIXEL_ID = '37115378038110532';

let pixelLoaded = false;
let marketingAllowed = false;
let currentKey: string | null = null;
let sentKey: string | null = null;

function ensureFbq(): (...args: any[]) => void {
  const w = window as any;
  if (w.fbq) return w.fbq;
  // Meta'nın resmî snippet'iyle aynı kuyruk: script yüklenene kadar çağrılar biriktirilir.
  const n: any = function (...args: any[]) {
    if (n.callMethod) n.callMethod.apply(n, args);
    else n.queue.push(args);
  };
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  w.fbq = n;
  if (!w._fbq) w._fbq = n;
  return n;
}

function loadPixel() {
  if (pixelLoaded || !META_PIXEL_ID || typeof window === 'undefined') return;
  pixelLoaded = true;
  const fbq = ensureFbq();
  // Otomatik buton/form olayı toplamayı kapat: yalnız elle gönderdiğimiz PageView gider.
  fbq('set', 'autoConfig', false, META_PIXEL_ID);
  fbq('init', META_PIXEL_ID);
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
}

function sendPageview() {
  if (!marketingAllowed || !pixelLoaded || !currentKey || sentKey === currentKey) return;
  sentKey = currentKey;
  ensureFbq()('track', 'PageView');
}

function clearMetaCookies() {
  const host = window.location.hostname;
  const domains = ['', host, '.' + host.replace(/^www\./, '')];
  for (const name of ['_fbp', '_fbc']) {
    for (const d of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ''}`;
    }
  }
}

// Pazarlama onayı verildiğinde: Pixel'i yükle, mevcut sayfayı bir kez say
export function grantMarketingConsent() {
  if (typeof window === 'undefined' || !META_PIXEL_ID) return;
  marketingAllowed = true;
  loadPixel();
  ensureFbq()('consent', 'grant');
  sendPageview();
}

// Pazarlama onayı geri çekildiğinde: gönderimi durdur, Meta çerezlerini sil
export function revokeMarketingConsent() {
  if (typeof window === 'undefined') return;
  marketingAllowed = false;
  if (pixelLoaded) ensureFbq()('consent', 'revoke');
  clearMetaCookies();
}

// SPA sayfa geçişi. Aynı history anahtarı ikinci kez sayılmaz.
export function trackMetaPageview(key: string) {
  if (typeof window === 'undefined') return;
  currentKey = key;
  sendPageview();
}
