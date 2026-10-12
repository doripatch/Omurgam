// Editör/uzman kimliği (E-E-A-T): Prof. Dr. Defne Kaya Utlu'nun doğrulanabilir akademik profilleri.
// ORCID kullanıcı tarafından teyit edildi (2026-10-12); Scopus ve Wikidata kayıtları aynı ORCID'i taşıyor.
// Google Akademik ve YouTube kanalı kullanıcıdan (2026-10-12), sayfa başlıklarıyla doğrulandı.
// Tek kaynak: index.html JSON-LD (Person.sameAs), Hakkımızda, yazar kutusu ve prerender'lar buradan beslenir.
export const PERSON_ID = 'https://omurgam.com/#defne-kaya-utlu';
export const ORCID_ID = '0000-0003-0552-1190';
export const EXPERT_PROFILES = [
  { label: 'Google Akademik', url: 'https://scholar.google.com/citations?user=EDyE1UIAAAAJ' },
  { label: 'ORCID', url: `https://orcid.org/${ORCID_ID}` },
  { label: 'Scopus', url: 'https://www.scopus.com/authid/detail.uri?authorId=7004487738' },
  { label: 'Wikidata', url: 'https://www.wikidata.org/wiki/Q58269711' },
  { label: 'YouTube', url: 'https://www.youtube.com/@profdrdefnekayautlu' },
];

/** Sağlık içeriği sayfası: editörün kontrol ettiği tıbbi bilgi sayfası (mainEntityOfPage olarak kullanılır). */
export function medicalWebPage(url, lastModified) {
  const day = lastModified ? String(lastModified).slice(0, 10) : '';
  return {
    '@type': 'MedicalWebPage',
    '@id': url,
    url,
    inLanguage: 'tr-TR',
    reviewedBy: { '@id': PERSON_ID },
    ...(/^\d{4}-\d{2}-\d{2}$/.test(day) ? { lastReviewed: day } : {}),
  };
}

/** Görünür tarih (tr-TR, "6 Eylül 2026"); geçersizse boş. */
export function trDate(iso) {
  const d = new Date(iso || '');
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul' });
}
