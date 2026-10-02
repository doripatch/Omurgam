// Ortak sözlük SEO yardımcıları (JSX YOK) — SpineGlossary.tsx (React) ve
// prerender-glossary.mjs (Node) AYNI title/description/FAQ üretir → ayrışma olmaz.
// İçerik ASLA uydurulmaz; yalnız mevcut alanlardan (definition, patientLanguage,
// trueFalse) türetilir. Amaç: SERP'te tam cümle meta + FAQ zengin sonucu ile TO artışı.

const splitItems = (v) => String(v ?? '').split('·').map((x) => x.trim()).filter(Boolean);
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

// Genel: ≤max krk, kelime ORTASINDA kesmez; kırpıldıysa '…' ile biter.
export function smartTruncate(text, max = 155) {
  const s = clean(text);
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const sp = cut.lastIndexOf(' ');
  return (sp > Math.floor(max / 2) ? cut.slice(0, sp) : cut).replace(/[.,;:!?\-–—\s]+$/, '') + '…';
}

// Genel FAQPage şeması ([{q,a}] -> JSON-LD). Boşsa null.
export function faqPageJsonLd(faq) {
  if (!Array.isArray(faq) || !faq.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

// Başlık: "Nedir?" (arama niyetiyle eşleşir, Google kalınlaştırır) + iki DOĞRU
// farklılaştırıcı (her terimde definition=anlamı ve clinicalNote=klinik önemi var).
// React <Seo> " | Omurgam" ekini kendisi ekler; ona glossaryTitleBase verilir.
export function glossaryTitleBase(term) {
  return `${term.term} Nedir? Anlamı ve Klinik Önemi`;
}
export function glossaryTitle(term) {
  return `${glossaryTitleBase(term)} | Omurgam`;
}

// Meta description: kaynaktan; ≤155 krk; kelime ORTASINDA kesmez, tam sözcükte biter.
export function glossaryDescription(term) {
  return smartTruncate(`${term.term} nedir? ${term.definition}`, 155);
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
  return faqPageJsonLd(glossaryFaq(term));
}
