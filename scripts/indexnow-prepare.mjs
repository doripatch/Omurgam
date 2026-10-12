// postbuild (en son): IndexNow için "bu yayında içeriği değişen sayfalar" listesi.
// - Sitemap'teki her adresin build HTML'inden yalnız İÇERİK parmak izi alınır (<title>, meta açıklama, canonical,
//   JSON-LD ve #root gövdesi; JS/CSS dosya adları hariç → kod değişikliği tüm sayfaları "değişti" saydırmaz).
// - Canlıdaki önceki parmak izleriyle (/indexnow-state.json) karşılaştırılır → dist/indexnow-changed.json.
// - Gönderimi netlify/functions/deploy-succeeded.mjs yapar (yalnız production yayını canlıya çıktıktan SONRA).
// Ağ hatasında build'i durdurmaz: önceki durum alınamazsa liste boş yazılır (yanlışlıkla toplu gönderim olmaz),
// Canlıda durum dosyası yoksa (404, ilk kurulum) ya da FORCE_INDEXNOW_ALL=1 ise tüm adresler gönderilir.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = process.env.PRERENDER_DIST || join(ROOT, 'dist');
const ORIGIN = 'https://omurgam.com';
const die = (m) => { console.error(`[indexnow] HATA: ${m}`); process.exit(1); };

const urls = new Set([`${ORIGIN}/`]);
for (const sm of ['sitemap.xml', 'blog-sitemap.xml']) {
  const f = join(DIST, sm);
  if (!existsSync(f)) die(`${sm} yok`);
  for (const m of readFileSync(f, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(m[1].trim());
}

function fileFor(url) {
  const p = new URL(url).pathname;
  const cands = p === '/' ? ['index.html'] : p.endsWith('/') ? [`${p.slice(1)}index.html`, `${p.slice(1, -1)}.html`] : [`${p.slice(1)}.html`, `${p.slice(1)}/index.html`];
  return cands.map((c) => join(DIST, c)).find((f) => existsSync(f));
}
function fingerprint(html) {
  const pick = (re) => (html.match(re) || []).join('\n');
  const root = (html.match(/<div id="root">([\s\S]*)<\/div>\s*<\/body>/) || [, ''])[1];
  const content = [
    pick(/<title>[\s\S]*?<\/title>/g), pick(/<meta name="description"[^>]*>/g), pick(/<link rel="canonical"[^>]*>/g),
    // Yalnız sayfaya özgü JSON-LD (id="seo-jsonld"); tüm sayfalarda ortak Organization/Person bloğu hariç
    // (editör bilgisi güncellenince 600 sayfa birden "değişti" sayılmasın).
    pick(/<script type="application\/ld\+json" id="seo-jsonld"[^>]*>[\s\S]*?<\/script>/g),
    root.replace(/\/assets\/[^"' )]+/g, ''),
  ].join('\n');
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

const state = {};
let missing = 0;
for (const u of urls) {
  const f = fileFor(u);
  if (!f) { missing++; continue; } // ör. SPA'dan sunulan sayfalar: içerik HTML'de değil
  state[u] = fingerprint(readFileSync(f, 'utf8'));
}

let prev = null;
let firstRun = false;
let baselineReset = false;
const STATE_VERSION = 2; // canlıda durum dosyası hiç yoksa (404) ilk kurulum: tüm adresler bir kez gönderilir
try {
  const r = await fetch(`${ORIGIN}/indexnow-state.json`, { signal: AbortSignal.timeout(10000) });
  if (r.ok) prev = await r.json();
  if (prev && prev.v !== STATE_VERSION) { baselineReset = true; prev = null; } // parmak izi biçimi değişti: bu yayında gönderim yok, yeni temel kaydedilir
  else if (r.status === 404) firstRun = true;
} catch { /* ağ yok → prev null, gönderim yok */ }

let changed;
if (process.env.FORCE_INDEXNOW_ALL === '1' || firstRun) changed = Object.keys(state);
else if (!prev || typeof prev !== 'object') changed = [];
else changed = Object.keys(state).filter((u) => (prev.h || {})[u] !== state[u]);

writeFileSync(join(DIST, 'indexnow-state.json'), JSON.stringify({ v: STATE_VERSION, h: state }));
writeFileSync(join(DIST, 'indexnow-changed.json'), JSON.stringify({ generatedAt: new Date().toISOString(), urls: changed }));
console.log(`[indexnow] OK — ${Object.keys(state).length} adres parmak izi (${missing} HTML'siz), önceki durum ${prev ? 'alındı' : baselineReset ? 'eski biçim (temel yenilendi)' : 'YOK'}, değişen ${changed.length} -> dist/indexnow-changed.json`);
