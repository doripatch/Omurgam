// Video URL migrasyonu — merkezi çözümleme (SALT-OKUNUR).
// Tek kaynak: src/app/data/videoUrlMap.json (kilitli manifest v1'den üretildi).
// API/DB'ye YAZMAZ. Sayaç/favori/yorum/like davranışı canonical UUID üzerinden korunur.
import rawMap from '../data/videoUrlMap.json';

export const ORIGIN = 'https://omurgam.com';

export type VideoDisposition = 'unique' | 'canonical-candidate' | 'duplicate-candidate';

export interface VideoMigrationRecord {
  id: string;
  youtubeId: string;
  slug: string;
  oldUrl: string;
  newUrl: string;
  canonicalCandidateId: string;
  disposition: VideoDisposition;
}

const records = rawMap as VideoMigrationRecord[];

const byId = new Map<string, VideoMigrationRecord>(records.map((r) => [r.id, r]));
// slug -> canonical UUID (canonical + duplicate'ler aynı slug'ı paylaşır, hepsi canonical'a çözülür)
const canonicalIdBySlugMap = new Map<string, string>(records.map((r) => [r.slug, r.canonicalCandidateId]));
// youtubeId -> canonical UUID
const canonicalIdByYouTubeMap = new Map<string, string>(records.map((r) => [r.youtubeId, r.canonicalCandidateId]));

/** id -> manifest kaydı. */
export function videoRecordById(id?: string | null): VideoMigrationRecord | undefined {
  return id ? byId.get(id) : undefined;
}

/** slug -> canonical UUID (bilinmeyen slug: undefined — YANLIŞ videoya fallback etmez). */
export function canonicalIdBySlug(slug?: string | null): string | undefined {
  return slug ? canonicalIdBySlugMap.get(slug) : undefined;
}

/** Herhangi bir kayıt id'si -> canonical yeni URL (/videolar/<slug>/). Duplicate'ler canonical hedefe döner.
 *  Sondaki "/" prerender dizin yapısıyla eşleşir (Netlify'da ek 301 olmaz). */
export function videoNewUrlById(id?: string | null): string | undefined {
  const u = id ? byId.get(id)?.newUrl : undefined;
  return u ? `${u}/` : undefined;
}

/** Link hedefi: haritadaki video -> /videolar/<slug>/, gece senkronundan önce eklenmiş yeni video -> eski /video/<UUID>
 *  (o route çalışmaya devam eder; asla kırık link üretmez). */
export function videoHref(id: string): string {
  return videoNewUrlById(id) || `/video/${id}`;
}

/** youtubeId -> canonical UUID. */
export function canonicalIdByYouTubeId(youtubeId?: string | null): string | undefined {
  return youtubeId ? canonicalIdByYouTubeMap.get(youtubeId) : undefined;
}

/** Kayıt canonical mı? (unique veya canonical-candidate → id === canonicalCandidateId). */
export function isCanonicalId(id?: string | null): boolean {
  const r = id ? byId.get(id) : undefined;
  return !!r && r.id === r.canonicalCandidateId;
}

/** Canonical UUID kümesi. */
const canonicalIdSet = new Set<string>(records.filter((r) => r.id === r.canonicalCandidateId).map((r) => r.id));
export function canonicalIdSetView(): ReadonlySet<string> {
  return canonicalIdSet;
}

/**
 * Verilen video listesini canonical kümeye indirir (duplicate kayıtlar yalnız gösterimde elenir).
 * Sıralama KORUNUR (deterministik); duplicate kayıtlar elenir; DB'ye dokunmaz.
 * Haritada olmayan (bilinmeyen) id'ler güvenli şekilde OLDUĞU GİBİ tutulur (yanlış videoya map etmez).
 */
export function dedupeToCanonical<T extends { id: string }>(list: T[]): T[] {
  const out: T[] = [];
  const seenCanon = new Set<string>();
  for (const item of list) {
    const rec = byId.get(item.id);
    if (!rec) { out.push(item); continue; } // haritada yoksa aynen bırak (fallback yok)
    if (rec.id !== rec.canonicalCandidateId) continue; // duplicate → atla (silme YOK, yalnız gösterimde gizle)
    if (seenCanon.has(rec.canonicalCandidateId)) continue;
    seenCanon.add(rec.canonicalCandidateId);
    out.push(item);
  }
  return out;
}

export function allVideoRecords(): readonly VideoMigrationRecord[] {
  return records;
}

// --- Doğrulama (DEV + build script paylaşır) ---
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function validateVideoMap(): { ok: boolean; errors: string[] } {
  // Sabit sayı YOK (harita gece senkronuyla büyür); scripts/validate-video-map.mjs ile aynı yapısal kurallar.
  const errors: string[] = [];
  if (records.length < 43) errors.push(`en az 43 kayıt beklenirken ${records.length}`);
  const ids = new Set<string>();
  const oldUrls = new Set<string>();
  for (const r of records) {
    if (ids.has(r.id)) errors.push(`yinelenen id: ${r.id}`); ids.add(r.id);
    if (oldUrls.has(r.oldUrl)) errors.push(`yinelenen oldUrl: ${r.oldUrl}`); oldUrls.add(r.oldUrl);
    if (!r.slug || !SLUG_RE.test(r.slug)) errors.push(`boş/geçersiz slug: ${r.id}`);
    if (r.newUrl !== `/videolar/${r.slug}`) errors.push(`slug/newUrl uyumsuz: ${r.id}`);
    if (!/^\/video\/[0-9a-f-]{36}$/.test(r.oldUrl)) errors.push(`geçersiz oldUrl: ${r.oldUrl}`);
    const can = byId.get(r.canonicalCandidateId);
    if (!can) errors.push(`canonical kayıt yok: ${r.id}`);
    else if (r.newUrl !== can.newUrl) errors.push(`duplicate→canonical hedef uyumsuz: ${r.id}`);
  }
  const canonSlugs = new Set(records.filter((r) => r.id === r.canonicalCandidateId).map((r) => r.slug));
  if (canonSlugs.size !== canonicalIdSet.size) errors.push('canonical slug çakışması');
  return { ok: errors.length === 0, errors };
}

if (import.meta.env.DEV) {
  const v = validateVideoMap();
  if (!v.ok) throw new Error(`[videoMigration] harita doğrulaması başarısız: ${v.errors.join(' | ')}`);
}
