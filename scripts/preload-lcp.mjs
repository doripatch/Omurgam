// postbuild (en son): anasayfanın LCP öğesi olan ilk banner görselini dist/index.html'e <link rel="preload"> olarak yazar.
// Böylece görsel, JS paketini ve /banners API cevabını beklemeden HTML ile birlikte inmeye başlar (mobil LCP).
// Yalnız dist/index.html'e yazılır (prerender sayfaları bundan önce üretildiği için onlara girmez).
// Admin banner sırasını değiştirirse bir sonraki build'e kadar bu preload eskir; index.html'deki erken istek
// (window.__omBanners) güncel banner'ı yine önceden yükler. Bu yüzden hata/boş cevapta build DURMAZ, adım atlanır.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = process.env.PRERENDER_DIST || join(ROOT, 'dist');
const file = join(DIST, 'index.html');

const info = readFileSync(join(ROOT, 'utils/supabase/info.tsx'), 'utf8');
const projectId = (info.match(/projectId\s*=\s*"([^"]+)"/) || [])[1];
const anon = (info.match(/publicAnonKey\s*=\s*"([^"]+)"/) || [])[1];

try {
  const res = await fetch(`https://${projectId}.supabase.co/functions/v1/server/banners`, {
    headers: { Authorization: `Bearer ${anon}` },
  });
  const url = res.ok ? (((await res.json()).banners || [])[0] || {}).imageUrl : null;
  if (!url || !/^https:\/\//.test(url)) {
    console.warn('[preload-lcp] banner bulunamadı, adım atlandı');
  } else {
    const html = readFileSync(file, 'utf8');
    if (!html.includes('<!-- LCP:')) throw new Error('index.html LCP işareti yok');
    const tag = `<link rel="preload" as="image" href="${url.replace(/"/g, '&quot;')}" fetchpriority="high" />\n    `;
    writeFileSync(file, html.replace('<!-- LCP:', `${tag}<!-- LCP:`));
    console.log(`[preload-lcp] OK — ilk banner önceden yükleniyor: ${url.split('/').pop()}`);
  }
} catch (e) {
  console.warn(`[preload-lcp] atlandı: ${e && e.message ? e.message : e}`);
}
