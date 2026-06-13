// Google Analytics 4 (GA4) entegrasyonu — KVKK uyumlu (yalnızca onay sonrası yüklenir)
const GA_ID = 'G-V0F1HS8QCH';
let loaded = false;

export function loadGA() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  function gtag(..._args: any[]) {
    w.dataLayer.push(arguments);
  }
  w.gtag = gtag;
  gtag('js', new Date());
  // İlk sayfa görüntülemeyi otomatik gönderme; SPA'da elle göndereceğiz
  gtag('config', GA_ID, { send_page_view: false, anonymize_ip: true });
}

export function trackPageview(path: string) {
  const w = window as any;
  if (!loaded || !w.gtag) return;
  w.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function isGALoaded() {
  return loaded;
}
