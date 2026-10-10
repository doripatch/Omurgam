// postbuild: SPA kabuğunu ana sayfadan ayırır. dist/index.html'in (henüz anasayfaya özel ekleme yapılmamış)
// kopyası dist/spa.html olur; netlify.toml'da anasayfa dışındaki tüm SPA rewrite'ları ve 404 buna gider.
// Böylece index.html yalnız anasayfa olur ve ileride anasayfaya hazır HTML eklemek 404/giriş/admin sayfalarını etkilemez.
// preload-lcp.mjs'ten ÖNCE çalışmalı (banner preload'u ve gömülü veri kabuğa girmesin).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = process.env.PRERENDER_DIST || join(ROOT, 'dist');
const html = readFileSync(join(DIST, 'index.html'), 'utf8');
const die = (m) => { console.error(`[make-spa-shell] HATA: ${m}`); process.exit(1); };
if (!html.includes('<div id="root"></div>')) die('index.html boş #root içermiyor (kabuk değil)');
if (html.includes('__omBannersInit')) die('index.html anasayfa verisi içeriyor; preload-lcp bu adımdan önce çalışmış');
writeFileSync(join(DIST, 'spa.html'), html);
console.log('[make-spa-shell] OK — dist/spa.html (SPA kabuğu + 404) yazıldı');
