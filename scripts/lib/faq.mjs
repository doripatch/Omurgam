// Sıkça Sorulan Sorular — tek kaynak (anasayfa alt bölümü + /sorular sayfası + dist/faq-data.json + FAQPage JSON-LD).
// Sağlık soruları Omurga Sözlüğü tanımıyla AYNEN cevaplanır (yeni tıbbi metin yazılmaz); soru cümleleri insanların
// aradığı biçimdedir. "Omurgam hakkında" cevapları kurum bilgisidir (yayından önce Dorukhan/Hoca onayı).
const clean = (s) => String(s ?? '').replace(/^[\s❌✅]+/u, '').replace(/\s+/g, ' ').trim();

const PLATFORM = [
  { id: 'omurgam-nedir', q: 'Omurgam nedir?', a: 'Omurgam, Prof. Dr. Defne Kaya Utlu editörlüğünde hazırlanan Türkçe omurga sağlığı platformudur. Yazılar, videolar ve Omurga Sözlüğü ile omurga sağlığını sade ve bilimsel bir dille anlatır.', link: { label: 'Hakkımızda', to: '/hakkimizda' }, home: true },
  { id: 'icerikleri-kim-hazirliyor', q: "Omurgam'daki içerikleri kim hazırlıyor?", a: "İçerikler Prof. Dr. Defne Kaya Utlu editörlüğünde hazırlanır.", link: { label: 'Prof. Dr. Defne Kaya Utlu', to: '/hakkimizda' } },
  { id: 'muayene-yerine-gecer-mi', q: 'Buradaki bilgiler muayenenin yerine geçer mi?', a: 'Hayır. Omurgam’daki içerikler bilgilendirme amaçlıdır; tanı ve tedavi için bir hekime başvurun.', home: true },
  { id: 'uzmana-soru', q: 'Uzmana nasıl soru sorabilirim?', a: 'Uzmana Soru Sor sayfasından sorunuzu iletebilirsiniz. Randevu sayfasından da danışma talebi oluşturabilirsiniz.', link: { label: 'Uzmana soru sor', to: '/soru-sor' }, home: true },
];

// [kategori, soru, sözlük slug'ı, anasayfada mı]
const TERMS = [
  ['Bel', 'Bel ağrısı nedir?', 'bel-agrisi'],
  ['Bel', 'Bel fıtığı nedir?', 'lomber-disk-hernisi', true],
  ['Bel', 'Siyatik nedir?', 'siyatik', true],
  ['Bel', 'Bel kayması (spondilolistezis) nedir?', 'spondilolistezis'],
  ['Bel', 'Bel kanal darlığı nedir?', 'lomber-spinal-stenoz'],
  ['Bel', 'Kauda ekuina sendromu nedir?', 'kauda-ekuina-sendromu'],
  ['Boyun', 'Boyun ağrısı nedir?', 'boyun-agrisi'],
  ['Boyun', 'Boyun fıtığı nedir?', 'servikal-disk-hernisi', true],
  ['Boyun', 'Servikal miyelopati nedir?', 'servikal-miyelopati'],
  ['MR raporu', 'MR raporumda "disk protrüzyonu" yazıyor, ne demek?', 'disk-protruzyonu'],
  ['MR raporu', 'MR raporumda "disk ekstrüzyonu" yazıyor, ne demek?', 'disk-ekstruzyonu'],
  ['MR raporu', 'MR raporumda "bulging" yazıyor, ne demek?', 'disk-bulgingi'],
  ['MR raporu', 'MR raporumda "disk desikasyonu" yazıyor, ne demek?', 'disk-desikasyonu'],
  ['MR raporu', 'MR raporumda "lordozda düzleşme" yazıyor, ne demek?', 'lordozda-duzlesme', true],
  ['MR raporu', 'MR raporumda "Modic değişiklikleri" yazıyor, ne demek?', 'modic-degisiklikleri'],
  ['MR raporu', 'MR raporumda "Schmorl nodülü" yazıyor, ne demek?', 'schmorl-nodulu'],
  ['MR raporu', 'MR raporumda "osteofit" yazıyor, ne demek?', 'osteofit'],
  ['MR raporu', 'MR raporumda "annüler fissür" yazıyor, ne demek?', 'annuler-fissur'],
  ['MR raporu', 'MR raporumda "sinir kökü basısı" yazıyor, ne demek?', 'sinir-koku-basisi'],
  ['Duruş ve omurga', 'Skolyoz nedir?', 'skolyoz', true],
  ['Duruş ve omurga', 'Kifoz (kamburluk) nedir?', 'kifoz'],
  ['Duruş ve omurga', 'Postür (duruş) nedir?', 'postur'],
  ['Duruş ve omurga', 'Sakralizasyon nedir?', 'sakralizasyon', true],
  ['Duruş ve omurga', 'Kuyruk sokumu (koksiks) nedir?', 'koksiks'],
  ['Duruş ve omurga', 'Osteoporoz nedir?', 'osteoporoz'],
  ['Duruş ve omurga', 'Ankilozan spondilit nedir?', 'ankilozan-spondilit'],
];

export const FAQ_CATEGORIES = ['Omurgam hakkında', 'Bel', 'Boyun', 'MR raporu', 'Duruş ve omurga'];

/** @returns {{id:string,cat:string,q:string,a:string,link?:{label:string,to:string},home?:boolean}[]} */
export function buildFaq(glossaryMaster, die) {
  const bySlug = new Map(glossaryMaster.map((t) => [t.slug, t]));
  const items = PLATFORM.map((p) => ({ cat: 'Omurgam hakkında', ...p }));
  for (const [cat, q, slug, home] of TERMS) {
    const g = bySlug.get(slug);
    if (!g || !g.definition) die(`SSS: sözlükte ${slug} yok`);
    items.push({ id: slug, cat, q, a: clean(g.definition), link: { label: `${clean(g.term)} hakkında daha fazlası`, to: `/omurga-sozlugu/${slug}/` }, ...(home ? { home: true } : {}) });
  }
  if (new Set(items.map((i) => i.id)).size !== items.length) die('SSS: tekrar eden id');
  return items;
}

/** FAQPage JSON-LD (metin sayfada görünenle birebir aynı). */
export const faqJsonLd = (items, url) => ({
  '@type': 'FAQPage',
  ...(url ? { '@id': `${url}#sss`, url } : {}),
  inLanguage: 'tr-TR',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});
