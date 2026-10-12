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

type Key = SpineRegion['key'];
interface Vert { x: number; y: number; w: number; h: number; a: number; k: Key; sp: [number, number] }
// Dikensi çıkıntı (arkaya-aşağı): [uzunluk oranı, aşağı eğim oranı] — boyunda kısa, sırtta uzun ve aşağı, belde kalın ve yatay.
const SP: Record<'boyun' | 'sirt' | 'bel', [number, number]> = { boyun: [0.62, 0.35], sirt: [0.78, 0.9], bel: [0.55, 0.25] };
function column(k: 'boyun' | 'sirt' | 'bel', y0: number, y1: number, n: number, w0: number, w1: number): Vert[] {
  const step = (y1 - y0) / n;
  return Array.from({ length: n }, (_, i) => {
    const y = y0 + step * (i + 0.5);
    const a = (Math.atan2(cx(y + 1) - cx(y - 1), 2) * 180) / Math.PI;
    return { x: r1(cx(y)), y: r1(y), w: r1(w0 + ((w1 - w0) * i) / Math.max(1, n - 1)), h: r1(step - 3.4), a: r1(-a), k, sp: SP[k] };
  });
}
const VERTS: Vert[] = [...column('boyun', 16, 122, 7, 15, 20), ...column('sirt', 122, 304, 12, 21, 28), ...column('bel', 304, 410, 5, 31, 35)];
// Diskler: art arda iki omurun arasında, üstteki omurun bölgesine ait (L5–S1 diski belde).
const DISCS = VERTS.map((v, i) => {
  const n = VERTS[i + 1] ?? { x: r1(cx(412)), y: 412, w: 34, h: 0, a: v.a };
  const y = r1((v.y + v.h / 2 + (n.y - n.h / 2)) / 2);
  return { x: r1((v.x + n.x) / 2), y, rx: r1(((v.w + n.w) / 2) * 0.47), ry: r1(Math.max(1.4, (n.y - n.h / 2 - (v.y + v.h / 2)) / 2 + 0.6)), a: r1((v.a + n.a) / 2), k: v.k };
});
// Sakrum (yandan): üstte geniş taban (öndeki uç = promontoryum), önü içe (konkav), arkası dışa (konveks) kavisli,
// aşağı doğru incelen kama; arkasında orta hat tümsekleri, içinde birleşik 5 segmentin sınır çizgileri.
// Koksiks: sakrum ucundan öne-aşağı kıvrılan, giderek küçülen ve birbirine değen 4 parça.
type P2 = [number, number];
const bez = (a: P2, b: P2, c: P2, d: P2, t: number): P2 => {
  const u = 1 - t;
  return [r1(u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0]), r1(u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1])];
};
const SAC_A: [P2, P2, P2, P2] = [[151, 415], [162, 436], [176, 468], [174, 489]]; // ön yüz (promontoryum → uç)
const SAC_P: [P2, P2, P2, P2] = [[185, 409], [197, 428], [198, 456], [190, 476]]; // arka yüz
const SACRUM_D = 'M151 415 L185 409 C197 428 198 456 190 476 Q185 487 178 491 L174 489 C176 468 162 436 151 415 Z';
const SACRUM_RIDGES = [0.2, 0.4, 0.6, 0.8].map((t) => [bez(...SAC_A, t), bez(...SAC_P, t)] as [P2, P2]);
const SACRUM_CREST = [0.22, 0.42, 0.62].map((t) => bez(...SAC_P, t));
const COCCYX_D = 'M173.5 489.5 L179.5 490.5 C180 498 175 505 167 510.5 C164 512.5 160.5 513.5 158.5 513 C160 509.5 163 506 166 502.5 C169.5 498.5 172.5 494.5 173.5 489.5 Z';
const COCCYX_JOINTS: [P2, P2][] = [[[172.6, 495.5], [178.6, 496.6]], [[169.4, 501.2], [175.6, 503.4]], [[165, 506], [170.6, 508.4]]];
const BANDS: Record<Key, [number, number]> = { boyun: [8, 122], sirt: [122, 304], bel: [304, 411], sakrum: [411, 491], koksiks: [491, 518] };
const LABEL_Y: Record<Key, number> = { boyun: 70, sirt: 214, bel: 358, sakrum: 448, koksiks: 506 };

function Vertebra({ v, p, fill }: { v: Vert; p: string; fill: string }) {
  // Yandan omur: gövde (ön, sol) + pedikül/lamina + dikensi çıkıntı (arka, sağ). Işık soldan-üstten (gradyan).
  const hw = v.w / 2, hh = v.h / 2;
  const [len, drop] = v.sp;
  const sx = hw + v.w * 0.16;
  const tipX = r1(sx + v.w * len), tipY = r1(hh * 0.4 + v.h * drop);
  return (
    <g transform={`translate(${v.x} ${v.y}) rotate(${v.a})`} filter={`url(#${p}-sh)`}>
      {len > 0 && (
        <path d={`M${r1(hw - 1)} ${r1(-hh * 0.7)} L${r1(sx)} ${r1(-hh * 0.75)} L${tipX} ${r1(tipY - 2.2)} Q${r1(tipX + 2)} ${r1(tipY)} ${tipX} ${r1(tipY + 2)} L${r1(sx)} ${r1(hh * 0.45)} L${r1(hw - 1)} ${r1(hh * 0.35)} Z`} fill={`url(#${p}-${fill}2)`} stroke="#7a6146" strokeOpacity={0.3} strokeWidth={0.5} />
      )}
      <rect x={r1(-hw)} y={r1(-hh)} width={v.w} height={v.h} rx={Math.min(3.2, hh)} fill={`url(#${p}-${fill})`} stroke="#7a6146" strokeOpacity={0.3} strokeWidth={0.5} />
      <rect x={r1(-hw + 1.2)} y={r1(-hh + 0.8)} width={r1(v.w - 2.4)} height={1} rx={0.5} fill="#fff" opacity={0.45} />
    </g>
  );
}

export default function SpineMap({ regions }: { regions: SpineRegion[] }) {
  const [active, setActive] = useState<Key>('boyun');
  const [hover, setHover] = useState<Key | null>(null);
  const [tilt, setTilt] = useState<[number, number]>([0, 0]);
  const cur = regions.find((r) => r.key === active) ?? regions[0];
  if (!cur) return null;

  // Derinlik efekti: imleç çizimin neresindeyse omurga o yöne hafifçe döner (yalnız fare; hareket azaltma tercihine uyar).
  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const b = e.currentTarget.getBoundingClientRect();
    setTilt([r1(((e.clientX - b.left) / b.width - 0.5) * 10), r1(((e.clientY - b.top) / b.height - 0.5) * -4)]);
  };

  const renderSvg = (compact: boolean) => {
    const p = compact ? 'smc' : 'smf'; // iki çizim aynı sayfada: gradyan/filtre kimlikleri ayrı olmalı
    const tone = (k: Key) => (k === active ? 'on' : k === hover ? 'hv' : 'bone');
    return (
      <svg
        viewBox={compact ? '122 0 100 522' : '-44 0 274 522'}
        className={compact ? 'sm:hidden w-full h-auto select-none' : 'hidden sm:block w-full max-w-[15rem] xl:max-w-[17rem] mx-auto h-auto select-none transition-transform duration-300 ease-out'}
        style={compact ? undefined : { transform: `perspective(700px) rotateY(${tilt[0]}deg) rotateX(${tilt[1]}deg)` }}
        onMouseMove={compact ? undefined : onMove}
        onMouseLeave={() => { setHover(null); setTilt([0, 0]); }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${p}-bone`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fbf6ee" /><stop offset="0.55" stopColor="#e7dac6" /><stop offset="1" stopColor="#bfa98b" /></linearGradient>
          <linearGradient id={`${p}-bone2`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ece1d0" /><stop offset="1" stopColor="#b39d7f" /></linearGradient>
          <linearGradient id={`${p}-hv`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff1e2" /><stop offset="0.55" stopColor="#fdc895" /><stop offset="1" stopColor="#ea8a45" /></linearGradient>
          <linearGradient id={`${p}-hv2`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fcd3a8" /><stop offset="1" stopColor="#d9783a" /></linearGradient>
          <linearGradient id={`${p}-on`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd2a6" /><stop offset="0.5" stopColor="#f97316" /><stop offset="1" stopColor="#b8410c" /></linearGradient>
          <linearGradient id={`${p}-on2`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fb923c" /><stop offset="1" stopColor="#9a3412" /></linearGradient>
          <linearGradient id={`${p}-disc`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c7d6e6" /><stop offset="1" stopColor="#7f97b2" /></linearGradient>
          <linearGradient id={`${p}-discon`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fde4c8" /><stop offset="1" stopColor="#f0a35e" /></linearGradient>
          <filter id={`${p}-sh`} x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0.8" dy="1.4" stdDeviation="1" floodColor="#3b2a17" floodOpacity="0.28" /></filter>
          <filter id={`${p}-glow`} x="-60%" y="-20%" width="220%" height="140%"><feGaussianBlur stdDeviation="7" /></filter>
        </defs>

        {/* Seçili bölgenin arkasında yumuşak, nabız gibi atan turuncu ışık */}
        <ellipse
          cx={active === 'sakrum' ? 176 : active === 'koksiks' ? 170 : r1(cx((BANDS[active][0] + BANDS[active][1]) / 2) + 6)}
          cy={(BANDS[active][0] + BANDS[active][1]) / 2}
          rx={active === 'koksiks' ? 18 : 34}
          ry={r1((BANDS[active][1] - BANDS[active][0]) / 2 + 6)}
          fill="#fb923c"
          filter={`url(#${p}-glow)`}
          className="motion-safe:animate-pulse"
          opacity={0.45}
        />

        {regions.map((r) => {
          const on = r.key === active;
          const [b0, b1] = BANDS[r.key];
          const t = tone(r.key);
          return (
            <g
              key={r.key}
              onMouseEnter={() => { setHover(r.key); setActive(r.key); }}
              onClick={() => setActive(r.key)}
              className="cursor-pointer"
            >
              <rect x={-44} y={b0} width={274} height={b1 - b0} fill="transparent" />
              {DISCS.filter((d) => d.k === r.key).map((d, i) => (
                <ellipse key={`d${i}`} cx={d.x} cy={d.y} rx={d.rx} ry={d.ry} transform={`rotate(${d.a} ${d.x} ${d.y})`} fill={`url(#${p}-${on ? 'discon' : 'disc'})`} />
              ))}
              {r.key === 'sakrum' && (
                <g filter={`url(#${p}-sh)`}>
                  {SACRUM_CREST.map(([x, y], i) => <circle key={i} cx={r1(x - 0.6)} cy={y} r={2.3} fill={`url(#${p}-${t}2)`} stroke="#7a6146" strokeOpacity={0.3} strokeWidth={0.5} />)}
                  <path d={SACRUM_D} fill={`url(#${p}-${t})`} stroke="#7a6146" strokeOpacity={0.35} strokeWidth={0.6} />
                  {SACRUM_RIDGES.map(([a, b], i) => (
                    <path key={i} d={`M${r1(a[0] + 1)} ${a[1]} Q${r1((a[0] + b[0]) / 2)} ${r1((a[1] + b[1]) / 2 + 3)} ${r1(b[0] - 1)} ${b[1]}`} fill="none" stroke="#8a6f50" strokeOpacity={0.4} strokeWidth={0.8} />
                  ))}
                  <path d="M153 414.6 L184 409.4" stroke="#fff" strokeOpacity={0.5} strokeWidth={1} />
                </g>
              )}
              {r.key === 'koksiks' && (
                <g filter={`url(#${p}-sh)`}>
                  <path d={COCCYX_D} fill={`url(#${p}-${t})`} stroke="#7a6146" strokeOpacity={0.35} strokeWidth={0.6} />
                  {COCCYX_JOINTS.map(([a, b], i) => <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#8a6f50" strokeOpacity={0.45} strokeWidth={0.7} />)}
                </g>
              )}
              {VERTS.filter((v) => v.k === r.key).map((v, i) => <Vertebra key={i} v={v} p={p} fill={t} />)}
              {!compact && (
                <>
                  <line x1={104} x2={r1(cx(LABEL_Y[r.key]) - 24)} y1={LABEL_Y[r.key]} y2={LABEL_Y[r.key]} strokeWidth={1} strokeDasharray="2 3" className={on ? 'stroke-orange-500' : 'stroke-slate-300 dark:stroke-slate-600'} />
                  <text x={100} y={LABEL_Y[r.key] + 5} textAnchor="end" className={`text-[15px] font-bold transition-colors ${on ? 'fill-orange-700 dark:fill-orange-400' : 'fill-slate-500 dark:fill-slate-400'}`}>{r.label}</text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <section aria-labelledby="spine-map-title" className="pt-2 xl:pt-0 xl:col-span-7">
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

        <div className="mt-6 grid gap-4 sm:gap-6 grid-cols-[5rem_minmax(0,1fr)] sm:grid-cols-[minmax(0,15rem)_1fr] xl:grid-cols-[minmax(0,17rem)_1fr] items-start">
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
