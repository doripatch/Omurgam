import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, BookOpen, CheckCircle2, ExternalLink, Search, Stethoscope, XCircle } from 'lucide-react';
import Seo from '../components/Seo';
import glossaryData from '../data/spineGlossary.json';

type SpineTerm = (typeof glossaryData.master)[number];

const ORIGIN = 'https://omurgam.com';
const BASE = '/omurga-sozlugu';
const collator = new Intl.Collator('tr');
const normalize = (value: string) => value.toLocaleLowerCase('tr-TR').trim();
const splitItems = (value: string) => value.split('·').map((item) => item.trim()).filter(Boolean);

const terms = [...glossaryData.master].sort((a, b) => collator.compare(a.term, b.term));
const bySlug = new Map(terms.map((term) => [term.slug, term]));
const byName = new Map(terms.map((term) => [normalize(term.term), term]));
const aliasByTarget = new Map<string, string[]>();
for (const alias of glossaryData.aliases) {
  const values = aliasByTarget.get(alias.targetTerm) || [];
  values.push(alias.alias);
  aliasByTarget.set(alias.targetTerm, values);
}

function relatedTerm(value: string) {
  const canonical = byName.get(normalize(value));
  if (canonical) return canonical;
  const alias = glossaryData.aliases.find((item) => normalize(item.alias) === normalize(value));
  return alias ? byName.get(normalize(alias.targetTerm)) : undefined;
}

function Disclaimer() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
      <strong>Önemli:</strong> Bu sözlük bilgilendirme amaçlıdır; tanı, muayene veya tedavi önerisi yerine geçmez. Bulgularınızı sizi değerlendiren sağlık profesyoneliyle birlikte yorumlayın.
    </div>
  );
}

function TermDetail({ term }: { term: SpineTerm }) {
  const aliases = aliasByTarget.get(term.term) || [];
  const related = splitItems(term.relatedTerms);
  const [wrong, right] = term.trueFalse.split('|').map((item) => item.trim());
  const canonicalUrl = `${ORIGIN}${BASE}/${term.slug}`;
  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTerm',
        '@id': `${canonicalUrl}#term`,
        name: term.term,
        description: term.definition,
        url: canonicalUrl,
        inDefinedTermSet: { '@id': `${ORIGIN}${BASE}#termset` },
        ...(term.english ? { alternateName: [term.english, ...aliases] } : { alternateName: aliases }),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: ORIGIN },
          { '@type': 'ListItem', position: 2, name: 'Omurga Sözlüğü', item: `${ORIGIN}${BASE}` },
          { '@type': 'ListItem', position: 3, name: term.term, item: canonicalUrl },
        ],
      },
    ],
  }), [aliases, canonicalUrl, term]);

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-slate-950">
      <Seo
        title={`${term.term} Nedir?`}
        description={`${term.term}: ${term.definition}`.slice(0, 160)}
        type="article"
        jsonLd={jsonLd}
      />
      <div className="border-b border-slate-200 bg-gradient-to-br from-slate-900 via-amber-950 to-orange-950 px-4 py-12 text-white dark:border-slate-800">
        <div className="mx-auto max-w-4xl">
          <Link to={BASE} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-200 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Omurga Sözlüğü
          </Link>
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-amber-300">{term.category}</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">{term.term} nedir?</h1>
          {term.english && <p className="mt-4 text-lg text-slate-300">{term.english}</p>}
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 px-4 py-10 md:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Kısa ve doğrudan açıklama</h2>
          <p className="text-lg leading-8 text-slate-700 dark:text-slate-200">{term.definition}</p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white"><BookOpen className="h-5 w-5 text-amber-600" /> Hasta bunu nasıl duyabilir?</h2>
          <div className="flex flex-wrap gap-2">
            {[...splitItems(term.patientLanguage), ...aliases].map((item) => <span key={item} className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{item}</span>)}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white"><Stethoscope className="h-5 w-5 text-amber-600" /> Klinik not</h2>
          <p className="leading-7 text-slate-700 dark:text-slate-200">{term.clinicalNote}</p>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/20">
            <h2 className="mb-2 flex items-center gap-2 font-bold text-red-900 dark:text-red-200"><XCircle className="h-5 w-5" /> Sık karıştırılan</h2>
            <p className="leading-6 text-red-900/80 dark:text-red-100/80">{wrong?.replace(/^❌\s*/, '')}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <h2 className="mb-2 flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200"><CheckCircle2 className="h-5 w-5" /> Doğrusu</h2>
            <p className="leading-6 text-emerald-900/80 dark:text-emerald-100/80">{right?.replace(/^✅\s*/, '')}</p>
          </div>
        </section>

        {related.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">İlgili terimler</h2>
            <div className="flex flex-wrap gap-2">
              {related.map((item) => {
                const target = relatedTerm(item);
                return target
                  ? <Link key={item} to={`${BASE}/${target.slug}`} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">{item}</Link>
                  : <span key={item} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">{item}</span>;
              })}
            </div>
          </section>
        )}

        <Disclaimer />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Editoryal kaynak: <a href={term.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 font-semibold text-amber-700 hover:underline dark:text-amber-300">Kaynağı görüntüle <ExternalLink className="h-3.5 w-3.5" /></a>
        </p>
      </div>
    </main>
  );
}

function GlossaryIndex() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tümü');
  const categories = useMemo(() => ['Tümü', ...Array.from(new Set(terms.map((term) => term.category))).sort(collator.compare)], []);
  const filtered = useMemo(() => {
    const needle = normalize(query);
    return terms.filter((term) => {
      if (category !== 'Tümü' && term.category !== category) return false;
      if (!needle) return true;
      const aliases = aliasByTarget.get(term.term) || [];
      return normalize([term.term, term.english, term.patientLanguage, term.definition, ...aliases].join(' ')).includes(needle);
    });
  }, [category, query]);
  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${ORIGIN}${BASE}#termset`,
    name: 'Omurgam Omurga Sözlüğü',
    description: 'Omurga, disk, sinir, skolyoz, görüntüleme ve tedavi terimlerinin sade Türkçe açıklamaları.',
    url: `${ORIGIN}${BASE}`,
  }), []);

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-slate-950">
      <Seo title="Omurga Sözlüğü — Omurga ve MR Terimleri" description="Omurga, disk, sinir, skolyoz, MR bulguları ve tedavi terimlerini hasta dilinde açıklayan 188 maddelik Omurgam Omurga Sözlüğü." jsonLd={jsonLd} />
      <div className="bg-gradient-to-br from-slate-900 via-amber-950 to-orange-950 px-4 py-14 text-white md:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-amber-300">188 editoryal terim</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">Omurga Sözlüğü</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-200">MR raporunda veya doktor görüşmesinde karşılaştığınız omurga terimlerini sade Türkçeyle anlayın.</p>
          <div className="relative mx-auto mt-8 max-w-3xl">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Terim, İngilizce karşılık veya hasta dilindeki ifadeyle ara…" className="w-full rounded-2xl bg-white py-4 pl-14 pr-5 text-slate-900 shadow-xl outline-none ring-amber-400 focus:ring-4" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <Disclaimer />
        <div className="mt-8 flex gap-2 overflow-x-auto pb-3">
          {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${category === item ? 'bg-amber-700 text-white' : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'}`}>{item}</button>)}
        </div>
        <p className="my-5 text-sm font-semibold text-slate-500 dark:text-slate-400">{filtered.length} terim gösteriliyor</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((term) => (
            <Link key={term.slug} to={`${BASE}/${term.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">{term.category}</p>
              <h2 className="text-xl font-bold text-slate-900 group-hover:text-amber-700 dark:text-white">{term.term}</h2>
              <p className="mt-3 line-clamp-3 leading-6 text-slate-600 dark:text-slate-300">{term.definition}</p>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && <div className="py-20 text-center text-slate-600 dark:text-slate-300"><BookOpen className="mx-auto mb-4 h-10 w-10" /><p>Bu aramayla eşleşen terim bulunamadı.</p></div>}
      </div>
    </main>
  );
}

export default function SpineGlossary() {
  const { slug } = useParams();
  if (!slug) return <GlossaryIndex />;
  const term = bySlug.get(slug);
  if (term) return <TermDetail term={term} />;
  return (
    <main className="mx-auto min-h-[60vh] max-w-3xl px-4 py-20 text-center">
      <Seo title="Terim bulunamadı" description="Aradığınız omurga sözlüğü maddesi bulunamadı." />
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Terim bulunamadı</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300">Aradığınız madde taşınmış veya adres yanlış yazılmış olabilir.</p>
      <Link to={BASE} className="mt-7 inline-flex rounded-full bg-amber-700 px-5 py-3 font-semibold text-white">Sözlüğe dön</Link>
    </main>
  );
}
