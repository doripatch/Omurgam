// Omurgam ana sitemap üreteci (build-time, internet YOK).
// Kaynak-of-truth:
//   (1) küratörlü static route listesi (login/admin/profil HARİÇ),
//   (2) src/app/lib/policies.ts,
//   (3) mr-terimleri-iceaktarim.json (canlı MR anlık görüntüsü).
// Blog URL'leri buraya GİRMEZ (ayrı dinamik blog-sitemap.xml).
// Sahte <lastmod> ÜRETİLMEZ: güvenilir güncelleme tarihi olmadığı için hiç eklenmez.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://omurgam.com';

// (1) Küratörlü, indexlenebilir static route'lar — routes.ts'ten elle seçildi (private route yok)
const STATIC = [
  ['/', 'daily', '1.0'],
  ['/videolar', 'weekly', '0.9'],
  ['/omurgam-ne-diyor', 'daily', '0.9'],
  ['/yatak-yastik-rehberi', 'weekly', '0.8'],
  ['/saglikli-yasam', 'weekly', '0.8'],
  ['/klinisyenler', 'weekly', '0.8'],
  ['/forum', 'daily', '0.8'],
  ['/mr-analiz', 'monthly', '0.8'],
  ['/bel-fitigi', 'monthly', '0.9'],
  ['/boyun-fitigi', 'monthly', '0.9'],
  ['/skolyoz', 'monthly', '0.9'],
  ['/saglik-sozlugu', 'weekly', '0.8'],
  ['/omurga-sozlugu', 'weekly', '0.9'],
  ['/gunun-terimi', 'daily', '0.7'],
  ['/mit-avi', 'daily', '0.7'],
  ['/soru-sor', 'monthly', '0.6'],
  ['/hakkimizda', 'monthly', '0.7'],
  ['/sorular', 'monthly', '0.7'],
  ['/randevu', 'monthly', '0.8'],
  ['/iletisim', 'yearly', '0.5'],
  ['/basin', 'monthly', '0.5'],
  ['/blog', 'weekly', '0.6'],
  ['/gizlilik', 'yearly', '0.3'],
  ['/kullanim-kosullari', 'yearly', '0.3'],
];

// (2) Politikalar — source of truth: src/app/lib/policies.ts
const polTs = readFileSync(join(ROOT, 'src/app/lib/policies.ts'), 'utf8');
const polSlugs = [...polTs.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);

// (3) MR terimleri — source of truth: mr-terimleri-iceaktarim.json
// slugify, uygulamadaki (MRAnalyzer.tsx) mantıkla BİREBİR aynı olmalı.
const TR = { 'ç':'c','ğ':'g','ı':'i','İ':'i','ö':'o','ş':'s','ü':'u','â':'a','î':'i','û':'u','Ç':'c','Ğ':'g','Ö':'o','Ş':'s','Ü':'u' };
const slugify = (s) => s.split('').map((c) => TR[c] ?? c).join('')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');
const terms = JSON.parse(readFileSync(join(ROOT, 'mr-terimleri-iceaktarim.json'), 'utf8'));
// (4) Omurga Sözlüğü — source of truth: src/app/data/spineGlossary.json (FINAL MASTER)
const spineGlossary = JSON.parse(readFileSync(join(ROOT, 'src/app/data/spineGlossary.json'), 'utf8'));
const mrSlugs = [];
const mrSeen = new Set();
for (const t of terms) {
  if (!t || !t.term) continue;
  const s = slugify(t.term);
  if (s && !mrSeen.has(s)) { mrSeen.add(s); mrSlugs.push(s); }
}

// URL listesi (sıra: static -> politika -> MR). Loc bazında tekilleştirilir.
const rows = [];
const seen = new Set();
const add = (loc, cf, pr) => { if (!seen.has(loc)) { seen.add(loc); rows.push({ loc, cf, pr }); } };
for (const [p, cf, pr] of STATIC) add(ORIGIN + p, cf, pr);
for (const s of polSlugs) add(`${ORIGIN}/politika/${s}`, 'yearly', '0.3');
for (const s of mrSlugs) add(`${ORIGIN}/mr-analiz/${s}`, 'monthly', '0.5');
for (const t of spineGlossary.master) {
  if (t?.slug) add(`${ORIGIN}/omurga-sozlugu/${t.slug}`, 'monthly', '0.7');
}

const body = rows.map((u) =>
  `  <url><loc>${u.loc}</loc><changefreq>${u.cf}</changefreq><priority>${u.pr}</priority></url>`
).join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

const out = process.env.SITEMAP_OUT || join(ROOT, 'public/sitemap.xml');
writeFileSync(out, xml);
console.log(`[sitemap] ${rows.length} URL yazıldı (static ${STATIC.length}, politika ${polSlugs.length}, mr ${mrSlugs.length}) -> ${out}`);
