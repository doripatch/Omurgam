import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { Check, X, ShieldQuestion, Share2, Flame, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Seo from '../components/Seo';

interface Myth {
  claim: string;
  answer: boolean; // iddia DOĞRU mu? (true = doğru, false = yanlış/mit)
  explanation: string;
}

// Doğrulanmış omurga/sağlık mitleri (bilgilendirme amaçlı)
const MYTHS: Myth[] = [
  { claim: 'Sert yatakta yatmak bel ağrısına her zaman iyi gelir.', answer: false, explanation: 'Araştırmalar çoğu kişi için orta sertlikte yatağın daha uygun olduğunu gösterir. Aşırı sert yatak şart değildir; en iyisi kişiye göre değişir.' },
  { claim: 'Bel fıtığı olan herkes mutlaka ameliyat olmalıdır.', answer: false, explanation: 'Bel fıtıklarının büyük çoğunluğu egzersiz ve konservatif tedaviyle düzelir. Ameliyat yalnızca seçili durumlarda gerekir.' },
  { claim: 'Ağır kaldırırken dizleri büküp yükü vücuda yakın tutmak omurgayı korur.', answer: true, explanation: 'Doğru teknik bel üzerindeki yükü azaltır: dizlerden çök, sırtı dik tut, yükü gövdene yakın taşı.' },
  { claim: 'MR\'da fıtık görülmesi mutlaka ağrı olacağı anlamına gelir.', answer: false, explanation: 'Hiç belirti vermeyen (asemptomatik) fıtıklar oldukça yaygındır. Görüntüleme bulgusu tek başına ağrıyı açıklamaz.' },
  { claim: 'Düzenli yürüyüş bel sağlığına iyi gelir.', answer: true, explanation: 'Düşük etkili aktivite kasları güçlendirir, dolaşımı artırır ve sertliği azaltır.' },
  { claim: 'Egzersiz bel ağrısını artırır; en iyisi uzun süre yatakta dinlenmektir.', answer: false, explanation: 'Uzun yatak istirahati genelde iyileşmeyi geciktirir. Uygun, kademeli hareket ve egzersiz önerilir.' },
  { claim: 'Skolyoz sadece çocuklarda görülür.', answer: false, explanation: 'Skolyoz erişkinlerde de görülebilir (örn. yaşa bağlı dejeneratif skolyoz).' },
  { claim: 'Karın ve sırt (kor) kaslarını güçlendirmek omurgayı destekler.', answer: true, explanation: 'Güçlü kor kasları omurgayı stabilize eder ve bel yükünü dengeler.' },
  { claim: 'Uzun süre hareketsiz oturmak bel için risk oluşturabilir.', answer: true, explanation: 'Uzun oturma disk üzerindeki basıncı ve sertliği artırabilir; sık sık ara verip hareket etmek önemlidir.' },
  { claim: 'Disk fıtığı elle "yerine oturtulabilir".', answer: false, explanation: 'Disk fıtığı elle bastırılarak "yerine oturtulmaz". Tedavi yaklaşımı tamamen farklıdır.' },
  { claim: 'Yüzme, omurga dostu bir egzersizdir.', answer: true, explanation: 'Düşük etkili olması ve kasları dengeli çalıştırması nedeniyle omurga için faydalıdır.' },
  { claim: 'Boyun ağrısında sürekli boyunluk takmak en iyi çözümdür.', answer: false, explanation: 'Uzun süreli boyunluk kullanımı kasları zayıflatabilir. Genellikle sınırlı süre ve hekim önerisiyle kullanılır.' },
  { claim: 'Kötü duruş (postür) zamanla kas-iskelet ağrılarına katkıda bulunabilir.', answer: true, explanation: 'Uzun süreli kötü postür kasları ve eklemleri zorlayarak ağrıya zemin hazırlayabilir.' },
  { claim: 'Bel ağrısının tek nedeni fıtıktır.', answer: false, explanation: 'Kas spazmı, duruş bozukluğu, eklem sorunları, zayıf kor kasları gibi pek çok neden olabilir.' },
  { claim: 'Sırt çantasını tek omuzda taşımak duruşu olumsuz etkileyebilir.', answer: true, explanation: 'Dengesiz yük postürü bozabilir; iki askıyı da kullanmak ve çantayı hafif tutmak önerilir.' },
  { claim: 'Ağrı kesici almak bel ağrısının altta yatan nedenini tedavi eder.', answer: false, explanation: 'Ağrı kesici ağrıyı azaltır ama nedeni çözmez. Kalıcı sonuç için nedene yönelik yaklaşım gerekir.' },
  { claim: 'Sıcak ve soğuk uygulama kas ağrısında rahatlama sağlayabilir.', answer: true, explanation: 'Akut dönemde soğuk, sonraki dönemde sıcak uygulama birçok kişide rahatlama sağlar.' },
  { claim: 'Genç yaşta omurga sağlığına dikkat etmeye gerek yoktur.', answer: false, explanation: 'Erken yaşta kazanılan duruş ve hareket alışkanlıkları ileride omurga sağlığını doğrudan etkiler.' },
];

const PER_DAY = 5;

function dayIndex(): number {
  const epoch = Date.UTC(2024, 0, 1);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((today - epoch) / 86400000);
}

const PROGRESS_KEY = 'omurgam_myth_progress';
const STATS_KEY = 'omurgam_myth_stats';

interface Stats {
  played: number;
  currentStreak: number;
  maxStreak: number;
  bestScore: number;
  lastDay: number;
}
const defaultStats: Stats = { played: 0, currentStreak: 0, maxStreak: 0, bestScore: 0, lastDay: -999 };

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return { ...defaultStats, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultStats };
}

export default function MythGame() {
  const di = useMemo(() => dayIndex(), []);
  const todays = useMemo(() => {
    const base = (di * PER_DAY) % MYTHS.length;
    return Array.from({ length: PER_DAY }, (_, i) => MYTHS[(base + i) % MYTHS.length]);
  }, [di]);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]); // her soru için doğru bildi mi
  const [revealed, setRevealed] = useState(false);
  const [lastChoice, setLastChoice] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState<Stats>(defaultStats);

  useEffect(() => {
    setStats(loadStats());
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.day === di && p.finished) {
          setAnswers(p.answers || []);
          setFinished(true);
        }
      }
    } catch {}
  }, [di]);

  const score = answers.filter(Boolean).length;
  const myth = todays[idx];

  const choose = (choice: boolean) => {
    if (revealed) return;
    setLastChoice(choice);
    setRevealed(true);
    setAnswers((prev) => [...prev, choice === myth.answer]);
  };

  const next = () => {
    const isLast = idx >= PER_DAY - 1;
    if (!isLast) {
      setIdx((i) => i + 1);
      setRevealed(false);
      setLastChoice(null);
      return;
    }
    // bitir
    const finalAnswers = answers;
    const finalScore = finalAnswers.filter(Boolean).length;
    setFinished(true);
    setStats((prev) => {
      let streak;
      if (prev.lastDay === di - 1) streak = prev.currentStreak + 1;
      else if (prev.lastDay === di) streak = prev.currentStreak;
      else streak = 1;
      const next: Stats = {
        played: prev.played + 1,
        currentStreak: streak,
        maxStreak: Math.max(prev.maxStreak, streak),
        bestScore: Math.max(prev.bestScore, finalScore),
        lastDay: di,
      };
      try { localStorage.setItem(STATS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({ day: di, answers: finalAnswers, finished: true }));
    } catch {}
  };

  const share = async () => {
    const emoji = answers.map((a) => (a ? '✅' : '❌')).join('');
    const text = `Omurgam — Mit Avı #${di}\n${score}/${PER_DAY} ${emoji}\nomurgam.com/mit-avi`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Sonuç kopyalandı, paylaşabilirsin!');
    } catch {
      toast.error('Kopyalanamadı');
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-10">
      <Seo
        title="Mit Avı — Omurga Mitleri Oyunu"
        description="Doğru mu, yanlış mı? Her gün omurga sağlığıyla ilgili 5 iddiayı değerlendir, yanlış bilinenleri öğren. Omurgam'ın günlük bilgi oyunu."
      />
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-full text-sm font-semibold mb-3">
            <ShieldQuestion className="w-4 h-4" /> MİT AVI
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Doğru mu, Yanlış mı?</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
            Omurga sağlığı hakkında {PER_DAY} iddia. Doğru bildiklerini işaretle, yanlış bilinenleri öğren.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-sm">
            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
              <Flame className="w-4 h-4" /> Seri: {stats.currentStreak}
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Trophy className="w-4 h-4" /> En iyi: {stats.bestScore}/{PER_DAY}
            </span>
          </div>
        </div>

        {!finished ? (
          <>
            {/* İlerleme */}
            <div className="flex items-center gap-2 mb-5">
              {todays.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < answers.length ? 'bg-amber-500' : i === idx ? 'bg-amber-300' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Soru kartı */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-amber-200/40 dark:border-slate-700 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-3">
                {idx + 1} / {PER_DAY}
              </div>
              <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed mb-6">
                "{myth.claim}"
              </p>

              {!revealed ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => choose(true)}
                    className="py-4 rounded-2xl bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-600 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" /> Doğru
                  </button>
                  <button
                    onClick={() => choose(false)}
                    className="py-4 rounded-2xl bg-rose-500 text-white font-bold text-lg hover:bg-rose-600 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" /> Yanlış
                  </button>
                </div>
              ) : (
                <div>
                  <div
                    className={`flex items-center gap-2 font-bold mb-3 ${
                      lastChoice === myth.answer ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {lastChoice === myth.answer ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    {lastChoice === myth.answer ? 'Doğru bildin!' : 'Yanlış tahmin.'}
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      — Cevap: {myth.answer ? 'Doğru' : 'Yanlış'}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-slate-700/40 rounded-2xl mb-5">
                    <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{myth.explanation}</p>
                  </div>
                  <button
                    onClick={next}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {idx >= PER_DAY - 1 ? 'Sonuçları Gör' : 'Sonraki'} <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Sonuç ekranı */
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-amber-200/40 dark:border-slate-700 rounded-3xl p-8 text-center shadow-sm">
            <div className="text-5xl mb-3">{score === PER_DAY ? '🏆' : score >= 3 ? '👏' : '💪'}</div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
              {score}/{PER_DAY} doğru
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {score === PER_DAY ? 'Kusursuz! Omurga mitlerinde ustasın.' : 'Güzel! Yarın yeni mitlerle tekrar gel.'}
            </p>
            <div className="text-2xl tracking-widest mb-6">{answers.map((a) => (a ? '✅' : '❌')).join('')}</div>

            <div className="flex items-center justify-center gap-6 mb-6 text-sm">
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.currentStreak}</div>
                <div className="text-slate-500 dark:text-slate-400">Seri (gün)</div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.played}</div>
                <div className="text-slate-500 dark:text-slate-400">Oynanan</div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.bestScore}/{PER_DAY}</div>
                <div className="text-slate-500 dark:text-slate-400">En iyi</div>
              </div>
            </div>

            <button
              onClick={share}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 mb-3"
            >
              <Share2 className="w-5 h-5" /> Sonucu Paylaş
            </button>
            <p className="text-sm text-slate-500 dark:text-slate-400">Yeni mitler için yarın tekrar gel! 🗓️</p>
          </div>
        )}

        {/* Diğer oyun + uyarı */}
        <div className="mt-8 text-center">
          <Link to="/gunun-terimi" className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold hover:underline">
            Günün Terimi oyununu da dene <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 max-w-md mx-auto">
            Bu oyun yalnızca bilgilendirme amaçlıdır ve tıbbi tavsiye yerine geçmez. Sağlık sorunlarınız için hekiminize danışın.
          </p>
        </div>
      </div>
    </div>
  );
}
