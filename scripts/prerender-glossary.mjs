// Omurga Sözlüğü deterministik prerender (build-time, tarayıcı/Chromium YOK).
// Kaynak-of-truth: src/app/data/spineGlossary.json (FINAL MASTER — DEĞİŞTİRİLMEZ).
// Şablon: vite build çıktısı dist/index.html (doğru hash'li asset URL'lerini içerir).
// Üretir:
//   dist/omurga-sozlugu/index.html              (DefinedTermSet JSON-LD)
//   dist/omurga-sozlugu/<slug>/index.html  x188 (DefinedTerm + BreadcrumbList JSON-LD)
// Her sayfada JS ÇALIŞMADAN: benzersiz <title>, meta description, mutlak canonical,
// JSON-LD, görünür <h1>, ana tanım, hasta dili, klinik not, yalnız kesin eşleşen
// ilgili terimler için <a href>, ve tıbbi sorumluluk notu bulunur.
// React (createRoot) tarayıcıda açılışta #root'u temizleyip normal render eder.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://omurgam.com';
const BASE = '/omurga-sozlugu';

const templatePath = join(DIST, 'index.html');
if (!existsSync(templatePath)) {
  console.error('[prerender] HATA: dist/index.html yok. Bu script vite build SONRASI (postbuild) çalışmalı.');
  process.exit(1);
}
const template = readFileSync(templatePath, 'utf8');
const data = JSON.parse(readFileSync(join(ROOT, 'src/app/data/spineGlossary.json'), 'utf8'));

// --- yardımcılar ---
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
// JSON-LD'yi <script> içine güvenli göm: "<" kaçışı script-breakout'u önler.
const jsonLdSafe = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');
const normalize = (v) => String(v ?? '').toLocaleLowerCase('tr-TR').trim();
const splitItems = (v) => String(v ?? '').split('·').map((x) => x.trim()).filter(Boolean);
const collator = new Intl.Collator('tr');

// SpineGlossary.tsx ile BİREBİR aynı türetmeler
const master = [...data.master].sort((a, b) => collator.compare(a.term, b.term));
const aliases = Array.isArray(data.aliases) ? data.aliases : [];
const byName = new Map(master.map((t) => [normalize(t.term), t]));
const aliasByTarget = new Map();
for (const a of aliases) {
  const arr = aliasByTarget.get(a.targetTerm) || [];
  arr.push(a.alias);
  aliasByTarget.set(a.targetTerm, arr);
}
function relatedTerm(value) {
  const canonical = byName.get(normalize(value));
  if (canonical) return canonical;
  const alias = aliases.find((it) => normalize(it.alias) === normalize(value));
  return alias ? byName.get(normalize(alias.targetTerm)) : undefined;
}

// --- ÜRETİM ÖNCESİ SLUG DOĞRULAMASI (geçersiz/tekrar varsa build durur) ---
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugSet = new Set();
for (const t of data.master) {
  const slug = t?.slug ?? '';
  if (!SLUG_RE.test(slug)) {
    console.error(`[prerender] DOĞRULAMA BAŞARISIZ: geçersiz slug "${slug}" (terim: ${t?.term})`);
    process.exit(1);
  }
  if (slugSet.has(slug)) {
    console.error(`[prerender] DOĞRULAMA BAŞARISIZ: tekrarlanan slug "${slug}"`);
    process.exit(1);
  }
  slugSet.add(slug);
}

// dist/index.html şablonuna head + #root içeriği enjekte et (mevcut asset script'leri korunur)
function renderPage({ title, description, canonical, type, jsonLd, bodyHtml }) {
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(description)}" />`);
  html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}" />`);
  html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(description)}" />`);
  html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${esc(canonical)}" />`);
  html = html.replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${esc(type)}" />`);
  html = html.replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(title)}" />`);
  html = html.replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(description)}" />`);
  // JSON-LD'ye Seo.tsx ile AYNI kimlik (id="seo-jsonld") verilir: React açılışta
  // aynı script'i günceller, ikinci bir DefinedTerm/DefinedTermSet oluşturmaz.
  const inject =
    `  <link rel="canonical" href="${esc(canonical)}" />\n` +
    `    <script type="application/ld+json" id="seo-jsonld">${jsonLdSafe(jsonLd)}</script>\n  `;
  html = html.replace('</head>', `${inject}</head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
  return html;
}

const DISCLAIMER =
  '<aside><strong>Önemli:</strong> Bu sözlük bilgilendirme amaçlıdır; tanı, muayene veya ' +
  'tedavi önerisi yerine geçmez. Bulgularınızı sizi değerlendiren sağlık profesyoneliyle ' +
  'birlikte yorumlayın.</aside>';

function write(rel, html) {
  const dir = join(DIST, rel);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

// ---------- INDEX ----------
const indexJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  '@id': `${ORIGIN}${BASE}#termset`,
  name: 'Omurgam Omurga Sözlüğü',
  description: 'Omurga, disk, sinir, skolyoz, görüntüleme ve tedavi terimlerinin sade Türkçe açıklamaları.',
  url: `${ORIGIN}${BASE}`,
};
const indexLinks = master
  .map((t) => `<li><a href="${BASE}/${esc(t.slug)}">${esc(t.term)}</a> — <span>${esc(t.category)}</span></li>`)
  .join('\n');
const indexBody =
  `<main><nav><a href="/">Ana Sayfa</a> / Omurga Sözlüğü</nav>` +
  `<h1>Omurga Sözlüğü</h1>` +
  `<p>MR raporunda veya doktor görüşmesinde karşılaştığınız omurga terimlerini sade Türkçeyle anlayın. 188 editoryal terim.</p>` +
  `${DISCLAIMER}<ul>\n${indexLinks}\n</ul></main>`;
write('omurga-sozlugu', renderPage({
  title: 'Omurga Sözlüğü — Omurga ve MR Terimleri | Omurgam',
  description: 'Omurga, disk, sinir, skolyoz, MR bulguları ve tedavi terimlerini hasta dilinde açıklayan 188 maddelik Omurgam Omurga Sözlüğü.',
  canonical: `${ORIGIN}${BASE}`,
  type: 'website',
  jsonLd: indexJsonLd,
  bodyHtml: indexBody,
}));

// ---------- DETAY (188) ----------
let count = 0;
for (const term of master) {
  const canonicalUrl = `${ORIGIN}${BASE}/${term.slug}`;
  const termAliases = aliasByTarget.get(term.term) || [];
  const related = splitItems(term.relatedTerms);
  const [wrong, right] = String(term.trueFalse ?? '').split('|').map((x) => x.trim());

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTerm',
        '@id': `${canonicalUrl}#term`,
        name: term.term,
        description: term.definition,
        url: canonicalUrl,
        inDefinedTermSet: { '@id': `${ORIGIN}${BASE}#termset` },
        ...(term.english ? { alternateName: [term.english, ...termAliases] } : { alternateName: termAliases }),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: ORIGIN },
          { '@type': 'ListItem', position: 2, name: 'Omurga Sözlüğü', item: `${ORIGIN}${BASE}` },
          { '@type': 'ListItem', position: 3, name: term.term, item: canonicalUrl },
        ],
      },
    ],
  };

  const patientTags = [...splitItems(term.patientLanguage), ...termAliases]
    .map((x) => `<span>${esc(x)}</span>`).join(' ');
  // Yalnız kesin eşleşen ilgili terimler <a href> olur; eşleşmeyen düz metin kalır.
  const relatedHtml = related.map((item) => {
    const target = relatedTerm(item);
    return target ? `<a href="${BASE}/${esc(target.slug)}">${esc(item)}</a>` : `<span>${esc(item)}</span>`;
  }).join(' ');

  const body =
    `<main>` +
    `<nav><a href="${BASE}">← Omurga Sözlüğü</a></nav>` +
    `<p>${esc(term.category)}</p>` +
    `<h1>${esc(term.term)} nedir?</h1>` +
    (term.english ? `<p>${esc(term.english)}</p>` : '') +
    `<section><h2>Kısa ve doğrudan açıklama</h2><p>${esc(term.definition)}</p></section>` +
    `<section><h2>Hasta bunu nasıl duyabilir?</h2><div>${patientTags}</div></section>` +
    `<section><h2>Klinik not</h2><p>${esc(term.clinicalNote)}</p></section>` +
    `<section><h2>Sık karıştırılan</h2><p>${esc(String(wrong || '').replace(/^❌\s*/, ''))}</p>` +
    `<h2>Doğrusu</h2><p>${esc(String(right || '').replace(/^✅\s*/, ''))}</p></section>` +
    (related.length ? `<section><h2>İlgili terimler</h2><div>${relatedHtml}</div></section>` : '') +
    DISCLAIMER +
    `<p>Editoryal kaynak: <a href="${esc(term.sourceUrl)}" target="_blank" rel="noopener noreferrer nofollow">Kaynağı görüntüle</a></p>` +
    `</main>`;

  write(`omurga-sozlugu/${term.slug}`, renderPage({
    title: `${term.term} Nedir? | Omurgam`,
    description: `${term.term}: ${term.definition}`.slice(0, 160),
    canonical: canonicalUrl,
    type: 'article',
    jsonLd,
    bodyHtml: body,
  }));
  count++;
}

const total = count + 1;
console.log(`[prerender] ${total} statik sayfa üretildi (1 indeks + ${count} detay) -> dist${BASE}/`);

// ---------- ÜRETİM-GÜVENLİ DOĞRULAMALAR (başarısızsa build'i durdurur) ----------
function assert(cond, msg) {
  if (!cond) { console.error(`[prerender] DOĞRULAMA BAŞARISIZ: ${msg}`); process.exit(1); }
}
assert(count === 188, `188 detay bekleniyordu, ${count} üretildi`);
assert(total === 189, `189 toplam sayfa bekleniyordu, ${total} üretildi`);
assert(slugSet.size === 188, `188 benzersiz slug bekleniyordu, ${slugSet.size} bulundu`);

// Örnek ham HTML testi: /omurga-sozlugu/acdf
const sample = readFileSync(join(DIST, 'omurga-sozlugu/acdf/index.html'), 'utf8');
const acdf = master.find((t) => t.slug === 'acdf');
assert(!!acdf, 'acdf terimi veri kümesinde yok');
assert(sample.includes('<title>ACDF Nedir? | Omurgam</title>'), 'acdf: benzersiz <title> yok');
assert(sample.includes(esc(acdf.definition.slice(0, 40))), 'acdf: ana tanım metni yok');
assert(/<h1>ACDF nedir\?<\/h1>/.test(sample), 'acdf: görünür <h1> yok');
assert(sample.includes('"@type":"DefinedTerm"'), 'acdf: DefinedTerm JSON-LD yok');
assert(sample.includes('"@type":"BreadcrumbList"'), 'acdf: BreadcrumbList JSON-LD yok');
// Tam olarak bir seo-jsonld ve bir canonical (React ile çift JSON-LD önlemi)
const jsonLdCount = (sample.match(/id="seo-jsonld"/g) || []).length;
assert(jsonLdCount === 1, `acdf: tam 1 id="seo-jsonld" beklenirken ${jsonLdCount} bulundu`);
const canonCount = (sample.match(/rel="canonical"/g) || []).length;
assert(canonCount === 1, `acdf: tam 1 canonical beklenirken ${canonCount} bulundu`);
assert(sample.includes('rel="canonical" href="https://omurgam.com/omurga-sozlugu/acdf"'), 'acdf: mutlak canonical yanlış');
// Detayda og:type = article
assert(/<meta property="og:type" content="article"\s*\/?>/.test(sample), 'acdf: og:type="article" yok');

// İndeks testi: og:type=website + 188 crawlable <a href>
const idx = readFileSync(join(DIST, 'omurga-sozlugu/index.html'), 'utf8');
assert(/<meta property="og:type" content="website"\s*\/?>/.test(idx), 'indeks: og:type="website" yok');
const linkCount = (idx.match(/<li><a href="\/omurga-sozlugu\//g) || []).length;
assert(linkCount === 188, `indeks 188 detay <a href> beklerken ${linkCount} buldu`);

console.log(`[prerender] doğrulama OK — 189 sayfa, ${slugSet.size} benzersiz slug, acdf tek JSON-LD/canonical + og:type article, indeks og:type website + ${linkCount} bağlantı.`);
