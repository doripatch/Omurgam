import { POLICY_CONTENT } from './policyContent';

// Politika sayfası meta açıklaması: metnin ilk düz paragraflarından, tam cümlelerle ≤155 karakter.
// Hem React (PolicyView) hem prerender (scripts/prerender-pages.mjs) bunu kullanır — ham HTML ile hidrasyon aynı kalır.
const MAX = 155;
const SKIP_RE = /^(Belge No|Yürürlük Tarihi|Son Güncelleme|Versiyon)\s*:|^\d+\./;

export function policyDescription(slug: string, title: string): string {
  const body = POLICY_CONTENT[slug];
  if (!body) return `Omurgam — ${title}`;
  const sentences = body
    .split('\n')
    .map((l) => l.trim())
    .filter((t) => t && !SKIP_RE.test(t))
    .slice(0, 3)
    .join(' ')
    .match(/[^]*?[.!?](?=\s|$)/g) || [];
  let out = '';
  for (const s of sentences.map((x) => x.trim())) {
    const next = out ? `${out} ${s}` : s;
    if (next.length > MAX) break;
    out = next;
  }
  if (!out && sentences[0]) {
    const cut = sentences[0].slice(0, MAX - 1);
    out = cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:\s]+$/, '') + '…';
  }
  return out || `Omurgam — ${title}`;
}
