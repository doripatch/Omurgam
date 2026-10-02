// Merkezi çerez/izin yönetimi (KVKK/GDPR)
// Kategoriler: necessary (her zaman açık), analytics, media (gömülü içerik: YouTube),
// marketing (reklam ölçümü: Meta Pixel)
import { grantAnalyticsConsent, revokeAnalyticsConsent } from './analytics';
import { grantMarketingConsent, revokeMarketingConsent } from './metaPixel';

export interface ConsentState {
  analytics: boolean;
  media: boolean;
  marketing: boolean;
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
      return { analytics: !!p.analytics, media: !!p.media, marketing: p.marketing === true };
    }
    // Eski anahtardan geçiş (yeniden sormamak için). Pazarlama o zaman sorulmadığı için kapalı.
    const old = localStorage.getItem(OLD_KEY);
    if (old === 'accepted') return { analytics: true, media: true, marketing: false };
    if (old === 'rejected') return { analytics: false, media: false, marketing: false };
  } catch {}
  return null;
}

// Pazarlama kategorisi sonradan eklendi: daha önce tercih yapmış ama bu soruyu
// hiç görmemiş ziyaretçiye banner bir kez daha gösterilir (onay varsayılmaz).
export function hasMarketingDecision(): boolean {
  try {
    const v = localStorage.getItem(KEY);
    return !!v && typeof JSON.parse(v).marketing === 'boolean';
  } catch {
    return false;
  }
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
  if (c.marketing) grantMarketingConsent();
  else revokeMarketingConsent();
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
