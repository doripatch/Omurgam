// EMEKLİ (Faz 3): /blog-sitemap.xml artık STATİK `public/blog-sitemap.xml` ile sunulur.
// Bu fonksiyon path sahipliğini BIRAKTI (config.path yok) → /blog-sitemap.xml statik dosyaya düşer.
// Tam temizlik için Mac'te silinmesi önerilir:  git rm netlify/functions/blog-sitemap.mjs
export default async () =>
  new Response('Retired — see static /blog-sitemap.xml', {
    status: 410,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
