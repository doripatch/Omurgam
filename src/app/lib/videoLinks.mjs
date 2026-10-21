// Blog yazısı → konuyla ilgili videolar (iç linkleme). Yazının kapsamlı rehberi (findPillar)
// bel fıtığı / boyun ise o kategorideki videolardan 3 tanesi, yazı kimliğine göre dönüşümlü seçilir
// (her video farklı yazılardan link alsın). Metin/tıbbi içerik DEĞİŞMEZ; yalnız yazı sonuna link eklenir.
// Ortak: prerender-content.mjs (statik HTML) ve MigratedBlogPost.tsx (React, dist/video-cards.json) aynı sonucu üretir.

export const PILLAR_VIDEO_CATEGORY = { '/bel-fitigi': 'Bel Fıtığı', '/boyun-fitigi': 'Boyun Ağrısı' };

// FNV-1a + karıştırma: UUID'lerden dengeli dağılım (her video benzer sayıda yazıdan link alsın).
function hash(s) {
  let h = 0x811c9dc5;
  for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0; h ^= h >>> 13;
  return h >>> 0;
}

/**
 * @param postId  Yazı kimliği (dönüşüm için).
 * @param pillarUrl  findPillar sonucu url'si ya da null.
 * @param cards  [{ url, title, category }] — kanonik videolar.
 * @returns en çok n video kartı (url sırasına göre kararlı).
 */
export function pickVideosForPost(postId, pillarUrl, cards, n = 3) {
  const cat = PILLAR_VIDEO_CATEGORY[pillarUrl || ''];
  if (!cat || !Array.isArray(cards)) return [];
  const pool = cards.filter((c) => c && c.category === cat && c.url && c.title)
    .sort((a, b) => (a.url < b.url ? -1 : a.url > b.url ? 1 : 0));
  if (!pool.length) return [];
  const start = hash(postId) % pool.length;
  const out = [];
  for (let k = 0; k < Math.min(n, pool.length); k++) out.push(pool[(start + k) % pool.length]);
  return out;
}
