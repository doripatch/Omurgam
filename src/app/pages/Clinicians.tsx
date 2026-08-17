// Faz 2 — Klinisyenlere Notlar modern içerik indeksi (akordeon kaldırıldı).
// Arama + sonuç sayısı + responsive kart grid + güvenli kısa özet +
// her kartta /klinisyenler/<slug> React <Link>. Manifest eşleşmesi olmayan kayıt
// linksiz gösterilir + DEV uyarısı. İçerik metni DEĞİŞTİRİLMEZ.
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { Stethoscope, Clock, Search, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { clinNotesAPI } from '../lib/api';
import Seo from '../components/Seo';
import { ORIGIN, newUrlById, recordById } from '../lib/urlMigration';

interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  readingTime?: string;
  createdAt?: string;
}

const norm = (v: string) => (v || '').toLocaleLowerCase('tr-TR');

// İçerikten güvenli kısa düz-metin özet (içerik değiştirilmez, yalnız gösterim).
function summarize(content?: string, max = 160): string {
  if (!content) return 'Klinisyenlere yönelik klinik değerlendirme notu.';
  const txt = content
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#*_>`~]+/g, ' ')
    .replace(/^\s*[-•]\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (txt.length <= max) return txt;
  const cut = txt.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return (sp > 60 ? cut.slice(0, sp) : cut).trim() + '…';
}

export default function Clinicians() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(false);
    clinNotesAPI.getAll()
      .then((d) => { if (active) setNotes(d?.notes || []); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = norm(query).trim();
    if (!q) return notes;
    return notes.filter((n) => norm(n.title).includes(q) || norm(n.category || '').includes(q));
  }, [notes, query]);

  // Kart hedefi: merkezi haritadan /klinisyenler/<slug>. Eşleşme yoksa link verme + DEV uyarısı.
  const hrefFor = (id: string): string | null => {
    const u = newUrlById(id);
    if (!u && import.meta.env.DEV) console.warn(`[Clinicians] "${id}" manifest'te yok — kart linksiz gösteriliyor.`);
    return u || null;
  };

  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: 'Klinisyenlere Notlar',
        description: "Prof. Dr. Defne Kaya Utlu'dan klinisyenlere yönelik klinik değerlendirme ve rehabilitasyon notları.",
        inLanguage: 'tr-TR',
        url: `${ORIGIN}/klinisyenler`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Klinisyenlere Notlar', item: `${ORIGIN}/klinisyenler` },
        ],
      },
      {
        '@type': 'ItemList',
        numberOfItems: notes.filter((n) => recordById(n.id)).length,
        itemListElement: notes
          .map((n, i) => ({ n, url: newUrlById(n.id), i }))
          .filter((x) => !!x.url)
          .map(({ n, url }, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: n.title,
            url: `${ORIGIN}${url}`,
          })),
      },
    ],
  }), [notes]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-teal-50/30 to-emerald-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-16 px-4">
      <Seo
        title="Klinisyenlere Notlar"
        description="Prof. Dr. Defne Kaya Utlu'dan klinisyenlere yönelik klinik değerlendirme ve rehabilitasyon notları — bel ve boyun sorunlarında kanıta dayalı klinik karar."
        canonical={`${ORIGIN}/klinisyenler`}
        jsonLd={jsonLd}
      />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 text-sm font-medium mb-6">
            <Stethoscope className="w-4 h-4" />
            <span>Klinisyenler İçin</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-teal-700 to-emerald-700 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent mb-4">
            Klinisyenlere Notlar
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Prof. Dr. Defne Kaya Utlu'dan, meslektaşlarına yönelik klinik değerlendirme ve rehabilitasyon notları.
          </p>
        </div>

        {/* Arama */}
        <div className="relative max-w-2xl mx-auto mb-6">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Başlık veya kategoriye göre ara…"
            aria-label="Klinisyen notlarında ara"
            className="w-full rounded-2xl bg-white dark:bg-slate-800 py-4 pl-14 pr-5 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700 outline-none focus:ring-4 ring-teal-400/40"
          />
        </div>

        {/* Durumlar */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
            <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-3" />
            <p>Notlar yükleniyor…</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white/80 dark:bg-slate-800/80 border border-red-200/50 dark:border-red-900/40 rounded-3xl p-12">
            <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <p className="text-slate-700 dark:text-slate-200 text-lg">Notlar şu anda yüklenemedi. Lütfen sayfayı yenileyin.</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 bg-white/80 dark:bg-slate-800/80 border border-slate-200/40 dark:border-slate-700 rounded-3xl p-12">
            <Stethoscope className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg">Yakında klinisyenlere yönelik içerikler burada olacak.</p>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-5">
              {filtered.length} not gösteriliyor{query ? ` · "${query}"` : ''}
            </p>
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white/80 dark:bg-slate-800/80 border border-slate-200/40 dark:border-slate-700 rounded-3xl p-12">
                <Search className="w-14 h-14 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sonuç bulunamadı</h3>
                <p className="text-slate-600 dark:text-slate-400">"{query}" ile eşleşen not yok. Farklı bir başlık veya kategori deneyin.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((n) => {
                  const href = hrefFor(n.id);
                  const inner = (
                    <>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {n.category && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-[11px] font-semibold">
                            <Stethoscope className="w-3 h-3" /> {n.category}
                          </span>
                        )}
                        {n.readingTime && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                            <Clock className="w-3 h-3" /> {n.readingTime}
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                        {n.title}
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">{summarize(n.content)}</p>
                      {href && (
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 dark:text-teal-300">
                          Notu oku <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      )}
                    </>
                  );
                  const cls = 'group flex flex-col rounded-3xl bg-white/90 dark:bg-slate-800/80 border border-teal-200/40 dark:border-slate-700 p-6 transition-all';
                  return href ? (
                    <Link key={n.id} to={href} className={`${cls} hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md`}>
                      {inner}
                    </Link>
                  ) : (
                    <div key={n.id} className={cls} aria-disabled="true">
                      {inner}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
