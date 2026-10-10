// postbuild: site içi arama dizini → dist/search-index.json (GlobalSearch, arama penceresi açılınca bir kez yükler).
// Neden: eski arama Supabase tablolarında arıyordu; içerik KV/JSON'a taşındığı için orada yalnız 3 yazı/3 video vardı
// (aramada neredeyse hiç sonuç çıkmıyordu). Dizin, sitenin gerçek ve güncel kaynaklarından üretilir:
// canlı API (yazılar, videolar) + Omurga Sözlüğü + MR terimleri (sözlüğe taşınmayanlar) + rehber/temel sayfalar.
// Her kayıt: t (tür), title, desc, url, cat, k (ek anahtar kelimeler: İngilizce ad, hasta dili, kategori; normalize). Tıbbi metin değişmez, yalnız kısaltılır.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = process.env.PRERENDER_DIST || join(ROOT, 'dist');
const die = (m) => { console.error(`[search-index] HATA: ${m}`); process.exit(1); };
const readJson = (rel) => JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));

const info = readFileSync(join(ROOT, 'utils/supabase/info.tsx'), 'utf8');
const projectId = (info.match(/projectId\s*=\s*"([^"]+)"/) || [])[1];
const anon = (info.match(/publicAnonKey\s*=\s*"([^"]+)"/) || [])[1];
async function get(path) {
  const r = await fetch(`https://${projectId}.supabase.co/functions/v1/server${path}`, { headers: { Authorization: `Bearer ${anon}` } });
  if (!r.ok) die(`API ${path} -> ${r.status}`);
  return r.json();
}

const plain = (s) => String(s ?? '').replace(/[#*_>`~]+/g, ' ').replace(/^[\s❌✅]+/u, '').replace(/\s+/g, ' ').trim();
const cut = (s, max) => { const t = plain(s); if (t.length <= max) return t; const c = t.slice(0, max - 1); return c.slice(0, c.lastIndexOf(' ')) + '…'; };
// GlobalSearch.tsx'teki normalize ile AYNI olmalı.
const norm = (s) => String(s ?? '').replace(/İ/g, 'i').replace(/I/g, 'ı').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i')
  .normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

const TR = { 'ç':'c','ğ':'g','ı':'i','İ':'i','ö':'o','ş':'s','ü':'u','â':'a','î':'i','û':'u','Ç':'c','Ğ':'g','Ö':'o','Ş':'s','Ü':'u' };
const mrSlug = (s) => String(s || '').split('').map((c) => TR[c] ?? c).join('').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');

const items = [];
const add = (t, title, desc, url, cat, extra = '') => items.push({ t, title: plain(title), desc: cut(desc, 110), url, cat: plain(cat) || undefined, k: norm(`${extra} ${cat || ''}`) }); // başlık+açıklama tarayıcıda normalize edilir (dosya küçük kalır)

// 1) Rehber ve temel sayfalar
[
  ['Bel Fıtığı Rehberi', 'Belirtiler, nedenler, tanı ve tedavi seçenekleri.', '/bel-fitigi', 'bel fitigi lomber disk hernisi siyatik bel agrisi'],
  ['Boyun Fıtığı Rehberi', 'Belirtiler, nedenler, tanı ve tedavi seçenekleri.', '/boyun-fitigi', 'boyun fitigi servikal disk hernisi boyun agrisi'],
  ['Skolyoz Rehberi', 'Omurga eğriliği: belirtiler, tanı ve takip.', '/skolyoz', 'skolyoz omurga egriligi'],
  ['Omurga Sözlüğü', 'Omurga ve MR terimlerinin sade açıklamaları.', '/omurga-sozlugu/', 'sozluk terim mr raporu'],
  ['Sağlık Sözlüğü', 'Tıbbi ve tedavi terimlerinin açıklamaları.', '/saglik-sozlugu', 'saglik sozlugu tibbi terim'],
  ['Uzmana Soru Sor', 'Sorunuzu Omurgam uzmanlarına iletin.', '/soru-sor', 'soru sor uzman'],
  ['Randevu / Danışma Talebi', "Prof. Dr. Defne Kaya Utlu'dan danışma talebi.", '/randevu', 'randevu danisma'],
  ['Prof. Dr. Defne Kaya Utlu', 'Hakkımızda: akademik özgeçmiş ve çalışma alanları.', '/hakkimizda', 'hakkimizda defne kaya utlu'],
].forEach(([title, desc, url, kw]) => add('page', title, desc, url, '', kw));

// 2) Omurga Sözlüğü (ana kaynak)
const glossary = readJson('src/app/data/spineGlossary.json').master;
for (const g of glossary) {
  if (!g.slug || !g.term) continue;
  add('term', g.term, g.definition, `/omurga-sozlugu/${g.slug}/`, g.category, `${g.english || ''} ${String(g.patientLanguage || '').replace(/·/g, ' ')}`);
}

// 3) MR terimleri (sözlüğe taşınmayanlar; ilk-kayıt kuralı prerender-mr ile aynı)
const merged = readJson('src/app/data/crossLinks.json').mrToGlossary;
const seenMr = new Set();
for (const m of readJson('mr-terimleri-iceaktarim.json')) {
  const s = mrSlug(m.term);
  if (!s || seenMr.has(s) || merged[s]) continue;
  seenMr.add(s);
  const [desc, eng] = String(m.explanation || '').split(/\n\s*İngilizce:/);
  add('mr', m.term, desc, `/mr-analiz/${s}/`, '', eng || '');
}

// 4) Yazılar ve videolar (canlı API, yeni adresler)
const [blogRes, videoRes] = await Promise.all([get('/blog'), get('/videos')]);
const urlMap = new Map(readJson('src/app/data/urlMigrationMap.json').filter((r) => r.oldUrl).map((r) => [r.id, r]));
for (const p of (blogRes.posts || blogRes || [])) {
  const rec = urlMap.get(p.id);
  if (p.published === false || !rec) continue;
  add('blog', p.title, p.excerpt || p.content, `${rec.newUrl}/`, p.category);
}
const videoMap = new Map(readJson('src/app/data/videoUrlMap.json').map((r) => [r.id, r]));
for (const v of (videoRes.videos || [])) {
  const rec = videoMap.get(v.id);
  if (v.published === false || !rec || rec.canonicalCandidateId !== v.id) continue;
  add('video', v.title, v.description || '', `${rec.newUrl}/`, v.category || 'Video');
}

const counts = items.reduce((a, i) => ((a[i.t] = (a[i.t] || 0) + 1), a), {});
if ((counts.term || 0) < 150 || (counts.blog || 0) < 150 || (counts.video || 0) < 30 || (counts.mr || 0) < 100) die(`dizin eksik: ${JSON.stringify(counts)}`);
if (new Set(items.map((i) => i.url)).size !== items.length) die('dizinde tekrar eden adres var');
writeFileSync(join(DIST, 'search-index.json'), JSON.stringify(items));
console.log(`[search-index] OK — ${items.length} kayıt ${JSON.stringify(counts)} -> dist/search-index.json`);
