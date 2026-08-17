import { useEffect } from 'react';

// Sayfa başına başlık / meta / Open Graph / canonical / yapısal veri (JSON-LD)
// ayarlayan hafif bir bileşen. Hiçbir şey render etmez (null döner).
// Not: Google JS çalıştırdığı için bu etiketleri görür. Sosyal medya
// önizlemeleri (WhatsApp vb.) için tam destek ileride prerender ile gelir.

const SITE = 'Omurgam';
const ORIGIN = 'https://omurgam.com';
const DEFAULT_IMAGE = `${ORIGIN}/assets/logo-og.png`;

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  jsonLd?: Record<string, any> | null;
  canonical?: string;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function Seo({ title, description, image, type = 'website', jsonLd, canonical }: SeoProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : `${SITE} — Türkiye'nin Omurga Sağlığı Platformu`;
    document.title = fullTitle;

    // canonical verilirse onu kullan (kilitli newUrl); yoksa mevcut adres.
    const url = canonical || window.location.href;
    const img = image || DEFAULT_IMAGE;

    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
      upsertMeta('name', 'twitter:description', description);
    }
    upsertMeta('property', 'og:title', title || SITE);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', img);
    upsertMeta('name', 'twitter:title', title || SITE);
    upsertMeta('name', 'twitter:image', img);

    // Canonical
    let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);

    // JSON-LD yapısal veri
    const id = 'seo-jsonld';
    const existing = document.getElementById(id);
    if (jsonLd) {
      const script = (existing as HTMLScriptElement) || document.createElement('script');
      script.id = id;
      script.setAttribute('type', 'application/ld+json');
      script.textContent = JSON.stringify(jsonLd);
      if (!existing) document.head.appendChild(script);
    } else if (existing) {
      existing.remove();
    }
  }, [title, description, image, type, jsonLd, canonical]);

  return null;
}
