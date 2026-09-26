// Bir metinde GEÇEN Omurga Sözlüğü terimlerini bulur (blog → sözlük iç linkleme).
// Amaç: yüksek-trafikli blog yazılarından, optimize edilmiş sözlük sayfalarına otorite
// akışı + kalış süresi. Metin/tıbbi içerik DEĞİŞMEZ; yalnız yazı SONUNA link bloğu eklenir.
// Ortak: prerender-content.mjs (Node) ve MigratedBlogPost.tsx (React) aynı sonucu üretir.

const norm = (s) => String(s ?? '').toLocaleLowerCase('tr-TR');
const isLetter = (ch) => !!ch && /\p{L}/u.test(ch);

// Pillar (kapsamlı konu rehberi) sayfaları — özellikle klinik terim içermeyen lay
// yazıların (okul çantası, scooter, klima…) derin rehbere yönlendirilmesi için.
// İsabet-sayımı: en çok özel ifade geçen pillar seçilir; hiç yoksa null.
const PILLARS = [
  { url: '/bel-fitigi', name: 'Bel Fıtığı Rehberi', kw: ['bel fıtığı', 'bel ağrısı', 'lomber', 'siyatik', 'bel omur'] },
  { url: '/boyun-fitigi', name: 'Boyun Fıtığı Rehberi', kw: ['boyun fıtığı', 'boyun ağrısı', 'boyun tutul', 'servikal', 'boyun omur'] },
  { url: '/skolyoz', name: 'Skolyoz Rehberi', kw: ['skolyoz', 'omurga eğrilik', 'duruş bozuk', 'postür', 'kifoz'] },
];

/** Metne en uygun kapsamlı rehber (pillar) — isabet-sayımıyla; yoksa null. */
export function findPillar(text) {
  const t = norm(text);
  let best = null, bestN = 0;
  for (const p of PILLARS) {
    let n = 0;
    for (const k of p.kw) { let i = 0; while ((i = t.indexOf(k, i)) !== -1) { n++; i += k.length; } }
    if (n > bestN) { bestN = n; best = p; }
  }
  return bestN > 0 ? { name: best.name, url: best.url } : null;
}

/**
 * @param text  Yazı metni (+başlık).
 * @param master  spineGlossary.master dizisi ({ term, slug }).
 * @param max  En çok kaç link (varsayılan 6).
 * @returns [{ term, slug }] — yazıda BAĞIMSIZ sözcük olarak geçen terimler, en spesifik (uzun) önce.
 */
export function findGlossaryMentions(text, master, max = 6) {
  const hay = norm(text);
  if (!hay) return [];
  // Adaylar: terim adı ≥ 5 karakter (çok kısa/genel terimler gürültü yapmasın). Uzun → spesifik önce.
  const cands = master
    .filter((t) => t && t.term && t.slug && String(t.term).length >= 5)
    .map((t) => ({ term: t.term, slug: t.slug, n: norm(t.term), len: String(t.term).length }))
    .sort((a, b) => b.len - a.len);

  const found = [];
  const seen = new Set();
  for (const c of cands) {
    if (found.length >= max) break;
    if (seen.has(c.slug)) continue;
    const idx = hay.indexOf(c.n);
    if (idx === -1) continue;
    // Bağımsız sözcük sınırı: öncesi/sonrası harf olmamalı (diskografi içinde "disk" eşleşmesin).
    const before = idx === 0 ? '' : hay[idx - 1];
    const after = idx + c.n.length >= hay.length ? '' : hay[idx + c.n.length];
    if (isLetter(before) || isLetter(after)) continue;
    seen.add(c.slug);
    found.push({ term: c.term, slug: c.slug });
  }
  return found;
}
