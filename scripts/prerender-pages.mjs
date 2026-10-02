// Statik sayfa prerender'ı (postbuild, en son çalışır).
// Prerender'sız kalan SPA sayfaları ham HTML'de hepsi aynı başlık/açıklamayla, canonical'sız ve H1'siz geliyordu
// (2 Eki 2026 link denetimi: 29 sayfa). Bu script her biri için JS ÇALIŞMADAN: benzersiz <title>, description,
// mutlak canonical, OG, JSON-LD (#seo-jsonld — React Seo bileşeni aynı script'i günceller) ve görünür H1 + içerik üretir.
//
// Adres korunur: sayfalar `<yol>.html` olarak yazılır ve netlify.toml'da ilgili rewrite hedefi bu dosyaya çevrilir.
// Böylece GSC'de indekslenmiş "/" SONEKSİZ adresler (/hakkimizda, /bel-fitigi …) değişmez, 301 oluşmaz.
// Anasayfa KASITLI dahil değil: dist/index.html aynı zamanda SPA/404 kabuğu (prerender edilirse tüm bilinmeyen
// adresler anasayfa canonical'ı taşırdı).
//
// Tıbbi metin DEĞİŞTİRİLMEZ: içerik yalnız repodaki kaynaklardan (pillars.ts, policyContent.ts, About.tsx) okunur.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildSync } from 'esbuild';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = process.env.PRERENDER_DIST || join(ROOT, 'dist');
const ORIGIN = 'https://omurgam.com';
const die = (m) => { console.error(`[prerender-pages] HATA: ${m}`); process.exit(1); };

const templatePath = join(DIST, 'index.html');
if (!existsSync(templatePath)) die('dist/index.html yok — postbuild (vite build sonrası) çalışmalı');
const template = readFileSync(templatePath, 'utf8');
if (!template.includes('<div id="root"></div>')) die('şablon beklenen <div id="root"></div> içermiyor');

// TS veri modüllerini esbuild ile tek seferlik ESM'e paketleyip içe aktar (JSON importları dahil).
async function loadTs(rel) {
  const out = join(ROOT, 'node_modules', '.cache', 'prerender-pages', rel.replace(/[/.]/g, '_') + '.mjs');
  mkdirSync(dirname(out), { recursive: true });
  buildSync({ entryPoints: [join(ROOT, rel)], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error',
    define: { 'import.meta.env': JSON.stringify({ DEV: false, PROD: true, MODE: 'production' }) } });
  return import(pathToFileURL(out).href + `?t=${Date.now()}`);
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLdSafe = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

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

const written = [];
function writePage(path, page) {
  if (!path.startsWith('/') || path.endsWith('/')) die(`geçersiz yol: ${path}`);
  const file = join(DIST, `${path.slice(1)}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, renderPage({ ...page, canonical: page.canonical || `${ORIGIN}${path}` }));
  written.push({ path, file, ...page, canonical: page.canonical || `${ORIGIN}${path}` });
}

const breadcrumb = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
});
const DISCLAIMER = '<aside><strong>Önemli:</strong> Bu içerik bilgilendirme amaçlıdır; tanı, muayene veya tedavi önerisi yerine geçmez.</aside>';
const nav = `<nav><a href="/">Omurgam</a></nav>`;

async function main() {
  // ---------------- 1) Pillar rehberleri (pillars.ts) ----------------
  const { PILLARS } = await loadTs('src/app/data/pillars.ts');
  for (const slug of ['bel-fitigi', 'boyun-fitigi', 'skolyoz']) {
    const d = PILLARS[slug];
    if (!d) die(`pillar yok: ${slug}`);
    const url = `${ORIGIN}/${slug}`;
    // JSON-LD: src/app/pages/Pillar.tsx ile aynı yapı (uydurma alan yok).
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'MedicalWebPage', '@id': `${url}#webpage`, url, name: d.metaTitle, description: d.metaDescription,
          inLanguage: 'tr-TR', about: { '@type': 'MedicalCondition', name: d.keyword },
          author: { '@id': `${ORIGIN}/#defne-kaya-utlu` }, publisher: { '@id': `${ORIGIN}/#org` },
          ...(d.reviewDate ? { lastReviewed: d.reviewDate } : {}),
          ...(d.reviewedBy ? { reviewedBy: { '@type': 'Person', name: d.reviewedBy } } : {}),
          ...(d.sources && d.sources.length ? { citation: d.sources.map((s) => (s.url ? { '@type': 'CreativeWork', name: s.label, url: s.url } : { '@type': 'CreativeWork', name: s.label })) } : {}),
        },
        breadcrumb([['Ana Sayfa', ORIGIN], [d.keyword, url]]),
        ...(d.faqs && d.faqs.length ? [{
          '@type': 'FAQPage',
          mainEntity: d.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }] : []),
      ],
    };
    // Satır içi sözlük linkleri: Pillar.tsx kuralı — anchor paragrafta TAM 1 kez geçiyorsa link, yoksa düz metin.
    const para = (text, si, pi) => {
      const links = (d.inlineLinks || []).filter((l) => l.section === si && l.paragraph === pi)
        .filter((l) => text.indexOf(l.anchor) !== -1 && text.indexOf(l.anchor) === text.lastIndexOf(l.anchor))
        .map((l) => ({ ...l, index: text.indexOf(l.anchor) })).sort((a, b) => a.index - b.index);
      let out = ''; let cur = 0;
      for (const l of links) {
        if (l.index < cur) continue;
        out += esc(text.slice(cur, l.index)) + `<a href="${esc(l.to)}">${esc(l.anchor)}</a>`;
        cur = l.index + l.anchor.length;
      }
      return out + esc(text.slice(cur));
    };
    const sections = d.sections.map((s, si) => `<section><h2>${esc(s.h2)}</h2>`
      + (s.body || []).map((p, pi) => `<p>${para(p, si, pi)}</p>`).join('')
      + (s.list && s.list.length ? `<ul>${s.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>` : '')
      + `</section>`).join('');
    const faqs = d.faqs && d.faqs.length
      ? `<section><h2>Sıkça Sorulan Sorular</h2>${d.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}</section>` : '';
    const sources = d.sources && d.sources.length
      ? `<section><h2>Kaynaklar</h2><ul>${d.sources.map((s) => `<li>${s.url ? `<a href="${esc(s.url)}" rel="noopener">${esc(s.label)}</a>` : esc(s.label)}</li>`).join('')}</ul></section>` : '';
    const related = d.related && d.related.length
      ? `<nav aria-label="İlgili"><h2>İlgili İçerikler</h2><ul>${d.related.map((r) => `<li><a href="${esc(r.to)}">${esc(r.label)}</a></li>`).join('')}</ul></nav>` : '';
    writePage(`/${slug}`, {
      title: `${d.metaTitle} | Omurgam`, description: d.metaDescription, type: 'article', jsonLd,
      bodyHtml: `<main>${nav}<article><h1>${esc(d.h1)}</h1><p>${esc(d.lead)}</p>${sections}${faqs}${sources}</article>${related}${DISCLAIMER}</main>`,
    });
  }

  // ---------------- 2) Politikalar (policyContent.ts) ----------------
  const { POLICY_CONTENT } = await loadTs('src/app/lib/policyContent.ts');
  const { policyDescription } = await loadTs('src/app/lib/policyMeta.ts');
  const { POLICIES } = await loadTs('src/app/lib/policies.ts');
  const META_RE = /^(Belge No|Yürürlük Tarihi|Son Güncelleme|Versiyon)\s*:/;
  const H3_RE = /^\d+\.\d+\.?\s/;
  const H2_RE = /^\d+\.\s/;
  const policyPages = [
    ['/gizlilik', 'gizlilik', 'Gizlilik Politikası'],
    ['/kullanim-kosullari', 'kullanim-kosullari', 'Kullanım Koşulları'],
    ...POLICIES.map((p) => [`/politika/${p.slug}`, p.slug, p.title]),
  ];
  for (const [path, slug, title] of policyPages) {
    const body = POLICY_CONTENT[slug];
    // PolicyView.tsx ile aynı satır kuralları (meta / H3 / H2 / paragraf); içerik yoksa aynı placeholder.
    const content = body
      ? body.split('\n').map((raw) => {
          const t = raw.trim();
          if (!t) return '';
          if (META_RE.test(t)) return `<p><small>${esc(t)}</small></p>`;
          if (H3_RE.test(t)) return `<h3>${esc(t)}</h3>`;
          if (H2_RE.test(t)) return `<h2>${esc(t)}</h2>`;
          return `<p>${esc(t)}</p>`;
        }).join('')
      : '<p>Bu politikanın metni hazırlanmaktadır.</p>';
    const canonical = `${ORIGIN}${path}`;
    writePage(path, {
      // React PolicyView ile aynı başlık/açıklama (hidrasyonda değişmesin).
      title: `${title} | Omurgam`, description: policyDescription(slug, title), type: 'website',
      jsonLd: { '@context': 'https://schema.org', '@graph': [
        { '@type': 'WebPage', name: title, url: canonical, inLanguage: 'tr-TR', isPartOf: { '@id': `${ORIGIN}/#website` } },
        breadcrumb([['Ana Sayfa', `${ORIGIN}/`], [title, canonical]]),
      ] },
      bodyHtml: `<main>${nav}<h1>${esc(title)}</h1>${content}</main>`,
    });
  }

  // ---------------- 3) Hakkımızda (About.tsx'teki sabit biyografi metni) ----------------
  {
    const src = readFileSync(join(ROOT, 'src/app/pages/About.tsx'), 'utf8');
    const jsx = src.slice(src.indexOf('return ('));
    // Yalnız h1/h2/h3/p/li metinleri; {ifade}'ler: `|| 'varsayılan'` biçimindeyse varsayılan metin, değilse atılır.
    const clean = (s) => s
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
      .replace(/\{[^{}]*\|\|\s*'([^']*)'\s*\}/g, '$1')
      .replace(/\{[^{}]*\}/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ').trim();
    const blocks = [];
    const re = /<(h1|h2|h3|p|li)\b[^>]*>([\s\S]*?)<\/\1>/g;
    let m;
    while ((m = re.exec(jsx))) {
      const text = clean(m[2]);
      if (text && text.length > 1) blocks.push([m[1], text]);
    }
    const h1 = (blocks.find((b) => b[0] === 'h1') || [, 'Prof. Dr. Defne Kaya Utlu'])[1];
    const body = blocks.filter((b) => b[0] !== 'h1').map(([tag, t]) => `<${tag}>${esc(t)}</${tag}>`).join('');
    if (blocks.length < 10) die(`Hakkımızda içeriği beklenenden az (${blocks.length} blok) — About.tsx yapısı değişmiş olabilir`);
    const desc = "Prof. Dr. Defne Kaya Utlu — fizyoterapi profesörü. Akademik özgeçmiş, uluslararası deneyim, kitap editörlükleri ve çalışma alanları.";
    writePage('/hakkimizda', {
      title: 'Prof. Dr. Defne Kaya Utlu — Hakkımda | Omurgam', description: desc, type: 'profile',
      jsonLd: { '@context': 'https://schema.org', '@graph': [
        { '@type': 'ProfilePage', url: `${ORIGIN}/hakkimizda`, name: 'Prof. Dr. Defne Kaya Utlu — Hakkımda', inLanguage: 'tr-TR',
          mainEntity: { '@id': `${ORIGIN}/#defne-kaya-utlu` } },
        breadcrumb([['Ana Sayfa', `${ORIGIN}/`], ['Hakkımda', `${ORIGIN}/hakkimizda`]]),
      ] },
      bodyHtml: `<main>${nav}<h1>${esc(h1)}</h1>${body}</main>`,
    });
  }

  // ---------------- 4) MR terim sözlüğü ana sayfası (280 terime iç link) ----------------
  {
    const mrDir = join(DIST, 'mr-analiz');
    if (!existsSync(mrDir)) die('dist/mr-analiz yok — prerender-mr önce çalışmalı');
    const terms = readdirSync(mrDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => {
      const html = readFileSync(join(mrDir, e.name, 'index.html'), 'utf8');
      const h1 = (html.match(/<h1>([^<]*)<\/h1>/) || [])[1] || e.name;
      return { slug: e.name, label: h1.replace(/&amp;/g, '&') };
    }).sort((a, b) => a.label.localeCompare(b.label, 'tr'));
    if (terms.length < 250) die(`MR terim sayısı beklenenden az: ${terms.length}`);
    const title = 'MR Raporu Terim Sözlüğü — Bel ve Boyun MR Raporu Nasıl Okunur?';
    const desc = 'MR raporunuzda geçen protrüzyon, ekstrüzyon, bulging, dejenerasyon gibi terimlerin ne anlama geldiğini sade ve bilimsel bir dille öğrenin. 290+ MR terimi, Prof. Dr. Defne Kaya Utlu editörlüğünde.';
    writePage('/mr-analiz', {
      title: `${title} | Omurgam`, description: desc, type: 'website',
      jsonLd: { '@context': 'https://schema.org', '@graph': [
        { '@type': 'DefinedTermSet', name: 'Omurgam MR Raporu Terim Sözlüğü', url: `${ORIGIN}/mr-analiz`, inLanguage: 'tr-TR' },
        breadcrumb([['Ana Sayfa', `${ORIGIN}/`], ['MR Raporu Terim Sözlüğü', `${ORIGIN}/mr-analiz`]]),
      ] },
      bodyHtml: `<main>${nav}<h1>MR Raporu Terim Sözlüğü</h1><p>${esc(desc)}</p><ul>`
        + terms.map((t) => `<li><a href="/mr-analiz/${esc(t.slug)}/">${esc(t.label)}</a></li>`).join('')
        + `</ul>${DISCLAIMER}</main>`,
    });
  }

  // ---------------- 5) Diğer sayfalar (başlık + açıklama + H1) ----------------
  // Başlık/açıklamalar ilgili bileşenin <Seo> değerleriyle aynı; Seo'su olmayan / admin ayarından gelenlere sade metin.
  const simple = [
    ['/iletisim', 'İletişim', 'Omurgam ile iletişime geçin: soru, öneri, iş birliği ve basın talepleriniz için bize yazın.'],
    ['/randevu', 'Randevu / Danışma Talebi', "Prof. Dr. Defne Kaya Utlu'dan omurga ve fizyoterapi konularında danışma/randevu talebinde bulunun. Talebinizi bırakın, sizinle iletişime geçelim."],
    ['/basin', 'Basın Odası', 'Omurgam basın odası — Prof. Dr. Defne Kaya Utlu ve platform hakkında basın bilgileri, biyografi, logo ve iletişim.'],
    ['/forum', 'Sizden Gelenler', 'Omurga sağlığı hakkında sorularınızı sorun, Prof. Dr. Defne Kaya Utlu ve ekibinden yanıtlar alın.'],
    ['/soru-sor', 'Uzmana Soru Sor', 'Omurga sağlığıyla ilgili sorunuzu Omurgam uzmanlarına iletin; yanıtlar bilimsel kaynaklarla, sade bir dille verilir.'],
    ['/sorular', 'Sıkça Sorulan Sorular', 'Omurgam ve omurga sağlığı hakkında en sık sorulan sorular ve yanıtları.'],
    ['/saglik-sozlugu', 'Sağlık Sözlüğü — Tıbbi ve Tedavi Terimleri', 'Çimentolu alçı, atel, traksiyon, ödem gibi tıbbi ve tedavi terimlerinin sade Türkçe açıklamaları. Omurgam Sağlık Sözlüğü.'],
    ['/gunun-terimi', 'Günün Terimi — Kelime Oyunu', "Her gün yeni bir tıbbi terim! Omurga ve sağlık terimlerini tahmin et, serini koru. Omurgam'ın günlük kelime oyunu."],
    ['/mit-avi', 'Mit Avı — Omurga Mitleri Oyunu', "Doğru mu, yanlış mı? Her gün omurga sağlığıyla ilgili 5 iddiayı değerlendir, yanlış bilinenleri öğren. Omurgam'ın günlük bilgi oyunu."],
  ];
  for (const [path, title, desc] of simple) {
    writePage(path, {
      title: `${title} | Omurgam`, description: desc, type: 'website',
      jsonLd: { '@context': 'https://schema.org', '@graph': [
        { '@type': 'WebPage', name: title, url: `${ORIGIN}${path}`, inLanguage: 'tr-TR', isPartOf: { '@id': `${ORIGIN}/#website` } },
        breadcrumb([['Ana Sayfa', `${ORIGIN}/`], [title, `${ORIGIN}${path}`]]),
      ] },
      bodyHtml: `<main>${nav}<h1>${esc(title)}</h1><p>${esc(desc)}</p></main>`,
    });
  }
  // ---------------- DOĞRULAMA ----------------
  const errs = [];
  const titles = new Map();
  for (const w of written) {
    const html = readFileSync(w.file, 'utf8');
    if ((html.match(/rel="canonical"/g) || []).length !== 1) errs.push(`${w.path}: tam 1 canonical değil`);
    if ((html.match(/id="seo-jsonld"/g) || []).length !== 1) errs.push(`${w.path}: tam 1 seo-jsonld değil`);
    if ((html.match(/<h1>/g) || []).length !== 1) errs.push(`${w.path}: tam 1 H1 değil`);
    if (!w.description || w.description.length < 40) errs.push(`${w.path}: açıklama kısa/boş`);
    if (titles.has(w.title)) errs.push(`${w.path}: başlık ${titles.get(w.title)} ile aynı`); titles.set(w.title, w.path);
    if (w.canonical !== `${ORIGIN}${w.path}`) errs.push(`${w.path}: self-canonical değil`);
    if (html.includes('<div id="root"></div>')) errs.push(`${w.path}: gövde boş`);
  }
  if (written.length !== 26) errs.push(`26 sayfa beklenirken ${written.length}`);
  if (errs.length) die('doğrulama:\n - ' + errs.join('\n - '));
  rmSync(join(ROOT, 'node_modules', '.cache', 'prerender-pages'), { recursive: true, force: true });
  console.log(`[prerender-pages] OK — ${written.length} sayfa (3 pillar + 12 politika + hakkımızda + MR indeks + 9 sayfa); benzersiz başlık, tam 1 canonical/JSON-LD/H1.`);
}

main().catch((e) => die(e && e.stack ? e.stack : String(e)));
