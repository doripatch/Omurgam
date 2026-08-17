// Faz 3 — Blog (182) + Klinisyen (80) detay + 4 indeks statik prerender (postbuild).
// Kaynak: kilitli urlMigrationMap.json + CANLI GET (/blog, /clinical-notes).
// Ortak parser (src/app/lib/richBlocks.mjs) ile React görünümüyle YAPISAL EŞDEĞER HTML.
// Public anon key mevcut utils/supabase/info.tsx'ten okunur (yeni secret yok, service-role yok, LOGLANMAZ).
// Fail-fast: API erişilemezse / 182-80 tam gelmezse / manifest-eşleşme bozuksa exit(1) -> build durur.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseBlog, parseNote, blogBlocksToHtml, noteBlocksToHtml, escapeHtml } from '../src/app/lib/richBlocks.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://omurgam.com';
const LOGO = `${ORIGIN}/assets/logo-og.png`;

function die(msg) { console.error(`[prerender-content] HATA: ${msg}`); process.exit(1); }

// --- public anon key (mevcut kaynak; loglanmaz) ---
const info = readFileSync(join(ROOT, 'utils/supabase/info.tsx'), 'utf8');
const projectId = (info.match(/projectId\s*=\s*"([^"]+)"/) || [])[1];
const ANON = (info.match(/publicAnonKey\s*=\s*"([^"]+)"/) || [])[1];
if (!projectId || !ANON) die('utils/supabase/info.tsx içinden projectId/anon okunamadı');

const templatePath = join(DIST, 'index.html');
if (!existsSync(templatePath)) die('dist/index.html yok — postbuild (vite build sonrası) çalışmalı');
const template = readFileSync(templatePath, 'utf8');
const manifest = JSON.parse(readFileSync(join(ROOT, 'src/app/data/urlMigrationMap.json'), 'utf8'));

const FAM = {
  kaleminden: { base: '/omurgam-ne-diyor', name: 'Omurga Sağlığı Yazıları', title: 'Omurga Sağlığı Yazıları', desc: 'Omurga sağlığına dair bilimsel makaleler ve değerlendirmeler.' },
  'saglikli-yasam': { base: '/saglikli-yasam', name: 'Sağlıklı Yaşam', title: 'Sağlıklı Yaşam', desc: 'Genel sağlık, yaşam kalitesi ve iyi yaşam üzerine yazılar.' },
  'yatak-yastik': { base: '/yatak-yastik-rehberi', name: 'Yatak ve Yastık Seçim Rehberi', title: 'Yatak ve Yastık Seçim Rehberi', desc: 'Omurga sağlığınız için doğru yatak ve yastığı seçmenize yardımcı olacak rehber yazılar.' },
  klinisyenler: { base: '/klinisyenler', name: 'Klinisyenlere Notlar', title: 'Klinisyenlere Notlar', desc: "Prof. Dr. Defne Kaya Utlu'dan klinisyenlere yönelik klinik değerlendirme ve rehabilitasyon notları." },
};

// --- canlı fetch (timeout + retry) ---
async function fetchJson(path) {
  const url = `https://${projectId}.supabase.co/functions/v1/server${path}`;
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 15000);
    try {
      const r = await fetch(url, { headers: { Authorization: `Bearer ${ANON}`, apikey: ANON }, signal: ac.signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) { lastErr = e; await new Promise((res) => setTimeout(res, 800 * (attempt + 1))); }
    finally { clearTimeout(t); }
  }
  throw lastErr;
}

// --- yardımcılar ---
const esc = escapeHtml;
// JSON-LD güvenli göm: "<" kaçışı </script> breakout'unu önler (ld+json JS olarak çalışmaz).
const jsonLdSafe = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');
function plainSummary(content, max = 155) {
  const txt = String(content || '')
    .replace(/<[^>]+>/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#*_>`~]+/g, ' ').replace(/^\s*[-•]\s*/gm, '').replace(/\s+/g, ' ').trim();
  if (!txt) return 'Omurga sağlığı içeriği.';
  if (txt.length <= max) return txt;
  const cut = txt.slice(0, max); const sp = cut.lastIndexOf(' ');
  return (sp > 60 ? cut.slice(0, sp) : cut).trim() + '…';
}
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
  const inject = `  <link rel="canonical" href="${esc(canonical)}" />\n    <script type="application/ld+json" id="seo-jsonld">${jsonLdSafe(jsonLd)}</script>\n  `;
  html = html.replace('</head>', `${inject}</head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
  return html;
}
function write(rel, html) { const dir = join(DIST, rel); mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, 'index.html'), html); }
const breadcrumb = (fam, title, canonical) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${ORIGIN}/` },
    { '@type': 'ListItem', position: 2, name: FAM[fam].name, item: `${ORIGIN}${FAM[fam].base}` },
    { '@type': 'ListItem', position: 3, name: title, item: canonical },
  ],
});
const DISCLAIMER = '<aside><strong>Önemli:</strong> Bu içerik bilgilendirme amaçlıdır; tanı, muayene veya tedavi önerisi yerine geçmez.</aside>';

(async () => {
  let blogData, clinData;
  try {
    [blogData, clinData] = await Promise.all([fetchJson('/blog'), fetchJson('/clinical-notes')]);
  } catch (e) {
    die(`canlı API erişilemedi: ${e && e.message ? e.message : e}`);
  }
  const posts = (blogData.posts || []).filter((p) => p.published !== false);
  const notes = (clinData.notes || []).filter((n) => n.published !== false);
  const postById = new Map(posts.map((p) => [p.id, p]));
  const noteById = new Map(notes.map((n) => [n.id, n]));

  const blogRec = manifest.filter((r) => r.oldUrl);
  const clinRec = manifest.filter((r) => r.contentFamily === 'klinisyenler');

  // fail-fast: manifest ile canlı BİREBİR eşleşmeli
  if (blogRec.length !== 182) die(`manifest blog 182 değil: ${blogRec.length}`);
  if (clinRec.length !== 80) die(`manifest klinisyen 80 değil: ${clinRec.length}`);
  for (const r of blogRec) if (!postById.has(r.id)) die(`manifest blog canlıda yok: ${r.id}`);
  for (const r of clinRec) if (!noteById.has(r.id)) die(`manifest klinisyen canlıda yok: ${r.id}`);
  if (posts.length !== 182) die(`canlı published blog 182 değil: ${posts.length}`);
  if (notes.length !== 80) die(`canlı published klinisyen 80 değil: ${notes.length}`);

  // --- BLOG detay (182) ---
  const families = { kaleminden: [], 'saglikli-yasam': [], 'yatak-yastik': [] };
  for (const r of blogRec) {
    const p = postById.get(r.id);
    const canonical = `${ORIGIN}${r.newUrl}`;
    const description = (p.excerpt && p.excerpt.trim()) ? p.excerpt.trim() : plainSummary(p.content);
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Article', headline: p.title, description: description || undefined, articleSection: p.category,
          inLanguage: 'tr-TR', datePublished: p.createdAt || p.created_at, dateModified: p.updatedAt || p.createdAt || p.created_at,
          image: p.imageUrl || LOGO, mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
          author: { '@id': `${ORIGIN}/#defne-kaya-utlu` }, publisher: { '@id': `${ORIGIN}/#org` } },
        breadcrumb(r.contentFamily, p.title, canonical),
      ],
    };
    const body = `<main><nav><a href="${FAM[r.contentFamily].base}">← ${esc(FAM[r.contentFamily].name)}</a></nav>`
      + `<p>${esc(p.category || '')}</p><h1>${esc(p.title)}</h1>`
      + (description ? `<p>${esc(description)}</p>` : '')
      + `<article>${blogBlocksToHtml(parseBlog(p.content))}</article>${DISCLAIMER}</main>`;
    write(r.newUrl, renderPage({ title: `${p.title} | Omurgam`, description, canonical, type: 'article', jsonLd, bodyHtml: body }));
    families[r.contentFamily].push({ url: r.newUrl, title: p.title, category: p.category });
  }

  // --- KLİNİSYEN detay (80) ---
  const clinList = [];
  for (const r of clinRec) {
    const n = noteById.get(r.id);
    const canonical = `${ORIGIN}${r.newUrl}`;
    const description = plainSummary(n.content);
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Article', headline: n.title, description, articleSection: n.category || 'Klinik Değerlendirme',
          inLanguage: 'tr-TR', datePublished: n.createdAt, dateModified: n.updatedAt || n.createdAt,
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
          author: { '@id': `${ORIGIN}/#defne-kaya-utlu` }, publisher: { '@id': `${ORIGIN}/#org` } },
        breadcrumb('klinisyenler', n.title, canonical),
      ],
    };
    const body = `<main><nav><a href="/klinisyenler">← Klinisyenlere Notlar</a></nav>`
      + `<p>${esc(n.category || 'Klinik Değerlendirme')}</p><h1>${esc(n.title)}</h1>`
      + `<article>${noteBlocksToHtml(parseNote(n.content))}</article>${DISCLAIMER}</main>`;
    write(r.newUrl, renderPage({ title: `${n.title} | Omurgam`, description, canonical, type: 'article', jsonLd, bodyHtml: body }));
    clinList.push({ url: r.newUrl, title: n.title, category: n.category || 'Klinik Değerlendirme' });
  }

  // --- İNDEKS sayfaları (4) ---
  function writeIndex(fam, items) {
    const m = FAM[fam];
    const canonical = `${ORIGIN}${m.base}`;
    const links = items.map((it) => `<li><a href="${it.url}">${esc(it.title)}</a></li>`).join('\n');
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'CollectionPage', name: m.title, description: m.desc, inLanguage: 'tr-TR', url: canonical },
        { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: m.name, item: canonical } ] },
        { '@type': 'ItemList', numberOfItems: items.length,
          itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.title, url: `${ORIGIN}${it.url}` })) },
      ],
    };
    const body = `<main><h1>${esc(m.title)}</h1><p>${esc(m.desc)}</p><ul>\n${links}\n</ul></main>`;
    write(m.base, renderPage({ title: `${m.title} | Omurgam`, description: m.desc, canonical, type: 'website', jsonLd, bodyHtml: body }));
  }
  writeIndex('kaleminden', families.kaleminden);
  writeIndex('saglikli-yasam', families['saglikli-yasam']);
  writeIndex('yatak-yastik', families['yatak-yastik']);
  writeIndex('klinisyenler', clinList);

  // --- ÜRETİM-GÜVENLİ DOĞRULAMALAR ---
  const errs = [];
  const detailTotal = blogRec.length + clinRec.length;
  if (detailTotal !== 262) errs.push(`detay 262 değil: ${detailTotal}`);
  if (families.kaleminden.length !== 83) errs.push(`omurgam-ne-diyor 83 değil: ${families.kaleminden.length}`);
  if (families['saglikli-yasam'].length !== 67) errs.push(`saglikli-yasam 67 değil: ${families['saglikli-yasam'].length}`);
  if (families['yatak-yastik'].length !== 32) errs.push(`yatak-yastik 32 değil: ${families['yatak-yastik'].length}`);
  if (clinList.length !== 80) errs.push(`klinisyen 80 değil: ${clinList.length}`);

  // örnek detay + indeks ham HTML testleri
  const sampleBlog = readFileSync(join(DIST, blogRec[0].newUrl, 'index.html'), 'utf8');
  const sampleClin = readFileSync(join(DIST, clinRec[0].newUrl, 'index.html'), 'utf8');
  for (const [name, html, rec, p] of [['blog', sampleBlog, blogRec[0], postById.get(blogRec[0].id)], ['klinisyen', sampleClin, clinRec[0], noteById.get(clinRec[0].id)]]) {
    if ((html.match(/rel="canonical"/g) || []).length !== 1) errs.push(`${name}: tam 1 canonical değil`);
    if ((html.match(/id="seo-jsonld"/g) || []).length !== 1) errs.push(`${name}: tam 1 seo-jsonld değil`);
    if (!html.includes(`rel="canonical" href="${ORIGIN}${rec.newUrl}"`)) errs.push(`${name}: self-canonical yanlış`);
    if (!html.includes(`<h1>${esc(p.title)}</h1>`)) errs.push(`${name}: H1 yok`);
    if (!html.includes('"@type":"Article"')) errs.push(`${name}: Article JSON-LD yok`);
    if (!html.includes('"@type":"BreadcrumbList"')) errs.push(`${name}: Breadcrumb yok`);
    if (/\/blog\/[0-9a-f-]{36}/.test(html)) errs.push(`${name}: eski /blog/<UUID> izi var`);
  }
  const idxChecks = [['kaleminden', 83], ['saglikli-yasam', 67], ['yatak-yastik', 32], ['klinisyenler', 80]];
  for (const [fam, n] of idxChecks) {
    const html = readFileSync(join(DIST, FAM[fam].base, 'index.html'), 'utf8');
    const c = (html.match(new RegExp(`<li><a href="${FAM[fam].base}/`, 'g')) || []).length;
    if (c !== n) errs.push(`indeks ${fam}: ${n} link beklenirken ${c}`);
    if ((html.match(/id="seo-jsonld"/g) || []).length !== 1) errs.push(`indeks ${fam}: tam 1 seo-jsonld değil`);
  }
  if (errs.length) die('doğrulama:\n - ' + errs.join('\n - '));

  console.log(`[prerender-content] OK — 262 detay (83/67/32/80) + 4 indeks; canlı 182 blog + 80 klinisyen eşleşti; tam 1 canonical & seo-jsonld; eski /blog/<UUID> izi yok.`);
})();
