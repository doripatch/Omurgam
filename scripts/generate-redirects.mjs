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
  lines.push(`${r.oldUrl}  ${r.newUrl}/  301!`);
}

if (blog.length !== 183) errors.push(`183 blog redirect beklenirken ${blog.length}`);
// blog hedef benzersizliği (iki eski blog URL aynı yeni URL'ye gitmesin)
const targets = lines.map((l) => l.split(/\s+/)[1]);
if (new Set(targets).size !== targets.length) errors.push('yinelenen blog hedef newUrl var');

// --- VIDEO 301'leri (eski /video/<UUID> -> canonical /videolar/<slug>/) ---
// Blog'dan FARK: duplicate kayıtlar canonical ile AYNI hedefe gider → hedef sayısı = canonical sayısı.
// Kayıtlar videoUrlMap.json'dan gelir (append-only; gece senkronuyla büyür, sabit sayı yok).
const videoMap = JSON.parse(readFileSync(join(ROOT, 'src/app/data/videoUrlMap.json'), 'utf8'));
const videoLines = [];
const seenVidOld = new Set();
const vidById = new Map(videoMap.map((r) => [r.id, r]));
for (const r of videoMap) {
  if (!/^\/video\/[0-9a-f-]{36}$/.test(r.oldUrl)) errors.push(`geçersiz video oldUrl: ${r.oldUrl}`);
  if (seenVidOld.has(r.oldUrl)) errors.push(`duplicate video oldUrl: ${r.oldUrl}`);
  seenVidOld.add(r.oldUrl);
  if (!r.newUrl || !/^\/videolar\/[a-z0-9-]+$/.test(r.newUrl)) errors.push(`geçersiz video hedef: ${r.newUrl}`);
  if (r.newUrl.startsWith('/video/')) errors.push(`video loop riski: ${r.newUrl}`);
  if (r.oldUrl === r.newUrl) errors.push(`video self-redirect: ${r.oldUrl}`);
  const can = vidById.get(r.canonicalCandidateId);
  if (!can) errors.push(`video canonical yok: ${r.id}`);
  else if (r.newUrl !== can.newUrl) errors.push(`video duplicate→canonical hedef uyumsuz: ${r.id}`);
  videoLines.push(`${r.oldUrl}  ${r.newUrl}/  301!`);
}
if (videoMap.length < 43) errors.push(`en az 43 video redirect beklenirken ${videoMap.length}`);
if (seenVidOld.size !== videoMap.length) errors.push(`video oldUrl benzersiz değil (${seenVidOld.size}/${videoMap.length})`);
const vidTargets = videoLines.map((l) => l.split(/\s+/)[1]);
const vidCanonCount = videoMap.filter((r) => r.id === r.canonicalCandidateId).length;
if (new Set(vidTargets).size !== vidCanonCount) errors.push(`${vidCanonCount} benzersiz video hedef beklenirken ${new Set(vidTargets).size}`);

if (errors.length) {
  console.error('[generate-redirects] BAŞARISIZ:\n - ' + errors.join('\n - '));
  process.exit(1);
}

const header = '# Faz 3 — otomatik üretildi (scripts/generate-redirects.mjs). Elle düzenleme.\n'
  + '# 183 eski blog UUID URL -> kilitli yeni URL, gerçek HTTP 301 (force).\n'
  + '# Eski /video/<UUID> -> canonical /videolar/<slug>/, gerçek HTTP 301 (force); duplicate kayıtlar canonical hedefe gider.\n';
const allLines = [...lines, ...videoLines];
writeFileSync(process.env.REDIRECTS_OUT || join(ROOT, 'public/_redirects'), header + allLines.join('\n') + '\n');
console.log(`[generate-redirects] OK — public/_redirects: ${allLines.length} adet 301 (${lines.length} blog + ${videoLines.length} video; ${new Set(vidTargets).size} benzersiz video hedef; dup/loop/hedef doğrulandı).`);
