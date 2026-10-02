// Ortak blog meta açıklaması (JSX YOK) — MigratedBlogPost.tsx (React) ve prerender-content.mjs (Node)
// AYNI açıklamayı üretir. Metin ASLA yeniden yazılmaz: yalnız mevcut özet/içerikten tam cümleler seçilir.
// Sorun (2 Eki 2026 denetimi): özetlerin bir kısmı çok kısa (<70), ":" ile yarım kalıyor ya da 160+ krk "…" ile kesik.
import { smartTruncate } from './glossarySeo.mjs';

const MAX = 155;
const MIN = 70;

const cleanLine = (s) => String(s ?? '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/^\s*#{1,6}\s*/, '')
  .replace(/^\s*[-•*]\s+/, '')
  .replace(/[*_`~]+/g, '')
  .replace(/\s+/g, ' ')
  .trim();

// Özet zaten iyiyse (70–160 krk, ":" veya kesik "…" ile bitmiyor) olduğu gibi kullanılır.
export function isGoodExcerpt(excerpt) {
  const e = cleanLine(excerpt);
  return e.length >= MIN && e.length <= 160 && !/[:…]$/.test(e) && !/\.\.\.$/.test(e);
}

export function blogDescription(excerpt, content) {
  if (isGoodExcerpt(excerpt)) return cleanLine(excerpt);
  const text = String(content || excerpt || '').split('\n').map(cleanLine).filter(Boolean).slice(0, 12).join(' ');
  if (!text) return cleanLine(excerpt) || 'Omurga sağlığı içeriği.';
  // Tam cümleler (kapanış tırnağı dahil), ≤155 krk sığdığı kadar.
  const sentences = text.match(/[^]*?[.!?…]+["”’']?(?=\s|$)/g) || [];
  // Aday önekler: tırnağı dengeli (alıntı ortasında bitmeyen) en uzun öneki tercih et.
  const balanced = (t) => (t.match(/"/g) || []).length % 2 === 0 && (t.match(/“/g) || []).length === (t.match(/”/g) || []).length;
  let out = '';
  let best = '';
  for (const s of sentences.map((x) => x.trim())) {
    const next = out ? `${out} ${s}` : s;
    if (next.length > MAX) break;
    out = next;
    if (out.length >= MIN && !/:$/.test(out)) {
      if (balanced(out)) best = out;
    }
  }
  if (best) return best;
  return smartTruncate(text, MAX);
}
