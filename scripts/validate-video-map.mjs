// Video URL migrasyon haritası build-zamanı doğrulaması.
// Başarısızsa exit(1) -> `npm run build` durur. src/app/lib/videoMigration.ts ile aynı kurallar.
// Sabit sayı YOK: harita gece senkronuyla (scripts/sync-video-map.mjs) büyür; yapısal kurallar denetlenir.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const map = JSON.parse(readFileSync(join(ROOT, 'src/app/data/videoUrlMap.json'), 'utf8'));

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DISP = new Set(['unique', 'canonical-candidate', 'duplicate-candidate']);
const errors = [];

// Ağustos'ta kilitlenen ilk 43 kayıt en az mevcut olmalı (harita yalnız büyür).
if (map.length < 43) errors.push(`en az 43 kayıt beklenirken ${map.length}`);

const ids = new Set(), oldUrls = new Set();
const byId = new Map(map.map((r) => [r.id, r]));
const canon = map.filter((r) => r.id === r.canonicalCandidateId);
for (const r of map) {
  if (ids.has(r.id)) errors.push(`yinelenen id: ${r.id}`); ids.add(r.id);
  if (oldUrls.has(r.oldUrl)) errors.push(`yinelenen oldUrl: ${r.oldUrl}`); oldUrls.add(r.oldUrl);
  if (!DISP.has(r.disposition)) errors.push(`geçersiz disposition: ${r.id}`);
  if (!r.slug || !SLUG_RE.test(r.slug)) errors.push(`boş/geçersiz slug: ${r.id}`);
  if (r.newUrl !== `/videolar/${r.slug}`) errors.push(`slug/newUrl uyumsuz: ${r.id}`);
  if (!/^\/video\/[0-9a-f-]{36}$/.test(r.oldUrl)) errors.push(`geçersiz oldUrl: ${r.oldUrl}`);
  if (r.oldUrl !== `/video/${r.id}`) errors.push(`oldUrl/id uyumsuz: ${r.id}`);
  const can = byId.get(r.canonicalCandidateId);
  if (!can) errors.push(`canonical kayıt yok: ${r.id}`);
  else {
    if (can.id !== can.canonicalCandidateId) errors.push(`canonical zinciri (canonical da duplicate): ${r.id}`);
    if (r.newUrl !== can.newUrl) errors.push(`duplicate→canonical hedef uyumsuz: ${r.id}`);
    if (r.youtubeId !== can.youtubeId) errors.push(`duplicate farklı YouTube videosuna bağlı: ${r.id}`);
  }
}
// Canonical'lar: her biri benzersiz slug ve benzersiz YouTube videosu.
const canonSlugs = new Set(canon.map((r) => r.slug));
const canonYt = new Set(canon.map((r) => r.youtubeId));
if (canonSlugs.size !== canon.length) errors.push(`canonical slug çakışması (${canonSlugs.size}/${canon.length})`);
if (canonYt.size !== canon.length) errors.push(`aynı YouTube videosu birden çok canonical'da (${canonYt.size}/${canon.length})`);
if (new Set(map.map((r) => r.newUrl)).size !== canon.length) errors.push('hedef sayısı canonical sayısına eşit değil');

if (errors.length) {
  console.error('[validate-video-map] BAŞARISIZ:\n - ' + errors.slice(0, 30).join('\n - '));
  process.exit(1);
}
const dup = map.length - canon.length;
console.log(`[validate-video-map] OK — ${map.length} kayıt (${canon.length} canonical + ${dup} duplicate), ${canon.length} benzersiz hedef, slug/YouTube çakışması 0.`);
