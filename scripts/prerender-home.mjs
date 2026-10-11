// postbuild (en son): yeni anasayfayı (HomeV2) gerçek veriyle HTML'e çizer → dist/index.html.
// - Veri: canlı API (yazı okunma sayıları, videolar, sağlık sözlüğü mitleri) + repodaki haritalar ve Omurga Sözlüğü.
//   Tıbbi metin üretilmez; tanımlar/mitler kaynaktan aynen alınır (yalnız ❌/✅ işaretleri temizlenir).
// - Çizim: react-dom/server ile AYNI HomeV2 bileşeni, AYNI veriyle → tarayıcıda React aynı DOM'u üretir (sıçrama yok).
// - Veri ayrıca window.__omHome (ilk açılış) ve dist/home-data.json (istemci içi gezinme) olarak yazılır.
// make-spa-shell.mjs'ten SONRA çalışmalı: spa.html (404 + diğer SPA sayfaları) boş kabuk kalır.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = process.env.PRERENDER_DIST || join(ROOT, 'dist');
const die = (m) => { console.error(`[prerender-home] HATA: ${m}`); process.exit(1); };

const info = readFileSync(join(ROOT, 'utils/supabase/info.tsx'), 'utf8');
const projectId = (info.match(/projectId\s*=\s*"([^"]+)"/) || [])[1];
const anon = (info.match(/publicAnonKey\s*=\s*"([^"]+)"/) || [])[1];
const API = `https://${projectId}.supabase.co/functions/v1/server`;
async function get(path) {
  const r = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${anon}` } });
  if (!r.ok) die(`API ${path} -> ${r.status}`);
  return r.json();
}
const readJson = (rel) => JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
const clean = (s) => String(s ?? '').replace(/^[\s❌✅✗✓]+/u, '').replace(/\s+/g, ' ').trim();
function cut(s, max) {
  const t = clean(s);
  if (t.length <= max) return t;
  const c = t.slice(0, max - 1);
  return c.slice(0, c.lastIndexOf(' ')).replace(/[,;:\s]+$/, '') + '…';
}

async function buildData() {
  const [blogRes, videoRes, termsRes] = await Promise.all([get('/blog'), get('/videos'), get('/medical-terms')]);
  const urlMap = new Map(readJson('src/app/data/urlMigrationMap.json').filter((r) => r.oldUrl).map((r) => [r.id, r]));
  const videoMap = readJson('src/app/data/videoUrlMap.json');
  const videoById = new Map(videoMap.map((r) => [r.id, r]));
  const glossary = readJson('src/app/data/spineGlossary.json').master;

  const posts = (blogRes.posts || blogRes || []).filter((p) => p.published !== false && urlMap.has(p.id));
  const byViews = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0) || String(b.createdAt).localeCompare(String(a.createdAt)));
  const mostRead = byViews.slice(0, 4).map((p) => ({
    title: clean(p.title), url: `${urlMap.get(p.id).newUrl}/`, category: clean(p.category), views: p.views || 0,
  }));

  const canon = (videoRes.videos || []).filter((v) => v.published !== false && videoById.get(v.id)?.canonicalCandidateId === v.id);
  const videos = canon.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 3).map((v) => {
    const rec = videoById.get(v.id);
    return { title: clean(v.title), url: `${rec.newUrl}/`, thumb: v.thumbnailUrl || `https://i.ytimg.com/vi/${rec.youtubeId}/mqdefault.jpg` };
  });

  // Günün terimi havuzu: sözlükten eşit aralıklı 31 terim (HTML'i şişirmemek için tamamı değil).
  const withDef = glossary.filter((t) => t.slug && t.term && t.definition);
  const step = Math.max(1, Math.floor(withDef.length / 31));
  const terms = withDef.filter((_, i) => i % step === 0).slice(0, 31).map((t) => ({ term: clean(t.term), slug: t.slug, def: cut(t.definition, 170) }));

  const myths = (termsRes.terms || []).filter((t) => t.mistakeWrong && t.mistakeRight).slice(0, 21)
    .map((t) => ({ term: clean(t.term), wrong: cut(t.mistakeWrong, 160), right: cut(t.mistakeRight, 180) }));

  // Omurga haritası: bölge tanımı ve ilgili terimler Omurga Sözlüğü'nden aynen; yazılar blogdan (başlık/kategori eşleşmesi,
  // okunmaya göre ilk 3). Yazısı az olan bölgelerde (sırt, sakrum, koksiks) liste gösterilmez, sözlük/rehber bağlantısı kalır.
  const gBySlug = new Map(glossary.map((t) => [t.slug, t]));
  const normT = (s) => clean(s).toLocaleLowerCase('tr-TR');
  const gByTerm = new Map(glossary.map((t) => [normT(t.term), t]));
  const lower = (s) => clean(s).toLocaleLowerCase('tr-TR');
  const REGIONS = [
    { key: 'boyun', label: 'Boyun', slug: 'servikal-omurga', cats: ['Boyun Fıtığı', 'Boyun Ağrısı'], rx: /boyun|servikal/, guide: { label: 'Boyun fıtığı rehberi', to: '/boyun-fitigi' } },
    { key: 'sirt', label: 'Sırt', slug: 'torakal-omurga', cats: [], rx: null, guide: { label: 'Skolyoz rehberi', to: '/skolyoz' } },
    { key: 'bel', label: 'Bel', slug: 'lomber-omurga', cats: ['Bel Fıtığı', 'Bel Ağrısı'], rx: /(^|\s)bel(\s|$)|lomber|siyatik/, guide: { label: 'Bel fıtığı rehberi', to: '/bel-fitigi' } },
    { key: 'sakrum', label: 'Sakrum', slug: 'sakrum', cats: [], rx: null, guide: { label: 'Sakralizasyon nedir?', to: '/omurga-sozlugu/sakralizasyon/' } },
    { key: 'koksiks', label: 'Kuyruk sokumu', slug: 'koksiks', cats: [], rx: null },
  ];
  const regions = REGIONS.map((r) => {
    const g = gBySlug.get(r.slug);
    if (!g || !g.definition) die(`omurga haritası: sözlükte ${r.slug} yok`);
    const posts = byViews
      .filter((p) => r.cats.includes(clean(p.category)) || (r.rx && r.rx.test(lower(p.title))))
      .slice(0, 3)
      .map((p) => ({ title: clean(p.title), url: `${urlMap.get(p.id).newUrl}/` }));
    const related = String(g.relatedTerms || '').split('·').map((t) => gByTerm.get(normT(t)))
      .filter((t) => t && t.slug && t.slug !== r.slug).slice(0, 3).map((t) => ({ term: clean(t.term), slug: t.slug }));
    return { key: r.key, label: r.label, term: clean(g.term), slug: r.slug, def: clean(g.definition), posts, ...(r.guide ? { guide: r.guide } : {}), related };
  });

  const data = {
    generatedAt: new Date().toISOString(),
    stats: {
      posts: posts.length,
      videos: videoMap.filter((r) => r.id === r.canonicalCandidateId).length,
      terms: glossary.length,
      views: posts.reduce((s, p) => s + (p.views || 0), 0),
    },
    mostRead, videos, terms, myths, regions,
  };
  if (mostRead.length < 3) die(`en çok okunan yazı az: ${mostRead.length}`);
  if (videos.length < 3) die(`video az: ${videos.length}`);
  if (terms.length < 20) die(`terim havuzu az: ${terms.length}`);
  if (!myths.length) die('mit yok');
  for (const k of ['boyun', 'bel']) if (regions.find((r) => r.key === k).posts.length < 3) die(`omurga haritası: ${k} için yazı az`);
  return data;
}

async function renderHome(data) {
  const cache = join(ROOT, 'node_modules', '.cache', 'prerender-home');
  mkdirSync(cache, { recursive: true });
  const entry = join(cache, 'entry.jsx');
  writeFileSync(entry, `import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import HomeV2 from ${JSON.stringify(join(ROOT, 'src/app/pages/HomeV2.tsx'))};
export const render = (data) => renderToString(<StaticRouter location="/"><HomeV2 initialData={data} /></StaticRouter>);
`);
  const out = join(cache, 'entry.mjs');
  await build({
    entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', outfile: out, jsx: 'automatic', logLevel: 'error',
    // npm paketleri (react, react-dom/server, react-router, lucide) Node'dan doğrudan yüklenir; yalnız src paketlenir.
    packages: 'external',
    define: { 'import.meta.env': JSON.stringify({ DEV: false, PROD: true, MODE: 'production' }) },
    // Vite'ın kök-göreli import'ları ("/utils/...") için çözücü.
    plugins: [{ name: 'root-abs', setup(b) { b.onResolve({ filter: /^\/utils\// }, (a) => ({ path: join(ROOT, a.path) + '.tsx' })); } }],
  });
  const { render } = await import(pathToFileURL(out).href + `?t=${Date.now()}`);
  const html = render(data);
  rmSync(cache, { recursive: true, force: true });
  return html;
}

const data = await buildData();
const body = await renderHome(data);
if (!body.includes('Omurga Sağlığı Platformu')) die('SSR çıktısında H1 yok');
if (!body.includes('Omurganızı keşfedin')) die('SSR çıktısında omurga haritası yok');

// Root kabuğu: aynı sınıflar (Root.tsx) + yalnız logo içeren üst bar (73px; tam menü React ile gelir, yükseklik aynı).
const shell = '<div class="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">'
  + '<header class="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-amber-500/10 dark:border-slate-700 shadow-sm">'
  + '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center h-[4.5rem] gap-2">'
  + '<a href="/" class="flex items-center group flex-shrink-0"><img src="/assets/logo-header.webp" alt="Omurgam" width="190" height="192" class="h-14 md:h-16 w-auto object-contain"></a>'
  + `</div></div></header><main class="flex-1">${body}</main></div>`;

const file = join(DIST, 'index.html');
let html = readFileSync(file, 'utf8');
if (!html.includes('<div id="root"></div>')) die('index.html boş #root içermiyor');
const json = JSON.stringify(data).replace(/</g, '\\u003c');
html = html.replace('</head>', `  <script>window.__omHome = ${json};</script>\n  </head>`);
html = html.replace('<div id="root"></div>', `<div id="root">${shell}</div>`);
// Ana JS'i ilk çizimden SONRA iste: içerik zaten HTML'de; aksi halde (hızlı ağda) JS ilk çizimden önce başladığı için
// Lighthouse onu ilk görüntünün bağımlısı sayıp FCP/LCP'yi JS indirmesine bağlıyor. Gizli sekmede rAF çalışmaz → 1,5 sn yedek.
const mod = html.match(/<script type="module" crossorigin src="(\/assets\/[^"]+\.js)"><\/script>/);
if (!mod) die('ana modül script etiketi bulunamadı');
if (/rel="modulepreload"/.test(html)) die('modulepreload var; JS yine ilk çizimden önce başlar');
html = html.replace(mod[0], `<script>(function(){var d=0;function go(){if(d)return;d=1;var s=document.createElement('script');s.type='module';s.crossOrigin='';s.src='${mod[1]}';document.head.appendChild(s);}requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(go,0);});});setTimeout(go,1500);})();</script>`);
writeFileSync(file, html);
writeFileSync(join(DIST, 'home-data.json'), JSON.stringify(data));

// Doğrulama: spa.html boş kabuk kalmalı; index.html tek H1.
const spa = readFileSync(join(DIST, 'spa.html'), 'utf8');
if (!spa.includes('<div id="root"></div>') || spa.includes('__omHome')) die('spa.html kabuk değil');
if ((html.match(/<h1[ >]/g) || []).length !== 1) die('index.html tam 1 H1 değil');
console.log(`[prerender-home] OK — anasayfa HTML'e çizildi (${Math.round(body.length / 1024)} KB): ${data.mostRead.length} en çok okunan, ${data.videos.length} video, ${data.terms.length} terim, ${data.myths.length} mit; home-data.json yazıldı.`);
