// postbuild: "Bana rastgele bir şey öğret" havuzu → dist/learn-pool.json (anasayfadaki düğmeye basılınca bir kez yüklenir).
// Kaynaklar: Omurga Sözlüğü (tanım, hasta dili, doğru/yanlış), canlı API (yazılar, videolar).
// Tıbbi metin YAZILMAZ: sözlük cümleleri aynen alınır, yalnız ❌/✅ işaretleri ayrılır ve uzun metin kısaltılır.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { blogDescription } from '../src/app/lib/blogSeo.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = process.env.PRERENDER_DIST || join(ROOT, 'dist');
const die = (m) => { console.error(`[learn-pool] HATA: ${m}`); process.exit(1); };
const readJson = (rel) => JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));

const info = readFileSync(join(ROOT, 'utils/supabase/info.tsx'), 'utf8');
const projectId = (info.match(/projectId\s*=\s*"([^"]+)"/) || [])[1];
const anon = (info.match(/publicAnonKey\s*=\s*"([^"]+)"/) || [])[1];
async function get(path) {
  const r = await fetch(`https://${projectId}.supabase.co/functions/v1/server${path}`, { headers: { Authorization: `Bearer ${anon}` } });
  if (!r.ok) die(`API ${path} -> ${r.status}`);
  return r.json();
}
const clean = (s) => String(s ?? '').replace(/^[\s❌✅✗✓]+/u, '').replace(/\s+/g, ' ').trim();
const cut = (s, max) => { const t = clean(s); if (t.length <= max) return t; const c = t.slice(0, max - 1); return c.slice(0, c.lastIndexOf(' ')).replace(/[,;:\s]+$/, '') + '…'; };

// 1) Terimler ve doğru/yanlış: sözlüğün tamamı (her terimde ❌ yaygın yanlış | ✅ doğrusu var).
const glossary = readJson('src/app/data/spineGlossary.json').master.filter((g) => g.slug && g.term && g.definition);
const terms = glossary.map((g) => ({
  term: clean(g.term), slug: g.slug, def: cut(g.definition, 260),
  pl: String(g.patientLanguage || '').split('·').map(clean).filter((s) => s && s.toLocaleLowerCase('tr-TR') !== clean(g.term).toLocaleLowerCase('tr-TR')).slice(0, 3),
}));
const quiz = [];
for (const g of glossary) {
  const [w, r] = String(g.trueFalse || '').split('|');
  if (!w || !r || !/❌/u.test(w) || !/✅/u.test(r)) continue;
  const wrong = clean(w), right = clean(r);
  if (wrong.length < 15 || right.length < 15 || wrong.length > 240 || right.length > 260) continue;
  // ✅ cümlesi tek başına "doğru" iddiası olarak sorulabilir mi? Yalnız terimin adıyla başlıyorsa (bağlamsız özne yok).
  const head = clean(g.term).split(/[\s(]/)[0].toLocaleLowerCase('tr-TR').slice(0, 5);
  const st = head.length >= 4 && right.toLocaleLowerCase('tr-TR').replace(/^'/, '').startsWith(head);
  quiz.push({ term: clean(g.term), slug: g.slug, wrong, right, ...(st ? { st: 1 } : {}) });
}

// 2) Yazılar ve videolar (canlı API, yeni adresler; yalnız yayındakiler)
const [blogRes, videoRes] = await Promise.all([get('/blog'), get('/videos')]);
const urlMap = new Map(readJson('src/app/data/urlMigrationMap.json').filter((r) => r.oldUrl).map((r) => [r.id, r]));
const posts = (blogRes.posts || blogRes || [])
  .filter((p) => p.published !== false && urlMap.has(p.id))
  .map((p) => ({ title: clean(p.title), url: `${urlMap.get(p.id).newUrl}/`, cat: clean(p.category), desc: cut(blogDescription(p.excerpt, p.content), 200) }));
const videoMap = new Map(readJson('src/app/data/videoUrlMap.json').map((r) => [r.id, r]));
const videos = (videoRes.videos || [])
  .filter((v) => v.published !== false && videoMap.get(v.id)?.canonicalCandidateId === v.id)
  .map((v) => { const rec = videoMap.get(v.id); return { title: clean(v.title), url: `${rec.newUrl}/`, thumb: v.thumbnailUrl || `https://i.ytimg.com/vi/${rec.youtubeId}/mqdefault.jpg` }; });

if (terms.length < 150 || quiz.length < 100 || posts.length < 150 || videos.length < 30) die(`havuz eksik: terim ${terms.length}, soru ${quiz.length}, yazı ${posts.length}, video ${videos.length}`);
writeFileSync(join(DIST, 'learn-pool.json'), JSON.stringify({ terms, quiz, posts, videos }));
console.log(`[learn-pool] OK — ${terms.length} terim, ${quiz.length} doğru/yanlış, ${posts.length} yazı, ${videos.length} video -> dist/learn-pool.json`);
