// Faz 3 — public/_redirects üretir: YALNIZ manifestten 183 özel blog 301 kuralı.
// Netlify _redirects, netlify.toml'dan ÖNCE işlendiği için bu 183 kural generic
// allowlist/catch-all'dan önce çalışır. Allowlist/catch-all TAŞINMAZ (netlify.toml korunur).
// Fail-fast: yanlış sayı / duplicate / loop / eksik hedef → exit(1) → build durur.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const map = JSON.parse(readFileSync(join(ROOT, 'src/app/data/urlMigrationMap.json'), 'utf8'));

const errors = [];
const blog = map.filter((r) => r.oldUrl); // klinisyende oldUrl null
const seenOld = new Set();
const newSet = new Set(map.map((r) => r.newUrl));
const lines = [];

for (const r of blog) {
  if (!/^\/blog\/[0-9a-f-]{36}$/.test(r.oldUrl)) errors.push(`geçersiz oldUrl: ${r.oldUrl}`);
  if (seenOld.has(r.oldUrl)) errors.push(`duplicate oldUrl: ${r.oldUrl}`);
  seenOld.add(r.oldUrl);
  if (!r.newUrl || !newSet.has(r.newUrl)) errors.push(`hedef manifestte yok: ${r.newUrl}`);
  if (r.newUrl.startsWith('/blog/')) errors.push(`loop riski (hedef /blog/): ${r.newUrl}`);
  if (r.oldUrl === r.newUrl) errors.push(`self-redirect: ${r.oldUrl}`);
  lines.push(`${r.oldUrl}  ${r.newUrl}  301!`);
}

if (blog.length !== 183) errors.push(`183 blog redirect beklenirken ${blog.length}`);
// hedef benzersizliği (iki eski URL aynı yeni URL'ye gitmesin)
const targets = lines.map((l) => l.split(/\s+/)[1]);
if (new Set(targets).size !== targets.length) errors.push('yinelenen hedef newUrl var');

if (errors.length) {
  console.error('[generate-redirects] BAŞARISIZ:\n - ' + errors.join('\n - '));
  process.exit(1);
}

const header = '# Faz 3 — otomatik üretildi (scripts/generate-redirects.mjs). Elle düzenleme.\n'
  + '# 183 eski blog UUID URL -> kilitli yeni URL, gerçek HTTP 301 (force).\n';
writeFileSync(process.env.REDIRECTS_OUT || join(ROOT, 'public/_redirects'), header + lines.join('\n') + '\n');
console.log(`[generate-redirects] OK — public/_redirects: ${lines.length} adet 301 (dup/loop/hedef doğrulandı).`);
