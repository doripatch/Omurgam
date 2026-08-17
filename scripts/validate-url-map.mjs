// URL migrasyon haritası build-zamanı doğrulaması (Faz 1).
// Başarısızsa exit(1) -> `npm run build` durur. src/app/lib/urlMigration.ts ile aynı kurallar.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const map = JSON.parse(readFileSync(join(ROOT, 'src/app/data/urlMigrationMap.json'), 'utf8'));

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const errors = [];

if (map.length !== 262) errors.push(`toplam 262 beklenirken ${map.length}`);

const counts = {};
for (const r of map) counts[r.contentFamily] = (counts[r.contentFamily] || 0) + 1;
const expected = { kaleminden: 83, 'saglikli-yasam': 67, 'yatak-yastik': 32, klinisyenler: 80 };
for (const [fam, n] of Object.entries(expected)) {
  if (counts[fam] !== n) errors.push(`${fam}: ${n} beklenirken ${counts[fam] || 0}`);
}

const ids = new Set(), slugs = new Set(), urls = new Set();
let blogOld = 0;
for (const r of map) {
  if (ids.has(r.id)) errors.push(`yinelenen id: ${r.id}`); ids.add(r.id);
  if (slugs.has(r.slug)) errors.push(`yinelenen slug: ${r.slug}`); slugs.add(r.slug);
  if (urls.has(r.newUrl)) errors.push(`yinelenen newUrl: ${r.newUrl}`); urls.add(r.newUrl);
  if (!r.slug || !SLUG_RE.test(r.slug)) errors.push(`boş/geçersiz slug: ${r.id}`);
  if (r.oldUrl) blogOld++;
}
if (blogOld !== 182) errors.push(`182 blog oldUrl beklenirken ${blogOld}`);

if (errors.length) {
  console.error('[validate-url-map] BAŞARISIZ:\n - ' + errors.join('\n - '));
  process.exit(1);
}
console.log(`[validate-url-map] OK — 262 kayıt (83/67/32/80), benzersiz id/slug/newUrl, 182 blog oldUrl, geçersiz slug yok.`);
