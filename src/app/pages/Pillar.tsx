import { Fragment } from 'react';
import { useLocation, Link } from 'react-router';
import { CheckCircle2, ArrowRight, BookOpen, HelpCircle } from 'lucide-react';
import Seo from '../components/Seo';
import AuthorBox from '../components/AuthorBox';
import { PILLARS, type PillarInlineLink } from '../data/pillars';

const ORIGIN = 'https://omurgam.com';

// Yalnızca pillars.ts'te AÇIKÇA tanımlanmış (section+paragraph+anchor) konumları
// güvenli React <Link>'lere çevirir. Metin sözcükleri hiç değişmez.
// Anchor paragrafta tam olarak bir kez bulunmuyorsa: DEV'de uyarı + düz metin korunur.
function renderInline(
  text: string,
  links: PillarInlineLink[] | undefined,
  section: number,
  paragraph: number,
) {
  const applicable = (links || []).filter((l) => l.section === section && l.paragraph === paragraph);
  if (applicable.length === 0) return text;

  const valid: Array<PillarInlineLink & { index: number }> = [];
  for (const link of applicable) {
    const first = text.indexOf(link.anchor);
    const last = text.lastIndexOf(link.anchor);
    if (first === -1 || first !== last) {
      if (import.meta.env.DEV) {
        console.warn(
          `[Pillar] "${link.anchor}" (section ${section}, paragraph ${paragraph}) paragrafta tam 1 kez bulunamadı; düz metin korunuyor.`,
        );
      }
      continue;
    }
    valid.push({ ...link, index: first });
  }
  if (valid.length === 0) return text;

  valid.sort((a, b) => a.index - b.index);
  const nodes: Array<string | JSX.Element> = [];
  let cursor = 0;
  let key = 0;
  for (const link of valid) {
    if (link.index < cursor) {
      if (import.meta.env.DEV) console.warn(`[Pillar] "${link.anchor}" çakışan bağlantı; atlanıyor.`);
      continue;
    }
    if (link.index > cursor) nodes.push(<Fragment key={key++}>{text.slice(cursor, link.index)}</Fragment>);
    nodes.push(
      <Link key={key++} to={link.to} className="text-teal-700 dark:text-teal-300 font-medium hover:underline">
        {link.anchor}
      </Link>,
    );
    cursor = link.index + link.anchor.length;
  }
  if (cursor < text.length) nodes.push(<Fragment key={key++}>{text.slice(cursor)}</Fragment>);
  return nodes;
}

export default function Pillar() {
  const location = useLocation();
  const slug = location.pathname.replace(/^\/+/, '').split('/')[0];
  const data = PILLARS[slug];

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Sayfa bulunamadı</h1>
        <Link to="/" className="text-teal-600 hover:underline">Ana sayfaya dön</Link>
      </div>
    );
  }

  const url = `${ORIGIN}/${data.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalWebPage',
        '@id': `${url}#webpage`,
        url,
        name: data.metaTitle,
        description: data.metaDescription,
        inLanguage: 'tr-TR',
        about: { '@type': 'MedicalCondition', name: data.keyword },
        author: {
          '@id': `${ORIGIN}/#defne-kaya-utlu`,
        },
        publisher: { '@id': `${ORIGIN}/#org` },
        // Yalnızca GERÇEK inceleme verisi varsa üretilir (uydurma yok).
        ...(data.reviewDate ? { lastReviewed: data.reviewDate } : {}),
        ...(data.reviewedBy ? { reviewedBy: { '@type': 'Person', name: data.reviewedBy } } : {}),
        ...(data.sources && data.sources.length > 0 ? {
          citation: data.sources.map((s) =>
            s.url ? { '@type': 'CreativeWork', name: s.label, url: s.url } : { '@type': 'CreativeWork', name: s.label }
          ),
        } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: ORIGIN },
          { '@type': 'ListItem', position: 2, name: data.keyword, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: data.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-teal-50/20 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Seo title={data.metaTitle} description={data.metaDescription} type="article" jsonLd={jsonLd} />

      <article className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 dark:text-slate-400 mb-4" aria-label="breadcrumb">
          <Link to="/" className="hover:underline">Ana Sayfa</Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-700 dark:text-slate-300">{data.keyword}</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-5">
          {data.h1}
        </h1>
        <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{data.lead}</p>

        <div className="text-xs text-slate-500 dark:text-slate-400 mb-8">
          Editör: Prof. Dr. Defne Kaya Utlu · Son güncelleme: {data.updated}
          {data.reviewedBy && ` · Tıbben inceleyen: ${data.reviewedBy}${data.reviewDate ? ` (${data.reviewDate})` : ''}`}
        </div>

        {/* İçindekiler */}
        <div className="bg-white/70 dark:bg-slate-800/70 border border-teal-200/40 dark:border-slate-700 rounded-2xl p-5 mb-10">
          <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white font-semibold">
            <BookOpen className="w-4 h-4 text-teal-600" /> İçindekiler
          </div>
          <ul className="space-y-1.5">
            {data.sections.map((s, i) => (
              <li key={i}>
                <a href={`#bolum-${i}`} className="text-sm text-teal-700 dark:text-teal-300 hover:underline">
                  {s.h2}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Bölümler */}
        {data.sections.map((s, i) => (
          <section key={i} id={`bolum-${i}`} className="mb-10 scroll-mt-24">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{s.h2}</h2>
            {s.body?.map((p, j) => (
              <p key={j} className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                {renderInline(p, data.inlineLinks, i, j)}
              </p>
            ))}
            {s.list && (
              <ul className="space-y-2.5 mt-2">
                {s.list.map((item, k) => (
                  <li key={k} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-base text-slate-700 dark:text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* SSS */}
        <section className="mb-10" id="sss">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-teal-600" /> Sık Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {data.faqs.map((f, i) => (
              <div key={i} className="bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{f.q}</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* İlgili bağlantılar */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">İlgili İçerikler</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {data.related.map((r) => (
              <Link
                key={r.to}
                to={r.to}
                className="group flex items-center justify-between gap-2 bg-white/70 dark:bg-slate-800/70 border border-teal-200/40 dark:border-slate-700 rounded-xl px-4 py-3 hover:border-teal-400 transition-colors"
              >
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{r.label}</span>
                <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </section>

        {data.sources && data.sources.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Kaynaklar</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {data.sources.map((s, i) => (
                <li key={i}>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-teal-700 dark:text-teal-300 hover:underline">{s.label}</a>
                  ) : s.label}
                </li>
              ))}
            </ol>
          </section>
        )}

        <AuthorBox updatedDate={data.updated} />
      </article>
    </div>
  );
}
