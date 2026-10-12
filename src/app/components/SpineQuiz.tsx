// "Omurganı ne kadar tanıyorsun?" — 5 soruluk hızlı test (anasayfa sol sütun).
// İlk çizimde yalnız davet kartı (SSR, hafif); sorular düğmeye basılınca /learn-pool.json'dan yüklenir.
// Tıbbi metin YAZILMAZ: ifadeler Omurga Sözlüğü'ndeki ❌/✅ cümlelerinin aynısı (scripts/build-learn-pool.mjs).
// Unvanlar ve paylaşım metni oyun dilidir, tıbbi iddia içermez.
import { useState } from 'react';
import { Link } from 'react-router';
import { Brain, CheckCircle2, XCircle, ArrowRight, RotateCcw, Share2, Trophy } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

interface QuizItem { term: string; slug: string; wrong: string; right: string; st?: 1 }
interface Q { item: QuizItem; showTrue: boolean }
const N = 5;

let poolPromise: Promise<QuizItem[]> | null = null;
const loadQuiz = () => (poolPromise ??= fetch('/learn-pool.json').then((r) => {
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}).then((p) => p.quiz as QuizItem[]).catch((e) => { poolPromise = null; throw e; }));

function pickQuestions(pool: QuizItem[]): Q[] {
  const a = [...pool];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  // En az 1–2 "doğru" ifade (yalnız kendi başına anlamlı ✅ cümleleri), gerisi yaygın yanlışlar.
  const trues = a.filter((x) => x.st).slice(0, 1 + Math.floor(Math.random() * 2));
  const rest = a.filter((x) => !trues.includes(x)).slice(0, N - trues.length);
  const qs = [...trues.map((item) => ({ item, showTrue: true })), ...rest.map((item) => ({ item, showTrue: false }))];
  for (let i = qs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [qs[i], qs[j]] = [qs[j], qs[i]]; }
  return qs;
}

const TITLES: [number, string, string][] = [
  [5, 'Omurga Profesörü', '🏆'],
  [4, 'Omurga Uzmanı', '🎓'],
  [3, 'İyi gidiyorsun', '💪'],
  [0, 'Öğrenmeye harika bir başlangıç', '📚'],
];
const titleFor = (s: number) => TITLES.find(([min]) => s >= min)!;

export default function SpineQuiz() {
  const [qs, setQs] = useState<Q[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]); // her soru için doğru bildi mi
  const [picked, setPicked] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  const start = async () => {
    setLoading(true); setFailed(false);
    try {
      const pool = await loadQuiz();
      setQs(pickQuestions(pool)); setIdx(0); setAnswers([]); setPicked(null); setCopied(false);
      trackEvent('spine_quiz', { step: 'start' });
    } catch { setFailed(true); } finally { setLoading(false); }
  };

  const answer = (v: boolean) => {
    if (!qs || picked !== null) return;
    setPicked(v);
    setAnswers((a) => [...a, v === qs[idx].showTrue]);
  };
  const next = () => {
    if (!qs) return;
    if (idx + 1 >= qs.length) {
      const score = answers.filter(Boolean).length;
      trackEvent('spine_quiz', { step: 'done', score });
    }
    setIdx((i) => i + 1); setPicked(null);
  };

  const done = qs && idx >= qs.length;
  const score = answers.filter(Boolean).length;

  const share = async () => {
    const [, t, e] = titleFor(score);
    const text = `Omurgam'ın omurga testinde ${score}/${N} yaptım: ${t} ${e} Sen kaç yaparsın? 🦴`;
    const url = 'https://omurgam.com/';
    trackEvent('spine_quiz', { step: 'share', score });
    try {
      if (navigator.share) { await navigator.share({ title: 'Omurgam testi', text, url }); return; }
    } catch { return; }
    try { await navigator.clipboard.writeText(`${text} ${url}`); setCopied(true); } catch { window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank', 'noopener'); }
  };

  return (
    <section aria-labelledby="spine-quiz-title" className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-orange-700 via-orange-800 to-amber-900 text-white shadow-lg shadow-orange-700/20">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" aria-hidden="true" />
      <div className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full bg-white/5" aria-hidden="true" />
      <div className="relative">
        <h2 id="spine-quiz-title" className="flex items-center gap-2 text-xl font-black"><Brain className="w-6 h-6" aria-hidden="true" /> Omurganı ne kadar tanıyorsun?</h2>

        {!qs && (
          <>
            <p className="mt-2 text-orange-50">5 soruluk hızlı test · 1 dakika. Doğru mu, yanlış mı? Sonucunu arkadaşlarınla paylaş.</p>
            <button type="button" onClick={start} disabled={loading} className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-orange-800 font-black hover:scale-[1.03] active:scale-100 transition-transform disabled:opacity-70">
              {loading ? 'Hazırlanıyor…' : 'Teste başla'} <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
            {failed && <p className="mt-3 text-sm text-orange-100">Test yüklenemedi, lütfen tekrar deneyin.</p>}
          </>
        )}

        {qs && !done && (
          <div aria-live="polite">
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-white/25 overflow-hidden" aria-hidden="true">
                <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${((idx + (picked !== null ? 1 : 0)) / N) * 100}%` }} />
              </div>
              <span className="text-sm font-bold tabular-nums">{idx + 1}/{N}</span>
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-orange-100">{qs[idx].item.term} hakkında</p>
            <p className="mt-1 text-lg font-black leading-snug">“{qs[idx].showTrue ? qs[idx].item.right : qs[idx].item.wrong}”</p>
            {picked === null ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => answer(true)} className="py-3 rounded-2xl bg-white text-emerald-800 font-black hover:bg-emerald-50">Doğru</button>
                <button type="button" onClick={() => answer(false)} className="py-3 rounded-2xl bg-white text-red-800 font-black hover:bg-red-50">Yanlış</button>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-white text-slate-800 p-4">
                <p className={`flex items-center gap-2 font-black ${picked === qs[idx].showTrue ? 'text-emerald-700' : 'text-red-700'}`}>
                  {picked === qs[idx].showTrue ? <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> : <XCircle className="w-5 h-5" aria-hidden="true" />}
                  {picked === qs[idx].showTrue ? 'Bildin!' : 'Bu sefer olmadı'} · Bu ifade {qs[idx].showTrue ? 'doğru' : 'yanlış'}.
                </p>
                {!qs[idx].showTrue && <p className="mt-2 text-sm"><strong>Doğrusu:</strong> {qs[idx].item.right}</p>}
                <button type="button" onClick={next} className="mt-3 inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-orange-700">
                  {idx + 1 >= N ? 'Sonucu gör' : 'Sonraki'} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}

        {done && qs && (
          <div aria-live="polite" className="mt-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 shrink-0 rounded-2xl bg-white text-orange-700 flex flex-col items-center justify-center">
                <Trophy className="w-6 h-6" aria-hidden="true" />
                <span className="text-2xl font-black tabular-nums leading-none mt-1">{score}/{N}</span>
              </div>
              <div>
                <p className="text-2xl font-black">{titleFor(score)[1]} {titleFor(score)[2]}</p>
                <p className="text-orange-50 text-sm">{N} sorudan {score} tanesini bildin.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={share} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-orange-800 font-black hover:scale-[1.03] transition-transform">
                <Share2 className="w-4 h-4" aria-hidden="true" /> {copied ? 'Kopyalandı!' : 'Sonucumu paylaş'}
              </button>
              <button type="button" onClick={start} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-white/70 text-white font-bold hover:bg-white/10">
                <RotateCcw className="w-4 h-4" aria-hidden="true" /> Yeni test
              </button>
            </div>
            {answers.some((a) => !a) && (
              <div className="mt-5 rounded-2xl bg-white/10 p-4">
                <p className="text-sm font-bold">Kaçırdıklarını sözlükte oku:</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {qs.filter((_, i) => !answers[i]).map((q) => (
                    <li key={q.item.slug}><Link to={`/omurga-sozlugu/${q.item.slug}/`} className="inline-block px-3 py-1 rounded-full bg-white text-orange-800 text-xs font-bold hover:bg-orange-50">{q.item.term}</Link></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
