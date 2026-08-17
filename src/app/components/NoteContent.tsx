// Klinisyen içeriği zengin render — artık ORTAK saf parser (richBlocks.mjs) kullanır.
// Görsel sınıflar ve DOM yapısı DEĞİŞMEDİ; sınıflandırma tek kaynağa taşındı.
// İçerik metni ASLA değiştirilmez. dangerouslySetInnerHTML YOK.
import { parseNote } from '../lib/richBlocks.mjs';

type Seg = { t: 'text' | 'strong' | 'em'; v: string };

function renderSeg(segs: Seg[]) {
  return segs.map((s, i) =>
    s.t === 'strong' ? <strong key={i} className="font-semibold text-slate-900 dark:text-white">{s.v}</strong>
    : s.t === 'em' ? <em key={i} className="italic">{s.v}</em>
    : <span key={i}>{s.v}</span>,
  );
}

export default function NoteContent({ text }: { text: string }) {
  const blocks = parseNote(text) as any[];
  return (
    <div className="leading-relaxed">
      {blocks.map((b, i) => {
        if (b.type === 'noteHeading') return (
          <h3 key={i} className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
            <span>{b.emoji}</span><span>{renderSeg(b.inline)}</span>
          </h3>
        );
        if (b.type === 'numbered') return (
          <h3 key={i} className="flex items-start gap-2.5 mt-6 mb-2">
            <span className="flex-shrink-0 w-7 h-7 mt-0.5 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-sm font-bold flex items-center justify-center">{b.num}</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{b.emoji} {renderSeg(b.inline)}</span>
          </h3>
        );
        if (b.type === 'ul') return (
          <ul key={i} className="my-3 space-y-1.5">
            {b.items.map((it: Seg[], j: number) => (
              <li key={j} className="flex gap-2.5 text-slate-700 dark:text-slate-200 leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                <span>{renderSeg(it)}</span>
              </li>
            ))}
          </ul>
        );
        if (b.type === 'subhead') return <p key={i} className="font-semibold text-teal-700 dark:text-teal-300 mt-4 mb-1">{renderSeg(b.inline)}</p>;
        return <p key={i} className="text-slate-700 dark:text-slate-200 leading-relaxed mb-3">{renderSeg(b.inline)}</p>;
      })}
    </div>
  );
}
