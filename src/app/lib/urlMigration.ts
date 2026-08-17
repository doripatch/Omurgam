// URL migrasyonu — merkezi çözümleme yardımcı modülü (Faz 1).
// Tek kaynak: src/app/data/urlMigrationMap.json (kilitli manifest v1.1'den üretildi).
// Bu modül SALT-OKUNUR eşleme sağlar; API/DB'ye yazmaz.
import rawMap from '../data/urlMigrationMap.json';

export const ORIGIN = 'https://omurgam.com';

export type ContentFamily = 'kaleminden' | 'saglikli-yasam' | 'yatak-yastik' | 'klinisyenler';

export interface MigrationRecord {
  id: string;
  contentFamily: ContentFamily;
  slug: string;
  oldUrl: string | null;
  newUrl: string;
}

const records = rawMap as MigrationRecord[];

// URL yolu (path segmenti) -> contentFamily
export const BASE_TO_FAMILY: Record<string, ContentFamily> = {
  'omurgam-ne-diyor': 'kaleminden',
  'saglikli-yasam': 'saglikli-yasam',
  'yatak-yastik-rehberi': 'yatak-yastik',
  'klinisyenler': 'klinisyenler',
};

export const FAMILY_META: Record<ContentFamily, { base: string; name: string }> = {
  kaleminden: { base: '/omurgam-ne-diyor', name: 'Omurga Sağlığı Yazıları' },
  'saglikli-yasam': { base: '/saglikli-yasam', name: 'Sağlıklı Yaşam' },
  'yatak-yastik': { base: '/yatak-yastik-rehberi', name: 'Yatak ve Yastık Seçim Rehberi' },
  klinisyenler: { base: '/klinisyenler', name: 'Klinisyenlere Notlar' },
};

const byId = new Map<string, MigrationRecord>(records.map((r) => [r.id, r]));
const byFamilySlug = new Map<string, string>(records.map((r) => [`${r.contentFamily}/${r.slug}`, r.id]));
const clinBySlug = new Map<string, string>(
  records.filter((r) => r.contentFamily === 'klinisyenler').map((r) => [r.slug, r.id]),
);

/** ID -> manifest kaydı (yoksa undefined). */
export function recordById(id?: string | null): MigrationRecord | undefined {
  return id ? byId.get(id) : undefined;
}

/** ID -> yeni URL (yoksa undefined). */
export function newUrlById(id?: string | null): string | undefined {
  return id ? byId.get(id)?.newUrl : undefined;
}

/** contentFamily + slug -> ID (güvenli fallback: undefined). */
export function idByFamilySlug(family?: string | null, slug?: string | null): string | undefined {
  if (!family || !slug) return undefined;
  return byFamilySlug.get(`${family}/${slug}`);
}

/** URL path segmenti (ör. "saglikli-yasam") + slug -> ID. */
export function idByBaseSlug(base?: string | null, slug?: string | null): string | undefined {
  const fam = base ? BASE_TO_FAMILY[base] : undefined;
  return idByFamilySlug(fam, slug);
}

/** slug -> klinisyen ID (güvenli fallback: undefined). */
export function clinicianIdBySlug(slug?: string | null): string | undefined {
  return slug ? clinBySlug.get(slug) : undefined;
}

export function allRecords(): readonly MigrationRecord[] {
  return records;
}

// --- Doğrulama (DEV + build script paylaşır) ---
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function validateMigrationMap(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (records.length !== 262) errors.push(`toplam 262 beklenirken ${records.length}`);
  const counts: Record<string, number> = {};
  for (const r of records) counts[r.contentFamily] = (counts[r.contentFamily] || 0) + 1;
  const expected: Record<ContentFamily, number> = {
    kaleminden: 83, 'saglikli-yasam': 67, 'yatak-yastik': 32, klinisyenler: 80,
  };
  for (const [fam, n] of Object.entries(expected)) {
    if (counts[fam] !== n) errors.push(`${fam}: ${n} beklenirken ${counts[fam] || 0}`);
  }
  const ids = new Set<string>(), slugs = new Set<string>(), urls = new Set<string>();
  let blogOld = 0;
  for (const r of records) {
    if (ids.has(r.id)) errors.push(`yinelenen id: ${r.id}`); ids.add(r.id);
    if (slugs.has(r.slug)) errors.push(`yinelenen slug: ${r.slug}`); slugs.add(r.slug);
    if (urls.has(r.newUrl)) errors.push(`yinelenen newUrl: ${r.newUrl}`); urls.add(r.newUrl);
    if (!r.slug || !SLUG_RE.test(r.slug)) errors.push(`boş/geçersiz slug: ${r.id}`);
    if (r.oldUrl) blogOld++;
  }
  if (blogOld !== 182) errors.push(`182 blog oldUrl beklenirken ${blogOld}`);
  return { ok: errors.length === 0, errors };
}

// DEV'de harita bozuksa erken ve gürültülü başarısız ol (build script ayrıca hard-fail eder).
if (import.meta.env.DEV) {
  const v = validateMigrationMap();
  if (!v.ok) throw new Error(`[urlMigration] harita doğrulaması başarısız: ${v.errors.join(' | ')}`);
}
