// Video URL haritası senkronu — canlı videolarda olup haritada olmayanları EKLER (append-only).
// Mevcut kayıtlar ASLA değiştirilmez: bir kez verilen /videolar/<slug> kilitlidir (başlık değişse bile).
// Kullanım: node scripts/sync-video-map.mjs          -> yalnız rapor (dosyaya yazmaz)
//           node scripts/sync-video-map.mjs --write  -> src/app/data/videoUrlMap.json'a ekler
// Gece GitHub Action'ı (.github/workflows/video-map-sync.yml) --write ile çalıştırır ve değişikliği commit'ler.
// API/DB'ye YAZMAZ; yalnız public /videos uç noktasını okur.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MAP_PATH = join(ROOT, 'src/app/data/videoUrlMap.json');
const WRITE = process.argv.includes('--write');
const die = (m) => { console.error(`[sync-video-map] HATA: ${m}`); process.exit(1); };

const info = readFileSync(join(ROOT, 'utils/supabase/info.tsx'), 'utf8');
const projectId = (info.match(/projectId\s*=\s*"([^"]+)"/) || [])[1];
const ANON = (info.match(/publicAnonKey\s*=\s*"([^"]+)"/) || [])[1];
if (!projectId || !ANON) die('utils/supabase/info.tsx içinden projectId/anon okunamadı');

// Türkçe başlık -> slug. DB'deki başlıklar ayrık (NFD) karakter içerebiliyor ("g" + ˘);
// önce NFKD + işaret temizliği, sonra ı/İ eşlemesi. Böylece "fıtığı" -> "fitigi" (asla "fitig-i").
export function slugifyTitle(title) {
  return String(title)
    .replace(/ı/g, 'i').replace(/İ/g, 'i')
    .normalize('NFKD').replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(.{0,80})(-.*)?$/, (s, head, rest) => (rest && s.length > 80 ? head : s));
}

export function youtubeIdOf(v) {
  const u = String(v.videoUrl || v.youtubeUrl || v.url || '');
  const m = u.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : (v.youtubeId || '');
}

async function main() {
  const map = JSON.parse(readFileSync(MAP_PATH, 'utf8'));
  const res = await fetch(`https://${projectId}.supabase.co/functions/v1/server/videos`, {
    headers: { Authorization: `Bearer ${ANON}` },
  });
  if (!res.ok) die(`canlı API ${res.status}`);
  const videos = ((await res.json()).videos || []).filter((v) => v.published !== false);
  // Deterministik sıra: önce oluşturulma tarihi, sonra id.
  videos.sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')) || a.id.localeCompare(b.id));

  const byId = new Map(map.map((r) => [r.id, r]));
  const canonByYt = new Map(map.filter((r) => r.id === r.canonicalCandidateId).map((r) => [r.youtubeId, r]));
  const slugs = new Set(map.map((r) => r.slug));
  const added = [];

  for (const v of videos) {
    if (byId.has(v.id)) continue;
    const yt = youtubeIdOf(v);
    if (!yt) { console.warn(`[sync-video-map] YouTube kimliği yok, atlandı: ${v.id}`); continue; }
    const canon = canonByYt.get(yt);
    let rec;
    if (canon) {
      // Aynı YouTube videosu zaten var -> kopya; canonical hedefe gider, yeni slug üretilmez.
      rec = { id: v.id, youtubeId: yt, slug: canon.slug, oldUrl: `/video/${v.id}`, newUrl: canon.newUrl,
        canonicalCandidateId: canon.id, disposition: 'duplicate-candidate' };
    } else {
      const base = slugifyTitle(v.title) || `video-${yt.toLowerCase()}`;
      let slug = base;
      for (let i = 2; slugs.has(slug); i++) slug = `${base}-${i}`;
      rec = { id: v.id, youtubeId: yt, slug, oldUrl: `/video/${v.id}`, newUrl: `/videolar/${slug}`,
        canonicalCandidateId: v.id, disposition: 'unique' };
      canonByYt.set(yt, rec);
      slugs.add(slug);
    }
    map.push(rec);
    byId.set(rec.id, rec);
    added.push({ ...rec, title: v.title });
  }

  if (!added.length) { console.log(`[sync-video-map] Yeni video yok (${map.length} kayıt).`); return; }
  for (const a of added) console.log(`[sync-video-map] + ${a.newUrl}  (${a.disposition})  ${a.title}`);
  if (WRITE) {
    writeFileSync(MAP_PATH, JSON.stringify(map, null, 2) + '\n');
    console.log(`[sync-video-map] ${added.length} kayıt eklendi -> ${map.length} kayıt.`);
  } else {
    console.log(`[sync-video-map] ${added.length} yeni kayıt bulundu (yazmak için --write).`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => die(e && e.message ? e.message : String(e)));
