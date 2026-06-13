import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router';
import { Delete, Share2, Lightbulb, Trophy, Flame, BarChart3, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { termsAPI, medicalTermsAPI } from '../lib/api';
import Seo from '../components/Seo';

// ---- Türkçe yardımcılar ----
const TR_UPPER = (s: string) => (s || '').toLocaleUpperCase('tr-TR');
const KEYBOARD: string[][] = [
  ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H'],
  ['I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P'],
  ['R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'],
];
const ALLOWED = new Set(KEYBOARD.flat());

const MAX_GUESSES = 6;
const MIN_LEN = 4;
const MAX_LEN = 9;

interface WordEntry {
  word: string;       // gösterilecek terim (tek kelime)
  letters: string[];  // büyük harf, karakter dizisi
  clue: string;       // ipucu (açıklama)
  category: string;
  source: 'mr' | 'med' | 'builtin';
}

// ---- Gömülü kelime listesi (sözlük boş olsa bile oyun çalışsın diye) ----
const BUILTIN: { word: string; clue: string; category: string }[] = [
  { word: 'Omurga', clue: 'Vücudun dik durmasını sağlayan, omurlardan oluşan kemik sütun.', category: 'Anatomi' },
  { word: 'Omur', clue: 'Omurgayı oluşturan tek bir kemik birimi.', category: 'Anatomi' },
  { word: 'Vertebra', clue: 'Omurga kemiğinin (omurun) Latince adı.', category: 'Anatomi' },
  { word: 'Disk', clue: 'İki omur arasında yastık görevi gören kıkırdak yapı.', category: 'Anatomi' },
  { word: 'Fıtık', clue: 'Disk içeriğinin dışarı taşıp sinire baskı yapması.', category: 'Hastalık' },
  { word: 'Skolyoz', clue: 'Omurganın yana doğru eğriliği.', category: 'Hastalık' },
  { word: 'Kifoz', clue: 'Sırtın aşırı öne (kambur) eğriliği.', category: 'Hastalık' },
  { word: 'Lordoz', clue: 'Belin içe doğru çukurlaşması.', category: 'Hastalık' },
  { word: 'Stenoz', clue: 'Omurilik kanalının daralması.', category: 'Hastalık' },
  { word: 'Artroz', clue: 'Eklem kıkırdağının aşınması, kireçlenme.', category: 'Hastalık' },
  { word: 'Siyatik', clue: 'Bele bağlı olarak bacağa yayılan sinir ağrısı.', category: 'Hastalık' },
  { word: 'Spazm', clue: 'Kasın istemsiz ve ani kasılması.', category: 'Belirti' },
  { word: 'Ödem', clue: 'Dokuda sıvı birikmesiyle oluşan şişlik.', category: 'Belirti' },
  { word: 'Boyun', clue: 'Başı gövdeye bağlayan üst omurga bölgesi.', category: 'Anatomi' },
  { word: 'Sinir', clue: 'Vücutta uyarı ve sinyal taşıyan lifsel yapı.', category: 'Anatomi' },
  { word: 'Tendon', clue: 'Kası kemiğe bağlayan sağlam bağ dokusu.', category: 'Anatomi' },
  { word: 'Ligaman', clue: 'Kemikleri birbirine bağlayan bağ.', category: 'Anatomi' },
  { word: 'Kıkırdak', clue: 'Eklem yüzeylerini kaplayan esnek doku.', category: 'Anatomi' },
  { word: 'Postür', clue: 'Vücudun duruş biçimi.', category: 'Genel' },
  { word: 'Egzersiz', clue: 'Bedeni güçlendiren planlı fiziksel hareket.', category: 'Tedavi' },
  { word: 'Masaj', clue: 'Dokulara elle uygulanan baskı tedavisi.', category: 'Tedavi' },
  { word: 'Traksiyon', clue: 'Omurgayı gererek uygulanan çekme tedavisi.', category: 'Tedavi' },
  { word: 'Atel', clue: 'Bir bölgeyi sabitlemek için kullanılan destek.', category: 'Tedavi' },
  { word: 'Alçı', clue: 'Kırığı sabitlemek için kullanılan sert kabuk.', category: 'Tedavi' },
  { word: 'Romatizma', clue: 'Eklem ve bağ dokusunu etkileyen ağrılı hastalık grubu.', category: 'Hastalık' },
  { word: 'Nöropati', clue: 'Sinir hasarına bağlı uyuşma/ağrı durumu.', category: 'Hastalık' },
];

// Kelime havuza uygun mu? (tek kelime, sadece Türkçe harf, uygun uzunluk)
function toEntry(word: string, clue: string, category: string, source: WordEntry['source']): WordEntry | null {
  const w = (word || '').trim();
  if (!w || /\s/.test(w)) return null;
  const letters = [...TR_UPPER(w)];
  if (letters.length < MIN_LEN || letters.length > MAX_LEN) return null;
  if (!letters.every((ch) => ALLOWED.has(ch))) return null;
  return { word: w, letters, clue: clue || '', category: category || '', source };
}

function evaluate(guess: string[], answer: string[]): ('correct' | 'present' | 'absent')[] {
  const n = answer.length;
  const res: ('correct' | 'present' | 'absent')[] = Array(n).fill('absent');
  const counts: Record<string, number> = {};
  for (const ch of answer) counts[ch] = (counts[ch] || 0) + 1;
  for (let i = 0; i < n; i++) {
    if (guess[i] === answer[i]) {
      res[i] = 'correct';
      counts[guess[i]]--;
    }
  }
  for (let i = 0; i < n; i++) {
    if (res[i] === 'correct') continue;
    const ch = guess[i];
    if (counts[ch] > 0) {
      res[i] = 'present';
      counts[ch]--;
    }
  }
  return res;
}

function dayIndex(): number {
  const epoch = Date.UTC(2024, 0, 1);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((today - epoch) / 86400000);
}

const STATS_KEY = 'omurgam_word_stats';
const PROGRESS_KEY = 'omurgam_word_progress';

interface Stats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  dist: number[];
}
const defaultStats: Stats = { played: 0, wins: 0, currentStreak: 0, maxStreak: 0, dist: [0, 0, 0, 0, 0, 0] };

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return { ...defaultStats, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultStats };
}

export default function WordGame() {
  const [pool, setPool] = useState<WordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [guesses, setGuesses] = useState<string[][]>([]);
  const [current, setCurrent] = useState<string[]>([]);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showHint, setShowHint] = useState(false);
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [showStats, setShowStats] = useState(false);

  const di = useMemo(() => dayIndex(), []);

  // Bugünün cevabı
  const answer: WordEntry | null = useMemo(() => {
    if (pool.length === 0) return null;
    return pool[di % pool.length];
  }, [pool, di]);

  useEffect(() => {
    setStats(loadStats());
    loadPool();
  }, []);

  const loadPool = async () => {
    try {
      setIsLoading(true);
      const [mr, med] = await Promise.all([
        termsAPI.getAll().catch(() => ({ terms: [] })),
        medicalTermsAPI.getAll().catch(() => ({ terms: [] })),
      ]);
      const entries: WordEntry[] = [];
      for (const t of (mr.terms || [])) {
        const e = toEntry(t.term, t.explanation, t.category, 'mr');
        if (e) entries.push(e);
      }
      for (const t of (med.terms || [])) {
        const e = toEntry(t.term, t.definition, t.category, 'med');
        if (e) entries.push(e);
      }
      for (const b of BUILTIN) {
        const e = toEntry(b.word, b.clue, b.category, 'builtin');
        if (e) entries.push(e);
      }
      // Tekilleştir (büyük harfe göre) ve sırala -> herkeste aynı sıra
      const seen = new Set<string>();
      const unique = entries.filter((e) => {
        const k = e.letters.join('');
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      unique.sort((a, b) => a.word.localeCompare(b.word, 'tr'));
      setPool(unique);
    } catch (error) {
      console.error('Oyun verisi yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Kaydedilmiş ilerlemeyi geri yükle (aynı gün ise)
  useEffect(() => {
    if (!answer) return;
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.day === di && p.answer === answer.letters.join('')) {
          setGuesses(p.guesses || []);
          setStatus(p.status || 'playing');
          return;
        }
      }
    } catch {}
    setGuesses([]);
    setStatus('playing');
    setCurrent([]);
  }, [answer, di]);

  const persist = (g: string[][], st: 'playing' | 'won' | 'lost') => {
    if (!answer) return;
    try {
      localStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify({ day: di, answer: answer.letters.join(''), guesses: g, status: st })
      );
    } catch {}
  };

  const recordResult = (won: boolean, rowCount: number) => {
    setStats((prev) => {
      const next: Stats = {
        played: prev.played + 1,
        wins: prev.wins + (won ? 1 : 0),
        currentStreak: won ? prev.currentStreak + 1 : 0,
        maxStreak: won ? Math.max(prev.maxStreak, prev.currentStreak + 1) : prev.maxStreak,
        dist: [...prev.dist],
      };
      if (won && rowCount >= 1 && rowCount <= MAX_GUESSES) next.dist[rowCount - 1] += 1;
      try {
        localStorage.setItem(STATS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const submit = useCallback(() => {
    if (!answer || status !== 'playing') return;
    if (current.length !== answer.letters.length) {
      toast.error(`Kelime ${answer.letters.length} harfli olmalı`);
      return;
    }
    const newGuesses = [...guesses, current];
    setGuesses(newGuesses);
    setCurrent([]);

    const won = current.join('') === answer.letters.join('');
    if (won) {
      setStatus('won');
      persist(newGuesses, 'won');
      recordResult(true, newGuesses.length);
      setTimeout(() => setShowStats(true), 900);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setStatus('lost');
      persist(newGuesses, 'lost');
      recordResult(false, newGuesses.length);
      setTimeout(() => setShowStats(true), 900);
    } else {
      persist(newGuesses, 'playing');
    }
  }, [answer, current, guesses, status]);

  const press = useCallback(
    (key: string) => {
      if (!answer || status !== 'playing') return;
      if (key === 'ENTER') {
        submit();
      } else if (key === 'DEL') {
        setCurrent((c) => c.slice(0, -1));
      } else if (ALLOWED.has(key)) {
        setCurrent((c) => (c.length < answer.letters.length ? [...c, key] : c));
      }
    },
    [answer, status, submit]
  );

  // Fiziksel klavye
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') press('ENTER');
      else if (e.key === 'Backspace') press('DEL');
      else if (e.key.length === 1) {
        const up = TR_UPPER(e.key);
        if (ALLOWED.has(up)) press(up);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press]);

  // Klavye renkleri
  const letterStatus = useMemo(() => {
    const map: Record<string, 'correct' | 'present' | 'absent'> = {};
    if (!answer) return map;
    for (const g of guesses) {
      const res = evaluate(g, answer.letters);
      g.forEach((ch, i) => {
        const s = res[i];
        const prev = map[ch];
        if (s === 'correct' || (s === 'present' && prev !== 'correct') || (!prev)) map[ch] = s;
      });
    }
    return map;
  }, [guesses, answer]);

  const shareResult = async () => {
    if (!answer || status === 'playing') return;
    const lines = guesses.map((g) =>
      evaluate(g, answer.letters)
        .map((s) => (s === 'correct' ? '🟩' : s === 'present' ? '🟨' : '⬜'))
        .join('')
    );
    const score = status === 'won' ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
    const text = `Omurgam — Günün Terimi #${di}\n${score}\n${lines.join('\n')}\nomurgam.com/gunun-terimi`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Sonuç kopyalandı, paylaşabilirsin!');
    } catch {
      toast.error('Kopyalanamadı');
    }
  };

  const len = answer?.letters.length || 5;
  const tileColor = (s: 'correct' | 'present' | 'absent') =>
    s === 'correct' ? 'bg-emerald-500 border-emerald-500 text-white'
    : s === 'present' ? 'bg-amber-400 border-amber-400 text-white'
    : 'bg-slate-400 border-slate-400 text-white';
  const keyColor = (k: string) => {
    const s = letterStatus[k];
    if (s === 'correct') return 'bg-emerald-500 text-white';
    if (s === 'present') return 'bg-amber-400 text-white';
    if (s === 'absent') return 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400';
    return 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-amber-50 dark:hover:bg-slate-600';
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-8">
      <Seo
        title="Günün Terimi — Kelime Oyunu"
        description="Her gün yeni bir tıbbi terim! Omurga ve sağlık terimlerini tahmin et, serini koru. Omurgam'ın günlük kelime oyunu."
      />
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold mb-3">
            <BookOpen className="w-4 h-4" /> GÜNÜN TERİMİ
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Kelime Oyunu</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
            Günün tıbbi terimini {MAX_GUESSES} denemede bul. Her gün yeni bir kelime!
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-sm">
            <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
              <Flame className="w-4 h-4" /> Seri: {stats.currentStreak}
            </span>
            <button onClick={() => setShowStats(true)} className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900">
              <BarChart3 className="w-4 h-4" /> İstatistik
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Oyun hazırlanıyor...</p>
          </div>
        ) : !answer ? (
          <div className="text-center py-16 text-slate-600">Oyun şu an kullanılamıyor.</div>
        ) : (
          <>
            {/* Tahta */}
            <div className="flex flex-col items-center gap-1.5 mb-4">
              {Array.from({ length: MAX_GUESSES }).map((_, row) => {
                const isSubmitted = row < guesses.length;
                const rowLetters = isSubmitted ? guesses[row] : row === guesses.length ? current : [];
                const res = isSubmitted ? evaluate(guesses[row], answer.letters) : [];
                return (
                  <div key={row} className="flex gap-1.5">
                    {Array.from({ length: len }).map((_, col) => {
                      const ch = rowLetters[col] || '';
                      const base = 'w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg border-2 text-xl font-black uppercase';
                      const cls = isSubmitted
                        ? tileColor(res[col])
                        : ch
                        ? 'border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white';
                      return (
                        <div key={col} className={`${base} ${cls}`}>{ch}</div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* İpucu */}
            <div className="text-center mb-4">
              {showHint || status !== 'playing' ? (
                <div className="inline-block bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-700 dark:text-slate-200 max-w-md">
                  <span className="font-semibold text-amber-700 dark:text-amber-400">İpucu ({answer.category || 'Terim'}):</span>{' '}
                  {answer.clue || 'Bu terimi tahmin et.'}
                </div>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-amber-700 dark:text-amber-400 rounded-full text-sm font-semibold hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Lightbulb className="w-4 h-4" /> İpucu göster
                </button>
              )}
            </div>

            {/* Sonuç bandı */}
            {status !== 'playing' && (
              <div className={`text-center mb-4 p-4 rounded-2xl ${status === 'won' ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
                <p className="font-bold text-slate-900">
                  {status === 'won' ? '🎉 Tebrikler, bildin!' : '😔 Bugünlük olmadı.'}
                </p>
                <p className="text-slate-700 mt-1">
                  Doğru terim: <span className="font-black">{answer.word}</span>
                </p>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <button onClick={shareResult} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors">
                    <Share2 className="w-4 h-4" /> Paylaş
                  </button>
                  <Link to="/saglik-sozlugu" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                    Sözlüğe Git
                  </Link>
                </div>
              </div>
            )}

            {/* Klavye */}
            <div className="flex flex-col items-center gap-1.5">
              {KEYBOARD.map((krow, i) => (
                <div key={i} className="flex gap-1 justify-center">
                  {i === KEYBOARD.length - 1 && (
                    <button
                      onClick={() => press('ENTER')}
                      className="px-2 h-12 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center"
                    >
                      ENTER
                    </button>
                  )}
                  {krow.map((k) => (
                    <button
                      key={k}
                      onClick={() => press(k)}
                      className={`w-7 sm:w-8 h-12 rounded-lg font-bold text-sm transition-colors ${keyColor(k)}`}
                    >
                      {k}
                    </button>
                  ))}
                  {i === KEYBOARD.length - 1 && (
                    <button
                      onClick={() => press('DEL')}
                      className="px-2 h-12 rounded-lg bg-slate-600 text-white flex items-center"
                      aria-label="Sil"
                    >
                      <Delete className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* İstatistik modalı */}
        {showStats && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowStats(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> İstatistiklerin
              </h2>
              <div className="grid grid-cols-4 gap-2 text-center mb-4">
                <div><div className="text-2xl font-black text-slate-900 dark:text-white">{stats.played}</div><div className="text-xs text-slate-500">Oynanan</div></div>
                <div><div className="text-2xl font-black text-slate-900 dark:text-white">{stats.played ? Math.round((stats.wins / stats.played) * 100) : 0}%</div><div className="text-xs text-slate-500">Başarı</div></div>
                <div><div className="text-2xl font-black text-slate-900 dark:text-white">{stats.currentStreak}</div><div className="text-xs text-slate-500">Seri</div></div>
                <div><div className="text-2xl font-black text-slate-900 dark:text-white">{stats.maxStreak}</div><div className="text-xs text-slate-500">En İyi</div></div>
              </div>
              <div className="space-y-1 mb-4">
                {stats.dist.map((count, i) => {
                  const max = Math.max(1, ...stats.dist);
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-4 text-slate-500">{i + 1}</span>
                      <div className="flex-1 bg-slate-100 rounded">
                        <div className="bg-amber-500 text-white text-xs text-right px-2 py-0.5 rounded" style={{ width: `${(count / max) * 100}%`, minWidth: count ? '1.5rem' : '0' }}>
                          {count > 0 ? count : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {status !== 'playing' && (
                <button onClick={shareResult} className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" /> Sonucu Paylaş
                </button>
              )}
              <button onClick={() => setShowStats(false)} className="w-full mt-2 py-2 text-slate-500 hover:text-slate-700 text-sm">Kapat</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
