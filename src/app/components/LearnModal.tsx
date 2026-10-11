// "Bana rastgele bir şey öğret" penceresi: build'in ürettiği /learn-pool.json'dan rastgele bir kart.
// Kart türleri: sözlük terimi, doğru mu yanlış mı (sözlükteki ❌/✅ cümleleri aynen), yazı, video.
// Tıbbi metin YAZILMAZ; tüm içerik sitedeki onaylı kaynaklardan gelir (scripts/build-learn-pool.mjs).
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { X, Dices, ArrowRight, BookOpen, CheckCircle2, XCircle, PlayCircle, FileText, HelpCircle } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

interface Pool {
  terms: { term: string; slug: string; def: string; pl: string[] }[];
  quiz: { term: string; slug: string; wrong: string; right: string; st?: 1 }[];
  posts: { title: string; url: string; cat: string; desc: string }[];
  videos: { title: string; url: string; thumb: string }[];
}
type Card =
  | { kind: 'term'; item: Pool['terms'][number] }
  | { kind: 'quiz'; item: Pool['quiz'][number]; showTrue: boolean }
  | { kind: 'post'; item: Pool['posts'][number] }
  | { kind: 'video'; item: Pool['videos'][number] };

let poolPromise: Promise<Pool> | null = null;
const loadPool = () => (poolPromise ??= fetch('/learn-pool.json').then((r) => {
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}).catch((e) => { poolPromise = null; throw e; }));

// Ağırlıklar: doğru/yanlış en eğlencelisi; terim sitenin omurgası; yazı ve video sitede gezinmeye götürür.
const WEIGHTS: [Card['kind'], number][] = [['quiz', 4], ['term', 3], ['post', 2], ['video', 1]];
const seen = new Set<string>();
function pick(pool: Pool): Card {
  let r = Math.random() * WEIGHTS.reduce((s, [, w]) => s + w, 0);
  const kind = (WEIGHTS.find(([, w]) => (r -= w) < 0) ?? WEIGHTS[0])[0];
  const list = kind === 'quiz' ? pool.quiz : kind === 'term' ? pool.terms : kind === 'post' ? pool.posts : pool.videos;
  const key = (i: any) => `${kind}:${i.slug || i.url}`;
  const fresh = list.filter((i: any) => !seen.has(key(i)));
  const from = fresh.length ? fresh : list;
  const item: any = from[Math.floor(Math.random() * from.length)];
  seen.add(key(item));
  // Çoğu kart yaygın yanlışı sorar; ✅ cümlesi kendi başına anlamlıysa (st) yarı yarıya doğru ifade sorulur.
  if (kind === 'quiz') return { kind, item, showTrue: !!item.st && Math.random() < 0.5 };
  return { kind, item } as Card;
}

const LABEL: Record<Card['kind'], { text: string; Icon: typeof BookOpen }> = {
  term: { text: 'Bir terim öğrenin', Icon: BookOpen },
  quiz: { text: 'Doğru mu, yanlış mı?', Icon: HelpCircle },
  post: { text: 'Bunu okudunuz mu?', Icon: FileText },
  video: { text: 'Bunu izlediniz mi?', Icon: PlayCircle },
};

export default function LearnModal({ onClose }: { onClose: () => void }) {
  const [pool, setPool] = useState<Pool | null>(null);
  const [failed, setFailed] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [count, setCount] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const countRef = useRef(0);

  const next = (p: Pool) => {
    const c = pick(p);
    setCard(c);
    setAnswer(null);
    countRef.current += 1;
    setCount(countRef.current);
    trackEvent('learn_random', { kind: c.kind, n: countRef.current });
  };

  useEffect(() => {
    loadPool().then((p) => { setPool(p); next(p); }).catch(() => setFailed(true));
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    boxRef.current?.focus();
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = card ? LABEL[card.kind] : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={boxRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="learn-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-800 shadow-2xl p-6 md:p-7 outline-none text-left"
      >
        <button type="button" onClick={onClose} aria-label="Kapat" className="absolute top-4 right-4 p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {failed ? (
          <p id="learn-title" className="py-10 text-center text-slate-700 dark:text-slate-300">İçerik yüklenemedi. Lütfen biraz sonra tekrar deneyin.</p>
        ) : !card || !label ? (
          <div className="py-12 flex flex-col items-center gap-3 text-slate-500" aria-live="polite">
            <Dices className="w-10 h-10 text-orange-600 animate-spin" aria-hidden="true" />
            <span id="learn-title">Sizin için bir şey seçiliyor…</span>
          </div>
        ) : (
          <div aria-live="polite">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">
              <label.Icon className="w-4 h-4" aria-hidden="true" /> {label.text}
            </p>

            {card.kind === 'term' && (
              <>
                <h2 id="learn-title" className="mt-2 text-2xl font-black text-slate-900 dark:text-white pr-8">{card.item.term} nedir?</h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-relaxed">{card.item.def}</p>
                {card.item.pl.length > 0 && (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">Halk arasında:</strong> {card.item.pl.join(' · ')}</p>
                )}
                <Link to={`/omurga-sozlugu/${card.item.slug}/`} onClick={onClose} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-orange-700 hover:text-orange-800 dark:text-orange-400">
                  Sözlükte devamını oku <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </>
            )}

            {card.kind === 'quiz' && (
              <>
                <h2 id="learn-title" className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400 pr-8">{card.item.term} hakkında</h2>
                <p className="mt-2 text-xl font-black text-slate-900 dark:text-white leading-snug">“{card.showTrue ? card.item.right : card.item.wrong}”</p>
                {answer === null ? (
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setAnswer(true)} className="py-3 rounded-2xl border-2 border-emerald-600 text-emerald-800 font-black hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-slate-700">Doğru</button>
                    <button type="button" onClick={() => setAnswer(false)} className="py-3 rounded-2xl border-2 border-red-600 text-red-800 font-black hover:bg-red-50 dark:text-red-300 dark:hover:bg-slate-700">Yanlış</button>
                  </div>
                ) : (
                  <div className="mt-5">
                    <p className={`text-lg font-black ${answer === card.showTrue ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                      {answer === card.showTrue ? 'Bildiniz! 🎉' : 'Pek değil 🙂'} Bu ifade {card.showTrue ? 'doğru' : 'yanlış'}.
                    </p>
                    <p className="mt-3 flex gap-2 text-sm text-slate-800 dark:text-slate-200"><XCircle className="w-5 h-5 text-red-600 shrink-0" aria-label="Yaygın yanlış" />{card.item.wrong}</p>
                    <p className="mt-2 flex gap-2 text-sm text-slate-800 dark:text-slate-200"><CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-label="Doğrusu" />{card.item.right}</p>
                    <Link to={`/omurga-sozlugu/${card.item.slug}/`} onClick={onClose} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-orange-700 hover:text-orange-800 dark:text-orange-400">
                      {card.item.term} hakkında daha fazlası <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </>
            )}

            {card.kind === 'post' && (
              <>
                <h2 id="learn-title" className="mt-2 text-2xl font-black text-slate-900 dark:text-white leading-snug pr-8">{card.item.title}</h2>
                {card.item.cat && <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">{card.item.cat}</p>}
                <p className="mt-3 text-slate-700 dark:text-slate-300 leading-relaxed">{card.item.desc}</p>
                <Link to={card.item.url} onClick={onClose} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-orange-700 hover:text-orange-800 dark:text-orange-400">
                  Yazıyı oku <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </>
            )}

            {card.kind === 'video' && (
              <>
                <Link to={card.item.url} onClick={onClose} className="mt-3 block rounded-2xl overflow-hidden aspect-video bg-slate-200 dark:bg-slate-700">
                  <img src={card.item.thumb} alt="" width={320} height={180} className="w-full h-full object-cover" />
                </Link>
                <h2 id="learn-title" className="mt-3 text-xl font-black text-slate-900 dark:text-white leading-snug">{card.item.title}</h2>
                <Link to={card.item.url} onClick={onClose} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-orange-700 hover:text-orange-800 dark:text-orange-400">
                  Videoyu izle <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{count}. kart</span>
              <button type="button" onClick={() => pool && next(pool)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-orange-700 transition-colors dark:bg-orange-700">
                <Dices className="w-4 h-4" aria-hidden="true" /> Bir tane daha
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
