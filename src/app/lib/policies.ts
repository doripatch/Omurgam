// Kurumsal Politikalar — başlık + (varsa) içerik.
// İçerikler Defne Hoca ve hukuk danışmanı tarafından hazırlanınca `body` alanına eklenecek.
// `body` boşken sayfa "hazırlanıyor" placeholder'ı gösterir.
// Kullanım Koşulları ve Gizlilik Politikası kendi sayfalarında olduğu için burada yok.

export interface Policy {
  slug: string;
  title: string;
  body?: string;
}

export const POLICIES: Policy[] = [
  { slug: 'cerez-politikasi', title: 'Çerez Politikası' },
  { slug: 'telif-haklari', title: 'Telif Hakları ve İçerik Kullanım İlkeleri' },
  { slug: 'editoryal-ilkeler', title: 'Editöryal İlkeler' },
  { slug: 'bilimsel-kaynak-guncelleme', title: 'Bilimsel Kaynak ve Güncelleme Politikası' },
  { slug: 'reklam-editoryal-bagimsizlik', title: 'Reklam ve Editöryal Bağımsızlık İlkesi' },
  { slug: 'yapay-zeka-icerik', title: 'Yapay Zekâ ve İçerik Kullanım Politikası' },
  { slug: 'kaynak-atif', title: 'Kaynak Gösterme ve Atıf İlkeleri' },
  { slug: 'duzeltme-geri-bildirim', title: 'Düzeltme ve Geri Bildirim Politikası' },
  { slug: 'erisilebilirlik', title: 'Erişilebilirlik Bildirimi' },
  { slug: 'icerik-kaldirma-ihlal', title: 'İçerik Kaldırma ve İhlal Bildirim Politikası' },
];

export function getPolicy(slug?: string): Policy | undefined {
  return POLICIES.find((p) => p.slug === slug);
}
