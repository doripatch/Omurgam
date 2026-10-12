// Anasayfa "Omurganızı keşfedin": yandan omurga çizimi + bölge kartı.
// Masaüstünde bölgenin üzerine gelince, telefonda dokununca kart değişir (popup yok; kart sayfa içinde).
// SSR güvenli: çizim koordinatları deterministik (build HTML'i ile tarayıcı aynı DOM'u üretir).
// Tıbbi metin YAZILMAZ: tanımlar ve ilgili terimler Omurga Sözlüğü'nden, yazılar blogdan (scripts/prerender-home.mjs).
import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BookOpen } from 'lucide-react';

export interface SpineRegion {
  key: 'boyun' | 'sirt' | 'bel' | 'sakrum' | 'koksiks';
  label: string;
  term: string;
  slug: string;
  def: string;
  posts: { title: string; url: string }[];
  guide?: { label: string; to: string };
  related: { term: string; slug: string }[];
}

// Yandan görünüm (ön = sol). Eğrilikler: boyun ve bel öne, sırt ve sakrum arkaya doğru.
const X0 = 168;
function cx(y: number): number {
  if (y < 122) return X0 - 12 * Math.sin((Math.PI * (y - 16)) / 106);
  if (y < 304) return X0 + 20 * Math.sin((Math.PI * (y - 122)) / 182);
  if (y < 410) return X0 - 16 * Math.sin((Math.PI * (y - 304)) / 106);
  return X0 + 26 * Math.sin((Math.PI * (y - 410)) / 140);
}
const r1 = (n: number) => Math.round(n * 10) / 10;

interface Vert { x: number; y: number; w: number; h: number; a: number }
function column(y0: number, y1: number, n: number, w0: number, w1: number): Vert[] {
  const step = (y1 - y0) / n;
  return Array.from({ length: n }, (_, i) => {
    const y = y0 + step * (i + 0.5);
    const a = (Math.atan2(cx(y + 1) - cx(y - 1), 2) * 180) / Math.PI;
    return { x: r1(cx(y)), y: r1(y), w: r1(w0 + ((w1 - w0) * i) / Math.max(1, n - 1)), h: r1(step - 2.6), a: r1(-a) };
  });
}

const SHAPES: Record<SpineRegion['key'], Vert[]> = {
  boyun: column(16, 122, 7, 16, 20),
  sirt: column(122, 304, 12, 21, 28),
  bel: column(304, 410, 5, 31, 34),
  sakrum: [],
  koksiks: [],
};
// Sakrum: arkaya eğik, aşağı doğru daralan kama; koksiks: öne kıvrılan 4 küçük parça.
const SACRUM = (() => {
  const pts: string[] = [];
  const left: string[] = [];
  for (let y = 412; y <= 470; y += 6) {
    const half = 17 - ((y - 412) / 58) * 11;
    pts.push(`${r1(cx(y) + half)},${y}`);
    left.unshift(`${r1(cx(y) - half)},${y}`);
  }
  return [...pts, ...left].join(' ');
})();
const COCCYX: Vert[] = [0, 1, 2, 3].map((i) => {
  const y = 476 + i * 8;
  return { x: r1(cx(470) - 2 - i * i * 1.2), y: r1(y - i * 1.2), w: r1(10 - i * 1.8), h: 6, a: r1(25 + i * 12) };
});
const BANDS: Record<SpineRegion['key'], [number, number]> = { boyun: [10, 122], sirt: [122, 304], bel: [304, 410], sakrum: [410, 472], koksiks: [472, 512] };
const LABEL_Y: Record<SpineRegion['key'], number> = { boyun: 70, sirt: 214, bel: 358, sakrum: 442, koksiks: 494 };

function Body({ v }: { v: Vert }) {
  // Omur gövdesi + arkaya uzanan çıkıntı (dikensi çıkıntıyı çağrıştıran sade çizgi).
  return (
    <g transform={`translate(${v.x} ${v.y}) rotate(${v.a})`}>
      <rect x={-v.w / 2} y={-v.h / 2} width={v.w} height={v.h} rx={3} />
      <rect x={v.w / 2 - 1} y={-v.h / 2 + 1} width={r1(v.w * 0.45)} height={r1(Math.max(2.5, v.h * 0.35))} rx={1.5} opacity={0.75} />
    </g>
  );
}

export default function SpineMap({ regions }: { regions: SpineRegion[] }) {
  const [active, setActive] = useState<SpineRegion['key']>('boyun');
  const cur = regions.find((r) => r.key === active) ?? regions[0];
  if (!cur) return null;

  const renderSvg = (compact: boolean) => (
    <svg viewBox={compact ? '126 0 84 520' : '-28 0 258 520'} className={compact ? 'sm:hidden w-full h-auto select-none' : 'hidden sm:block w-full max-w-[15rem] mx-auto h-auto select-none'} aria-hidden="true">
      {regions.map((r) => {
        const on = r.key === active;
        const [b0, b1] = BANDS[r.key];
        return (
          <g
            key={r.key}
            onMouseEnter={() => setActive(r.key)}
            onClick={() => setActive(r.key)}
            className={`cursor-pointer transition-colors ${on ? 'fill-orange-500 dark:fill-orange-500' : 'fill-stone-300 hover:fill-orange-300 dark:fill-slate-600'}`}
          >
            <rect x={-28} y={b0} width={258} height={b1 - b0} fill="transparent" />
            {r.key === 'sakrum' && <polygon points={SACRUM} />}
            {(r.key === 'koksiks' ? COCCYX : SHAPES[r.key]).map((v, i) => <Body key={i} v={v} />)}
            {!compact && (
              <>
                <line x1={104} x2={r1(cx(LABEL_Y[r.key]) - 22)} y1={LABEL_Y[r.key]} y2={LABEL_Y[r.key]} strokeWidth={1} strokeDasharray="2 3" className={on ? 'stroke-orange-500' : 'stroke-slate-300 dark:stroke-slate-600'} />
                <text x={100} y={LABEL_Y[r.key] + 5} textAnchor="end" className={`text-[15px] font-bold ${on ? 'fill-orange-700 dark:fill-orange-400' : 'fill-slate-500 dark:fill-slate-400'}`}>{r.label}</text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );

  return (
    <section aria-labelledby="spine-map-title" className="pt-2 xl:pt-0">
      <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-5 md:p-8">
        <h2 id="spine-map-title" className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Omurganızı keşfedin</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Bir bölgeye dokunun ya da üzerine gelin.</p>

        <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Omurga bölgeleri">
          {regions.map((r) => (
            <button
              key={r.key}
              type="button"
              role="tab"
              aria-selected={r.key === active}
              aria-controls="spine-map-card"
              onClick={() => setActive(r.key)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${r.key === active ? 'bg-orange-700 border-orange-700 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-orange-400 hover:text-orange-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'}`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:gap-6 grid-cols-[5rem_minmax(0,1fr)] sm:grid-cols-[minmax(0,15rem)_1fr] items-start">
          {/* Telefonda etiketsiz dar çizim (etiketler yukarıdaki düğmelerde), geniş ekranda etiketli. */}
          {renderSvg(true)}
          {renderSvg(false)}

          <div id="spine-map-card" role="tabpanel" aria-live="polite" className="rounded-2xl bg-stone-50 dark:bg-slate-900/50 border border-stone-200 dark:border-slate-700 p-4 md:p-6 min-h-[22rem] min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">{cur.label}</p>
            <h3 className="mt-1 text-xl md:text-2xl font-black text-slate-900 dark:text-white">{cur.term}</h3>
            <p className="mt-3 text-slate-700 dark:text-slate-300 leading-relaxed">{cur.def}</p>
            <Link to={`/omurga-sozlugu/${cur.slug}/`} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-orange-700 hover:text-orange-800 dark:text-orange-400">
              <BookOpen className="w-4 h-4" aria-hidden="true" /> Sözlükte devamını oku
            </Link>

            {cur.posts.length > 0 && (
              <>
                <h4 className="mt-5 text-sm font-black text-slate-900 dark:text-white">{cur.label} hakkında çok okunanlar</h4>
                <ul className="mt-2 space-y-1">
                  {cur.posts.map((p) => (
                    <li key={p.url}>
                      <Link to={p.url} className="flex items-start gap-2 py-1 text-sm font-semibold text-slate-800 hover:text-orange-700 dark:text-slate-200">
                        <ArrowRight className="w-4 h-4 mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />{p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {cur.related.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {cur.related.map((t) => (
                  <Link key={t.slug} to={`/omurga-sozlugu/${t.slug}/`} className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-orange-400 hover:text-orange-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                    {t.term}
                  </Link>
                ))}
              </div>
            )}

            {cur.guide && (
              <Link to={cur.guide.to} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-orange-600 transition-colors dark:bg-orange-600">
                {cur.guide.label} <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
