// Sözlük (omurga-sozlugu) ↔ MR (mr-analiz) çapraz link eşlemesi üretir.
// Aynı terim iki bölümde de varsa, kullanıcıyı ve crawler'ı iki sayfa arasında bağlar
// → kalış süresi + iki yüksek-gösterimli bölüm arası otorite akışı. Tıbbi metin DEĞİŞMEZ.
// Çıktı: src/app/data/crossLinks.json  { glossaryToMr: {<glossarySlug>:<mrSlug>}, mrToGlossary: {<mrSlug>:<glossarySlug>} }
// Eşleşme: normalize edilmiş terim adı (birebir). Deterministik; başarısızsa exit(1).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const gloss = JSON.parse(readFileSync(join(ROOT, 'src/app/data/spineGlossary.json'), 'utf8')).master;
const mr = JSON.parse(readFileSync(join(ROOT, 'mr-terimleri-iceaktarim.json'), 'utf8'));

const TR = { 'ç':'c','ğ':'g','ı':'i','İ':'i','ö':'o','ş':'s','ü':'u','â':'a','î':'i','û':'u','Ç':'c','Ğ':'g','Ö':'o','Ş':'s','Ü':'u' };
const slugify = (s) => String(s || '').split('').map((c) => TR[c] ?? c).join('')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');
const norm = (s) => String(s || '').toLocaleLowerCase('tr-TR').trim();

// MR: ilk-kayıt kuralı (prerender-mr ile aynı)
const mrBySlug = new Map();
for (const t of mr) { const s = slugify(t?.term); if (s && !mrBySlug.has(s)) mrBySlug.set(s, t); }
const mrSlugByName = new Map();
for (const [s, t] of mrBySlug) { const n = norm(t.term); if (!mrSlugByName.has(n)) mrSlugByName.set(n, s); }

const glossaryToMr = {};
const mrToGlossary = {};
const errors = [];
for (const g of gloss) {
  const mrSlug = mrSlugByName.get(norm(g.term));
  if (!mrSlug) continue;
  if (!g.slug) { errors.push(`glossary slug yok: ${g.term}`); continue; }
  glossaryToMr[g.slug] = mrSlug;
  // Ters yön: aynı MR slug birden fazla glossary'e denk gelmesin (ilk kazanır, deterministik sıra)
  if (!(mrSlug in mrToGlossary)) mrToGlossary[mrSlug] = g.slug;
}

const pairCount = Object.keys(glossaryToMr).length;
if (pairCount < 100) errors.push(`beklenenden az eşleşme: ${pairCount} (<100)`);
// hedefler gerçek mi
const glossSlugs = new Set(gloss.map((g) => g.slug));
for (const [gs, ms] of Object.entries(glossaryToMr)) {
  if (!glossSlugs.has(gs)) errors.push(`glossary slug geçersiz: ${gs}`);
  if (!mrBySlug.has(ms)) errors.push(`mr slug geçersiz: ${ms}`);
}

if (errors.length) {
  console.error('[cross-links] BAŞARISIZ:\n - ' + errors.join('\n - '));
  process.exit(1);
}

const out = { generatedBy: 'scripts/generate-cross-links.mjs', pairs: pairCount, glossaryToMr, mrToGlossary };
writeFileSync(join(ROOT, 'src/app/data/crossLinks.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`[cross-links] OK — ${pairCount} sözlük↔MR eşleşmesi -> src/app/data/crossLinks.json`);
