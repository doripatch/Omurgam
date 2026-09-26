// Ortak sözlük SEO yardımcıları (JSX YOK) — SpineGlossary.tsx (React) ve
// prerender-glossary.mjs (Node) AYNI title/description/FAQ üretir → ayrışma olmaz.
// İçerik ASLA uydurulmaz; yalnız mevcut alanlardan (definition, patientLanguage,
// trueFalse) türetilir. Amaç: SERP'te tam cümle meta + FAQ zengin sonucu ile TO artışı.

const splitItems = (v) => String(v ?? '').split('·').map((x) => x.trim()).filter(Boolean);
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

// Başlık: "Nedir?" (arama niyetiyle eşleşir, Google kalınlaştırır) + iki DOĞRU
// farklılaştırıcı (her terimde definition=anlamı ve clinicalNote=klinik önemi var).
export function glossaryTitle(term) {
  return `${term.term} Nedir? Anlamı ve Klinik Önemi | Omurgam`;
}

// Meta description: kaynaktan; ≤155 krk; kelime ORTASINDA kesmez, tam sözcükte biter.
export function glossaryDescription(term) {
  const base = clean(`${term.term} nedir? ${term.definition}`);
  if (base.length <= 155) return base;
  const cut = base.slice(0, 152);
  const sp = cut.lastIndexOf(' ');
  return (sp > 80 ? cut.slice(0, sp) : cut).replace(/[.,;:!?\-–—\s]+$/, '') + '…';
}

// FAQ: yalnız DOLU alanlardan; tıbbi ifade/soru uydurulmaz. Sayfada da GÖRÜNÜR
// olarak render edilir (FAQPage şeması görünür içerik gerektirir).
export function glossaryFaq(term) {
  const faq = [];
  const def = clean(term.definition);
  if (def) faq.push({ q: `${term.term} nedir?`, a: def });
  const patient = splitItems(term.patientLanguage);
  if (patient.length) faq.push({ q: `${term.term} halk arasında nasıl ifade edilir?`, a: patient.join(', ') + '.' });
  const [wrong, right] = String(term.trueFalse ?? '').split('|').map((x) => clean(x).replace(/^[❌✅]\s*/, ''));
  if (wrong && right) faq.push({ q: `${term.term} hakkında sık yapılan yanlış nedir?`, a: `Sık karıştırılan: ${wrong} Doğrusu: ${right}` });
  return faq;
}

export function glossaryFaqJsonLd(term) {
  const faq = glossaryFaq(term);
  if (!faq.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
