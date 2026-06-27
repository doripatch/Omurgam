// Merkezi çerez/izin yönetimi (KVKK/GDPR)
// Kategoriler: necessary (her zaman açık), analytics, media (gömülü içerik: YouTube)
import { grantAnalyticsConsent, revokeAnalyticsConsent } from './analytics';

export interface ConsentState {
  analytics: boolean;
  media: boolean;
}

const KEY = 'omurgam_cookie_consent_v2';
const OLD_KEY = 'omurgam_cookie_consent'; // eski "accepted" / "rejected"

type Listener = (c: ConsentState | null) => void;
const listeners = new Set<Listener>();

export function getConsent(): ConsentState | null {
  try {
    const v = localStorage.getItem(KEY);
    if (v) {
      const p = JSON.parse(v);
      return { analytics: !!p.analytics, media: !!p.media };
    }
    // Eski anahtardan geçiş (yeniden sormamak için)
    const old = localStorage.getItem(OLD_KEY);
    if (old === 'accepted') return { analytics: true, media: true };
    if (old === 'rejected') return { analytics: false, media: false };
  } catch {}
  return null;
}

export function setConsent(c: ConsentState) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...c, ts: Date.now() }));
  } catch {}
  applyConsent(c);
  listeners.forEach((l) => l(c));
}

export function applyConsent(c: ConsentState) {
  if (c.analytics) grantAnalyticsConsent();
  else revokeAnalyticsConsent();
}

export function subscribeConsent(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

// Banner'ı sonradan yeniden açmak için (footer "Çerez Tercihleri" linki)
let openHandler: (() => void) | null = null;
export function registerOpenPreferences(fn: () => void) {
  openHandler = fn;
}
export function openCookiePreferences() {
  if (openHandler) openHandler();
}
