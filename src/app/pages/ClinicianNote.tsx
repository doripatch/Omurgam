// Faz 1 — Klinisyen notu detayı: /klinisyenler/:slug
// slug -> ID (merkezi harita) -> mevcut clinical-notes API'sinden kayıt (getById yok; getAll + find).
// Klinisyen indeksi (/klinisyenler) bu fazda yeniden tasarlanmaz; yalnızca detay eklenir.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Clock, Stethoscope } from 'lucide-react';
import { clinNotesAPI } from '../lib/api';
import Seo from '../components/Seo';
import NoteContent from '../components/NoteContent';
import { ORIGIN, FAMILY_META, clinicianIdBySlug, recordById } from '../lib/urlMigration';

interface ClinNote {
  id: string;
  title: string;
  content: string;
  category?: string;
  readingTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

// İçerikten güvenli düz-metin özet (markdown/HTML işaretlerini ayıklar).
function plainSummary(content?: string, max = 155): string {
  if (!content) return 'Klinisyenlere yönelik klinik değerlendirme notu.';
  const txt = content
    .replace(/<[^>]+>/g, ' ')          // HTML etiketleri
    .replace(/[#*_>`~\-]+/g, ' ')       // markdown işaretleri
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (txt.length <= max) return txt;
  const cut = txt.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

function NotFound() {
  return (
    <div className="w-full min-h-[60vh] flex items-center">
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <Seo title="İçerik bulunamadı" description="Aradığınız klinisyen notu taşınmış veya adres yanlış yazılmış olabilir." />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">İçerik bulunamadı</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-7">Aradığınız klinisyen notu taşınmış veya adres yanlış yazılmış olabilir.</p>
        <Link to="/klinisyenler" className="inline-flex rounded-full bg-amber-700 px-5 py-3 font-semibold text-white">Klinisyenlere Notlar'a dön</Link>
      </div>
    </div>
  );
}

export default function ClinicianNote() {
  const { slug } = useParams();
  const id = clinicianIdBySlug(slug);
  const rec = recordById(id);

  const [note, setNote] = useState<ClinNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) { setIsLoading(false); return; }
    let active = true;
    (async () => {
      try {
        setIsLoading(true);
        const data = await clinNotesAPI.getAll(); // clinical-notes GET (getById yok)
        const found = (data?.notes || []).find((n: ClinNote) => n.id === id) || null;
        if (active) setNote(found);
      } catch {
        if (active) setNote(null);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  if (!id || !rec) return <NotFound />;

  const meta = FAMILY_META.klinisyenler;
  const canonical = `${ORIGIN}${rec.newUrl}`;
  const formatDate = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const jsonLd = note ? {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: note.title,
        description: plainSummary(note.content),
        articleSection: note.category || 'Klinik Değerlendirme',
        inLanguage: 'tr-TR',
        datePublished: note.createdAt,
        dateModified: note.updatedAt || note.createdAt,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        author: { '@id': `${ORIGIN}/#defne-kaya-utlu` },
        publisher: { '@id': `${ORIGIN}/#org` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: meta.name, item: `${ORIGIN}${meta.base}` },
          { '@type': 'ListItem', position: 3, name: note.title, item: canonical },
        ],
      },
    ],
  } : null;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-teal-50/20 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
      <Seo
        title={note?.title || meta.name}
        description={plainSummary(note?.content)}
        type="article"
        canonical={canonical}
        jsonLd={jsonLd}
      />
      <div className="max-w-3xl mx-auto">
        <Link to="/klinisyenler" className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 dark:text-teal-300 mb-8">
          <ArrowLeft className="w-4 h-4" /> {meta.name}
        </Link>

        <article className="backdrop-blur-xl bg-white/90 border border-teal-200/40 rounded-3xl p-8 md:p-12 dark:bg-slate-900/80 dark:border-slate-700">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-300">İçerik yükleniyor...</p>
            </div>
          ) : note ? (
            <>
              <div className="flex items-center gap-2 mb-4 text-teal-700 dark:text-teal-300">
                <Stethoscope className="w-4 h-4" />
                <span className="px-3 py-1 bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 text-sm font-semibold rounded-full">{note.category || 'Klinik Değerlendirme'}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">{note.title}</h1>
              <div className="flex items-center gap-6 text-slate-600 dark:text-slate-300 mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
                {note.createdAt && <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span className="text-sm">{formatDate(note.createdAt)}</span></div>}
                {note.readingTime && <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300"><Clock className="w-4 h-4" /><span className="text-sm font-medium">{note.readingTime} okuma</span></div>}
              </div>
              <div className="max-w-none text-base">
                <NoteContent text={note.content} />
              </div>
            </>
          ) : (
            <div className="text-center py-12"><p className="text-slate-600 dark:text-slate-300">Not bulunamadı</p></div>
          )}
        </article>
      </div>
    </div>
  );
}
