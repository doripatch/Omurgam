// MR terim sayfaları arası iç linkleme: her MR detayının altında, dizine açık MR terimlerinden
// alfabetik olarak en yakın komşular ("Diğer MR terimleri"). Amaç: Google'ın "keşfedildi – henüz
// dizine eklenmedi" listesinde bekleyen MR sayfalarına site içinden düzenli link akışı.
// Metin/tıbbi içerik DEĞİŞMEZ; yalnız sayfa sonuna link listesi eklenir.
// Ortak: prerender-mr.mjs (Node, statik HTML) ve MRAnalyzer.tsx (React) aynı sonucu üretir.

const TR = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u', 'Ç': 'c', 'Ğ': 'g', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' };
export const mrSlugify = (s) => String(s || '').split('').map((c) => TR[c] ?? c).join('')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');

/**
 * Dizine açık MR terimleri (sözlüğe taşınmayan + noindex olmayan), tekil slug, Türkçe alfabetik.
 * @param terms  [{ term }] — veri sırasındaki ilk kayıt kazanır (prerender-mr / MRAnalyzer ile aynı kural).
 * @param merged  { mrSlug: glossarySlug } — sözlüğe taşınan (301) terimler.
 * @param noindex  Set<slug> — noindex MR terimleri.
 * @returns [{ slug, term }]
 */
export function indexableMrTerms(terms, merged, noindex) {
  const seen = new Set();
  const out = [];
  for (const t of terms || []) {
    const slug = mrSlugify(t && t.term);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    if (merged[slug] || noindex.has(slug)) continue;
    out.push({ slug, term: String(t.term) });
  }
  return out.sort((a, b) => a.term.localeCompare(b.term, 'tr'));
}

/**
 * Bir MR teriminin alfabetik komşuları (döngüsel; kendisi hariç): önceki n/2 + sonraki n/2.
 * Terim listede yoksa (ör. noindex sayfası) alfabetik yerleşeceği konuma göre seçilir.
 */
export function mrNeighbors(slug, term, list, n = 8) {
  if (!list.length) return [];
  let pos = list.findIndex((x) => x.slug === slug);
  const self = pos !== -1;
  if (!self) {
    pos = list.findIndex((x) => x.term.localeCompare(String(term || ''), 'tr') > 0);
    if (pos === -1) pos = list.length;
  }
  const half = Math.floor(n / 2);
  const picked = [];
  const seen = new Set([slug]);
  for (let k = 1; k <= half; k++) {
    for (const i of [pos - k, self ? pos + k : pos + k - 1]) {
      const x = list[((i % list.length) + list.length) % list.length];
      if (x && !seen.has(x.slug) && picked.length < n) { seen.add(x.slug); picked.push(x); }
    }
  }
  return picked.sort((a, b) => a.term.localeCompare(b.term, 'tr'));
}
