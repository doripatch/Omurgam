import { useState, useEffect, type ReactNode } from 'react';
import { Stethoscope, Plus, Minus, Loader2, Clock } from 'lucide-react';
import { clinNotesAPI } from '../lib/api';
import Seo from '../components/Seo';

interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  readingTime?: string;
  createdAt?: string;
}

// **kalın** metni <strong>'a çevirir
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? (
      <strong key={i} className="font-semibold text-slate-900 dark:text-white">{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

// Bölüm başlığına konusuna göre sade bir emoji seçer
const HEADING_EMOJI: Array<[RegExp, string]> = [
  [/irritabil/i, '🔥'],
  [/doz|yük|load|şiddet/i, '⚖️'],
  [/ağrı|semptom/i, '⚠️'],
  [/hareket|mobil|rom|esnek/i, '🔄'],
  [/kuvvet|güç|strength|kas/i, '💪'],
  [/dayanıklıl|endurans|kondisyon/i, '🔋'],
  [/nefes|solunum/i, '🫁'],
  [/dinlen|uyku|toparlan|istirahat/i, '😴'],
  [/ilerle|progres|artır|aşama/i, '📈'],
  [/ölç|değerlendir|test|izle|takip/i, '📊'],
  [/hedef|amaç|plan/i, '🎯'],
  [/süre|zaman|frekans|sıklık/i, '⏱️'],
  [/uyarı|dikkat|kırmızı|red flag|risk/i, '🚩'],
  [/postür|duruş|hizalan/i, '🧍'],
  [/egzersiz|hareket reçete|program/i, '🏋️'],
];
function emojiFor(title: string) {
  for (const [re, e] of HEADING_EMOJI) if (re.test(title)) return e;
  return '📌';
}

// Düz metni yapılandırılmış bloklara render eder (içerik değişmez)
function NoteContent({ text }: { text: string }) {
  const lines = (text || '').split('\n');
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="my-3 space-y-1.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2.5 text-slate-700 dark:text-slate-200 leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
              <span>{renderInline(b)}</span>
            </li>
          ))}
        </ul>
      );
      bullets = [];
    }
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) { flush(); return; }

    const md = line.match(/^(#{2,3})\s+(.*)$/);
    const numbered = line.match(/^(\d+)[.)]\s+(.+)$/);
    const explicitBullet = line.match(/^[-•*]\s+(.+)$/);
    const isBulletComma = line.endsWith(',');
    const isSubhead = line.endsWith(':') && line.length <= 80;

    if (md) {
      flush();
      const title = md[2];
      blocks.push(
        <h3 key={idx} className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
          <span>{emojiFor(title)}</span><span>{renderInline(title)}</span>
        </h3>
      );
    } else if (numbered && !isBulletComma) {
      flush();
      const num = numbered[1];
      const title = numbered[2];
      blocks.push(
        <h3 key={idx} className="flex items-start gap-2.5 mt-6 mb-2">
          <span className="flex-shrink-0 w-7 h-7 mt-0.5 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-sm font-bold flex items-center justify-center">{num}</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">{emojiFor(title)} {renderInline(title)}</span>
        </h3>
      );
    } else if (explicitBullet) {
      bullets.push(explicitBullet[1]);
    } else if (isBulletComma) {
      bullets.push(line.replace(/,$/, ''));
    } else if (bullets.length > 0 && line.length <= 70 && !/[.:]/.test(line.slice(0, -1))) {
      // virgülle biten listenin nokta ile biten son maddesi
      bullets.push(line.replace(/[.,]$/, ''));
      flush();
    } else if (isSubhead) {
      flush();
      blocks.push(
        <p key={idx} className="font-semibold text-teal-700 dark:text-teal-300 mt-4 mb-1">{renderInline(line)}</p>
      );
    } else {
      flush();
      blocks.push(
        <p key={idx} className="text-slate-700 dark:text-slate-200 leading-relaxed mb-3">{renderInline(line)}</p>
      );
    }
  });
  flush();

  return <div className="border-t border-slate-200 dark:border-slate-700 pt-4">{blocks}</div>;
}

export default function Clinicians() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    clinNotesAPI.getAll()
      .then((d) => setNotes(d.notes || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-teal-50/30 to-emerald-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-16 px-4">
      <Seo
        title="Klinisyenler Buraya"
        description="Prof. Dr. Defne Kaya Utlu'dan klinisyenlere yönelik değerlendirmeler, genel tavsiyeler ve klinik notlar."
        jsonLd={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              name: 'Klinisyenler Buraya',
              description: "Prof. Dr. Defne Kaya Utlu'dan klinisyenlere yönelik klinik değerlendirme ve tavsiyeler.",
              inLanguage: 'tr-TR',
              url: 'https://omurgam.com/klinisyenler',
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://omurgam.com/' },
                { '@type': 'ListItem', position: 2, name: 'Klinisyenler Buraya' },
              ],
            },
            {
              '@type': 'ItemList',
              itemListElement: notes.slice(0, 40).map((n, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: n.title,
              })),
            },
          ],
        }}
      />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 text-sm font-medium mb-6">
            <Stethoscope className="w-4 h-4" />
            <span>Klinisyenler İçin</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-teal-700 to-emerald-700 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent mb-4">
            Klinisyenler Buraya
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Prof. Dr. Defne Kaya Utlu'dan, meslektaşlarına yönelik değerlendirme, genel tavsiye ve klinik notlar.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-teal-600 animate-spin" /></div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/40 dark:border-slate-700 rounded-3xl p-12">
            <Stethoscope className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg">Yakında klinisyenlere yönelik içerikler burada olacak.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((n) => {
              const open = openId === n.id;
              return (
                <div key={n.id} className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-teal-200/30 dark:border-slate-700 rounded-3xl overflow-hidden">
                  <button onClick={() => setOpenId(open ? null : n.id)} className="w-full flex items-center justify-between gap-3 p-6 text-left">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {n.category && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600">
                            <Stethoscope className="w-3.5 h-3.5" /> {n.category}
                          </span>
                        )}
                        {n.readingTime && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-[11px] font-medium">
                            <Clock className="w-3 h-3" /> {n.readingTime}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{n.title}</h3>
                    </div>
                    {open ? <Minus className="w-6 h-6 text-teal-600 flex-shrink-0" /> : <Plus className="w-6 h-6 text-slate-400 flex-shrink-0" />}
                  </button>
                  {open && (
                    <div className="px-6 pb-6">
                      <NoteContent text={n.content} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
