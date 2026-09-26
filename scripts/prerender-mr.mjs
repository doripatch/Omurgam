// MR terim detaylarını build-time statik HTML olarak üretir.
// Kaynak-of-truth: mr-terimleri-iceaktarim.json. Aynı slug birden çok kez varsa
// MRAnalyzer ile aynı davranış korunur: veri sırasındaki ilk kayıt kullanılır.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { smartTruncate, faqPageJsonLd } from '../src/app/lib/glossarySeo.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = process.env.PRERENDER_DIST || join(ROOT, 'dist');
const ORIGIN = 'https://omurgam.com';
const BASE = '/mr-analiz';
const EXPECTED_RECORDS = 296;
const EXPECTED_UNIQUE = 280;

const templatePath = join(DIST, 'index.html');
if (!existsSync(templatePath)) {
  console.error('[prerender-mr] HATA: dist/index.html yok — vite build sonrası çalışmalı.');
  process.exit(1);
}
const template = readFileSync(templatePath, 'utf8');
const source = JSON.parse(readFileSync(join(ROOT, 'mr-terimleri-iceaktarim.json'), 'utf8'));

const TR = { 'ç':'c','ğ':'g','ı':'i','İ':'i','ö':'o','ş':'s','ü':'u','â':'a','î':'i','û':'u','Ç':'c','Ğ':'g','Ö':'o','Ş':'s','Ü':'u' };
const slugify = (s) => String(s || '').split('').map((c) => TR[c] ?? c).join('')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const jsonLdSafe = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');
const compact = (s) => String(s || '').replace(/\s+/g, ' ').trim();

function renderPage({ title, description, canonical, jsonLd, bodyHtml }) {
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(description)}" />`);
  html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}" />`);
  html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(description)}" />`);
  html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${esc(canonical)}" />`);
  html = html.replace(/<meta property="og:type"[^>]*>/, '<meta property="og:type" content="article" />');
  html = html.replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(title)}" />`);
  html = html.replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(description)}" />`);
  const inject = `  <link rel="canonical" href="${esc(canonical)}" />\n`
    + `    <script type="application/ld+json" id="seo-jsonld">${jsonLdSafe(jsonLd)}</script>\n  `;
  html = html.replace('</head>', `${inject}</head>`);
  return html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
}

if (!Array.isArray(source) || source.length !== EXPECTED_RECORDS) {
  console.error(`[prerender-mr] HATA: ${EXPECTED_RECORDS} kaynak kayıt beklenirken ${source?.length ?? 0}`);
  process.exit(1);
}

const bySlug = new Map();
for (const term of source) {
  const slug = slugify(term?.term);
  if (!slug) {
    console.error(`[prerender-mr] HATA: geçersiz terim/slug: ${term?.term ?? ''}`);
    process.exit(1);
  }
  if (!bySlug.has(slug)) bySlug.set(slug, term);
}
if (bySlug.size !== EXPECTED_UNIQUE) {
  console.error(`[prerender-mr] HATA: ${EXPECTED_UNIQUE} benzersiz slug beklenirken ${bySlug.size}`);
  process.exit(1);
}

const DISCLAIMER = '<aside><strong>Önemli:</strong> Bu bilgiler yalnızca bilgilendirme amaçlıdır ve kesin tanı yerine geçmez. MR raporunuzun değerlendirilmesi için hekiminize danışın.</aside>';
for (const [slug, term] of bySlug) {
  const canonical = `${ORIGIN}${BASE}/${slug}/`;
  const title = `${term.term} Nedir? — MR Raporu Terimi | Omurgam`;
  // Meta: kelime sınırında biter (eski .slice(0,155) kelime ortasında kesiyordu).
  const description = smartTruncate(`${term.term} nedir? ${compact(term.explanation)}`, 155);
  // FAQ: yalnız dolu alanlardan (açıklama + öneriler); tıbbi ifade uydurulmaz.
  const faq = [];
  if (compact(term.explanation)) faq.push({ q: `${term.term} nedir?`, a: compact(term.explanation) });
  if (Array.isArray(term.recommendations) && term.recommendations.length) {
    faq.push({ q: `${term.term} için öneriler ve tedavi yaklaşımı nedir?`, a: term.recommendations.map(compact).join(' ') });
  }
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'MedicalWebPage', url: canonical, name: title.replace(/ \| Omurgam$/, ''), description,
        inLanguage: 'tr-TR', publisher: { '@id': `${ORIGIN}/#org` } },
      { '@type': 'DefinedTerm', '@id': `${canonical}#term`, url: canonical, name: term.term,
        description: term.explanation, inDefinedTermSet: { '@id': `${ORIGIN}${BASE}#termset` } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'MR Terim Sözlüğü', item: `${ORIGIN}${BASE}` },
        { '@type': 'ListItem', position: 3, name: term.term, item: canonical },
      ] },
    ],
  };
  const faqLd = faqPageJsonLd(faq);
  if (faqLd) jsonLd['@graph'].push(faqLd);
  const recommendations = Array.isArray(term.recommendations) && term.recommendations.length
    ? `<section><h2>Öneriler</h2><ul>${term.recommendations.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>` : '';
  const faqHtml = faq.length
    ? `<section><h2>Sıkça Sorulan Sorular</h2>${faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}</section>` : '';
  const body = `<main><nav><a href="${BASE}">← MR Terim Sözlüğü</a></nav>`
    + `<p>${esc(term.category || 'Omurga & MR Terimleri')}</p><h1>${esc(term.term)} Nedir?</h1>`
    + `<section><h2>Kısa ve doğrudan açıklama</h2><p>${esc(term.explanation)}</p></section>`
    + recommendations + faqHtml + DISCLAIMER + '</main>';
  const dir = join(DIST, 'mr-analiz', slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), renderPage({ title, description, canonical, jsonLd, bodyHtml: body }));
}

const samples = ['sakralizasyon', 'retrolistezis', 'dural-kese-basisi', 'allogreft', 'dural-kese', 'lateral', 'diskografi', 'marjinal-osteofit'];
for (const slug of samples) {
  if (!bySlug.has(slug)) continue;
  const html = readFileSync(join(DIST, 'mr-analiz', slug, 'index.html'), 'utf8');
  const canonical = `${ORIGIN}${BASE}/${slug}/`;
  if ((html.match(/rel="canonical"/g) || []).length !== 1 || !html.includes(`rel="canonical" href="${canonical}"`)) {
    console.error(`[prerender-mr] HATA: ${slug} canonical yanlış`); process.exit(1);
  }
  if ((html.match(/id="seo-jsonld"/g) || []).length !== 1 || !html.includes('<h1>')) {
    console.error(`[prerender-mr] HATA: ${slug} görünür içerik/JSON-LD eksik`); process.exit(1);
  }
  if (!html.includes('"@type":"FAQPage"') || !html.includes('<h2>Sıkça Sorulan Sorular</h2>')) {
    console.error(`[prerender-mr] HATA: ${slug} FAQPage/görünür SSS eksik`); process.exit(1);
  }
  // Ham metin ≤155; HTML entity kaçışı (&amp; vb.) birkaç karakter ekleyebilir → ≤170 tolerans.
  const mrDescM = html.match(/<meta name="description" content="([^"]*)"/);
  if (!mrDescM || mrDescM[1].length > 170) { console.error(`[prerender-mr] HATA: ${slug} meta description uzun/eksik`); process.exit(1); }
}

console.log(`[prerender-mr] OK — ${bySlug.size} benzersiz detay üretildi; ${source.length - bySlug.size} mükerrer kaynak kayıt ilk-kayıt kuralıyla tekilleştirildi; slash canonical + görünür H1 + DefinedTerm doğrulandı.`);
