// Yeni anasayfa (2026-10 redesign): kompakt hero + arama + canlı içerik panosu.
// Build'de scripts/prerender-home.mjs bu bileşeni AYNI veriyle HTML'e çizer (index.html); tarayıcıda React
// aynı veriyle (window.__omHome) aynı DOM'u üretir → açılışta sıçrama yok, ilk görüntü JS beklemez (mobil LCP).
// SSR güvenliği: render sırasında window/localStorage/document kullanılmaz; yalnız effect'lerde.
// Tıbbi metin YAZILMAZ: tanımlar ve mitler yalnız sözlük/sağlık sözlüğü verisinden gelir.
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router';
import { Search, ArrowRight, Flame, PlayCircle, BookOpen, MessageCircle, Zap, BedDouble, Heart, Stethoscope, Star, Target, Users, CalendarCheck, CheckCircle2, XCircle, HelpCircle, ChevronDown } from 'lucide-react';
import Seo from '../components/Seo';
import { TABLES } from '../lib/tables';
import SpineMap, { type SpineRegion } from '../components/SpineMap';
import LearnButton from '../components/LearnButton';

export interface HomeData {
  generatedAt: string;
  stats: { posts: number; videos: number; terms: number; views: number };
  mostRead: { title: string; url: string; category: string; views: number }[];
  // En çok okunanlar sekmeleri (konuya göre ilk 4); 'Tümü' = mostRead.
  mostReadTabs?: { key: string; label: string; posts: HomeData['mostRead'] }[];
  videos: { title: string; url: string; thumb: string }[];
  terms: { term: string; slug: string; def: string }[];
  myths: { term: string; wrong: string; right: string }[];
  regions?: SpineRegion[];
  faq?: { q: string; a: string; link?: { label: string; to: string } }[];
}

interface AnsweredQuestion { id: string; question: string; category?: string }

const fmt = (n: number) => n.toLocaleString('tr-TR');
// İstanbul takvim günü: günün terimi / miti her gün değişir (build ve tarayıcı aynı formül).
const dayNumber = (iso?: string) => {
  const d = iso ? new Date(iso) : new Date();
  const ist = new Date(d.getTime() + 3 * 3600 * 1000);
  return Math.floor(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) / 86400000);
};

const CHIPS = [
  { label: 'Bel fıtığı', to: '/bel-fitigi' },
  { label: 'Boyun fıtığı', to: '/boyun-fitigi' },
  { label: 'Skolyoz', to: '/skolyoz' },
  { label: 'Sakralizasyon', to: '/omurga-sozlugu/sakralizasyon/' },
  { label: 'Omurga Sözlüğü', to: '/omurga-sozlugu/' },
];

const EXPLORE = [
  { label: 'Yatak & Yastık', to: '/yatak-yastik-rehberi/', Icon: BedDouble },
  { label: 'Sağlıklı Yaşam', to: '/saglikli-yasam/', Icon: Heart },
  { label: 'Klinisyenlere Notlar', to: '/klinisyenler/', Icon: Stethoscope },
  { label: 'Sizden Gelenler', to: '/forum', Icon: Users },
  { label: 'Sağlık Sözlüğü', to: '/saglik-sozlugu', Icon: BookOpen },
  { label: 'Günün Terimi', to: '/gunun-terimi', Icon: Star },
  { label: 'Mit Avı', to: '/mit-avi', Icon: Target },
  { label: 'Randevu', to: '/randevu', Icon: CalendarCheck },
];

function readInitialData(): HomeData | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  const d = w.__omHome;
  w.__omHome = undefined;
  return d && d.stats ? d : null;
}

export default function HomeV2({ initialData }: { initialData?: HomeData | null }) {
  const location = useLocation();
  const [data, setData] = useState<HomeData | null>(() => initialData ?? readInitialData());
  // Gün seçimi: ilk çizimde verinin üretildiği gün (build HTML'i ile aynı DOM); tarayıcıda bugüne geçilir.
  const [day, setDay] = useState(() => dayNumber(data?.generatedAt));
  const [questions, setQuestions] = useState<AnsweredQuestion[] | null>(null);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');

  useEffect(() => {
    setDay(dayNumber());
    // İstemci içi gezinmede gömülü veri yok: build'in yazdığı /home-data.json'dan al.
    if (!data) {
      fetch('/home-data.json').then((r) => (r.ok ? r.json() : null)).then((d) => d && d.stats && setData(d)).catch(() => {});
    }
    // Son cevaplanan sorular: gerçek soru tablosundan (Supabase istemcisi ilk çizimden sonra yüklenir).
    (async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        const { data: rows } = await supabase
          .from(TABLES.QUESTIONS)
          .select('id, question, category')
          .eq('is_answered', true)
          .order('created_at', { ascending: false })
          .limit(3);
        setQuestions((rows || []) as AnsweredQuestion[]);
      } catch {
        setQuestions([]);
      }
    })();
    // Google site içi arama (SearchAction): /?q=terim → arama penceresi açılır.
    const q = new URLSearchParams(location.search).get('q');
    if (q) window.dispatchEvent(new CustomEvent('om:open-search', { detail: { query: q } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('om:open-search', { detail: { query: query.trim() } }));
  };

  const term = data && data.terms.length ? data.terms[((day % data.terms.length) + data.terms.length) % data.terms.length] : null;
  const myth = data && data.myths.length ? data.myths[((day % data.myths.length) + data.myths.length) % data.myths.length] : null;

  // Günün terimi kartı: geniş ekranda başlığın altındaki boşluğu doldurur (sol sütun), dar ekranda yan kartlarda.
  const termCard = term ? (
    <section className="rounded-3xl p-6 bg-gradient-to-br from-slate-900 to-amber-950 text-white min-h-[13rem] text-left">
      <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300">Günün terimi</h2>
      <p className="mt-2 text-xl font-black">{term.term} nedir?</p>
      <p className="mt-2 text-slate-200 text-sm leading-relaxed">{term.def}</p>
      <Link to={`/omurga-sozlugu/${term.slug}/`} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-amber-300 hover:text-amber-200">Devamını oku <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
    </section>
  ) : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://omurgam.com/#website',
    url: 'https://omurgam.com/',
    name: 'Omurgam',
    inLanguage: 'tr-TR',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: 'https://omurgam.com/?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="bg-stone-50 dark:bg-slate-900">
      <Seo
        title="Türkiye'nin Omurga Sağlığı Platformu"
        description="Bel ağrısı, boyun ağrısı ve bel fıtığını bilimsel kaynaklarla anlayın. Prof. Dr. Defne Kaya Utlu editörlüğünde yazılar, videolar ve Omurga Sözlüğü."
        jsonLd={jsonLd}
      />

      {/* ÜST KISIM: geniş ekranda (xl+) solda başlık + arama, sağda omurga haritası; dar ekranda alt alta. Kenar boşluğu yok (akışkan genişlik). */}
      <div className="w-full px-4 sm:px-6 lg:px-10 2xl:px-16 xl:grid xl:grid-cols-12 xl:gap-10 xl:items-start xl:py-10">
      {/* Izgara: üst satır 5|7 (başlık | harita), alt satır da 5|7 (kartlar | listeler) → sütun kenarları alt alta hizalı. */}
      {/* HERO + ARAMA */}
      <section className="pt-6 pb-8 md:pt-10 md:pb-10 xl:pb-0 xl:pt-8 xl:col-span-5 text-center xl:text-left">
        <div className="max-w-3xl mx-auto xl:mx-0">
          {/* Güven şeridi: editör rozeti + rakamlar tek satırda (ayrı sayaç bölümü yerine). */}
          <div className="flex flex-wrap items-center justify-center xl:justify-start gap-x-3 gap-y-2">
            <Link to="/hakkimizda" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-sm font-semibold hover:border-amber-400 dark:bg-slate-800 dark:border-slate-700 dark:text-amber-300">
              <span className="w-2 h-2 rounded-full bg-orange-600" aria-hidden="true" />
              Prof. Dr. Defne Kaya Utlu editörlüğünde
            </Link>
            {data && (
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                {fmt(data.stats.posts)} yazı · {fmt(data.stats.videos)} video · {fmt(data.stats.terms)} terim
              </span>
            )}
          </div>
          <h1 className="mt-4 text-[2.5rem] md:text-5xl lg:text-6xl xl:text-5xl 2xl:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            {/* Tek blok: LCP ölçümünde başlık tek öğe sayılır (iki satır ayrı blok olursa çerez bildirimi LCP olur). */}
            Omurgam<br /><span className="text-orange-600">Türkiye&apos;nin Omurga Sağlığı Platformu</span>
          </h1>
          <p className="mt-3 text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Bir terim, bir ağrı ya da bir konu: aratın, sade Türkçe ve bilimsel açıklamasını bulun.
          </p>
          <form onSubmit={onSearch} role="search" className="mt-5 flex items-center gap-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-2 pl-4">
            <Search className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
            <label htmlFor="home-search" className="sr-only">Omurgam'da ara</label>
            <input
              id="home-search"
              type="search"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Örn. sakralizasyon, bel fıtığı"
              className="flex-1 min-w-0 bg-transparent py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-500 outline-none"
            />
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-orange-600 transition-colors dark:bg-orange-600">Ara</button>
          </form>
          <div className="mt-3 flex flex-wrap justify-center xl:justify-start gap-2">
            {CHIPS.map((c) => (
              <Link key={c.to} to={c.to} className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-orange-400 hover:text-orange-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                {c.label}
              </Link>
            ))}
          </div>
          <LearnButton />
          {termCard && <div className="hidden xl:block mt-8 [&>section]:min-h-0">{termCard}</div>}
        </div>
      </section>

      {/* OMURGA HARİTASI */}
      {data && data.regions && data.regions.length > 0 && <SpineMap regions={data.regions} />}
      </div>

      {/* PANO */}
      <div className="w-full px-4 sm:px-6 lg:px-10 2xl:px-16 py-10 grid gap-8 lg:grid-cols-3 xl:grid-cols-12 xl:gap-10">
        <div className="lg:col-span-2 xl:col-span-7 space-y-8">
          {data && data.mostRead.length > 0 && (
            <section>
              <div className="flex items-end justify-between gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2"><Flame className="w-6 h-6 text-orange-600" aria-hidden="true" /> En çok okunanlar</h2>
                <Link to="/omurgam-ne-diyor/" className="shrink-0 whitespace-nowrap text-sm font-bold text-orange-700 hover:text-orange-800 inline-flex items-center gap-1">Tüm yazılar <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
              </div>
              {data.mostReadTabs && data.mostReadTabs.length > 0 && (
                <div className="-mx-4 px-4 mb-3 flex gap-2 overflow-x-auto [scrollbar-width:none]" role="tablist" aria-label="Konuya göre en çok okunanlar">
                  {[{ key: 'all', label: 'Tümü' }, ...data.mostReadTabs].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={tab === t.key}
                      onClick={() => setTab(t.key)}
                      className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${tab === t.key ? 'bg-slate-900 border-slate-900 text-white dark:bg-orange-700 dark:border-orange-700' : 'bg-white border-slate-200 text-slate-700 hover:border-orange-400 hover:text-orange-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
              <ol className="rounded-3xl border border-slate-200 bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:divide-slate-700">
                {(tab === 'all' ? data.mostRead : data.mostReadTabs?.find((t) => t.key === tab)?.posts ?? data.mostRead).map((p, i) => (
                  <li key={p.url}>
                    <Link to={p.url} className="flex items-start gap-4 p-4 md:p-5 hover:bg-amber-50/50 dark:hover:bg-slate-700/50">
                      <span className="text-2xl font-black text-slate-300 w-6 shrink-0" aria-hidden="true">{i + 1}</span>
                      <span className="min-w-0">
                        <span className="block font-bold text-slate-900 dark:text-white leading-snug">{p.title}</span>
                        <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">
                          {p.views > 0 && <><strong className="text-orange-700 dark:text-orange-400">{fmt(p.views)}</strong> okunma · </>}{p.category}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {data && data.videos.length > 0 && (
            <section>
              <div className="flex items-end justify-between gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2"><PlayCircle className="w-6 h-6 text-orange-600" aria-hidden="true" /> Yeni videolar</h2>
                <Link to="/videolar/" className="shrink-0 whitespace-nowrap text-sm font-bold text-orange-700 hover:text-orange-800 inline-flex items-center gap-1">Tümü <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {data.videos.map((v) => (
                  <Link key={v.url} to={v.url} className="group block rounded-2xl overflow-hidden border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700">
                    <span className="block aspect-video bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <img src={v.thumb} alt="" width={320} height={180} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </span>
                    <span className="block p-3 text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">{v.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6 xl:col-span-5 xl:order-first">
          {term && <div className="xl:hidden">{termCard}</div>}

          <section className={`rounded-3xl p-6 border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 ${questions === null || questions.length > 0 ? 'min-h-[14rem]' : ''}`}>
            <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2"><MessageCircle className="w-5 h-5 text-orange-600" aria-hidden="true" /> Son cevaplanan sorular</h2>
            {questions === null ? (
              <div className="mt-4 space-y-3" aria-hidden="true">
                {[0, 1, 2].map((i) => <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-700 animate-pulse" />)}
              </div>
            ) : questions.length > 0 ? (
              <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
                {questions.map((q) => (
                  <li key={q.id}>
                    <Link to={`/soru/${q.id}`} className="block py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-orange-700">
                      {q.question}
                      <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Cevaplandı</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Sorunuzu uzmanlarımıza iletebilirsiniz.</p>
            )}
            <Link to="/soru-sor" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-orange-700 hover:text-orange-800">Uzmana soru sor <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
          </section>

          {myth && (
            <section className="rounded-3xl p-6 border border-amber-200 bg-amber-50 dark:bg-slate-800 dark:border-slate-700 min-h-[13rem]">
              <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2"><Zap className="w-5 h-5 text-orange-600" aria-hidden="true" /> Doğru bilinen yanlış</h2>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{myth.term}</p>
              <p className="mt-2 flex gap-2 text-sm text-slate-800 dark:text-slate-200"><XCircle className="w-5 h-5 text-red-600 shrink-0" aria-label="Yanlış" />{myth.wrong}</p>
              <p className="mt-2 flex gap-2 text-sm text-slate-800 dark:text-slate-200"><CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-label="Doğru" />{myth.right}</p>
              <Link to="/mit-avi" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-orange-700 hover:text-orange-800">Mit Avı'nı oyna <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
            </section>
          )}
        </aside>
      </div>

      {/* SSS: <details> ile JS'siz açılır-kapanır (SSR'da görünür metin; FAQPage JSON-LD build'de index.html'e yazılır). */}
      {data && data.faq && data.faq.length > 0 && (
        <section aria-labelledby="home-faq-title" className="w-full px-4 sm:px-6 lg:px-10 2xl:px-16 pb-10">
          <div className="flex items-end justify-between gap-3 mb-4">
            <h2 id="home-faq-title" className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2"><HelpCircle className="w-6 h-6 text-orange-600" aria-hidden="true" /> Sıkça sorulan sorular</h2>
            <Link to="/sorular" className="shrink-0 whitespace-nowrap text-sm font-bold text-orange-700 hover:text-orange-800 inline-flex items-center gap-1">Tüm sorular <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
          </div>
          <div className="grid gap-3 lg:grid-cols-2 items-start">
            {data.faq.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 open:border-orange-300">
                <summary className="flex items-center justify-between gap-3 cursor-pointer list-none p-4 md:p-5 font-bold text-slate-900 dark:text-white [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="w-5 h-5 shrink-0 text-orange-600 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="px-4 md:px-5 pb-4 md:pb-5 -mt-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p>{f.a}</p>
                  {f.link && (
                    <Link to={f.link.to} className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-orange-700 hover:text-orange-800 dark:text-orange-400">{f.link.label} <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* KEŞFET */}
      <section className="w-full px-4 sm:px-6 lg:px-10 2xl:px-16 pb-14">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Keşfet</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EXPLORE.map(({ label, to, Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 font-bold text-slate-800 hover:border-orange-400 hover:text-orange-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
              <Icon className="w-5 h-5 text-orange-600 shrink-0" aria-hidden="true" />
              <span className="text-sm">{label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
