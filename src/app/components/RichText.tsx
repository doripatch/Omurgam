// Blog içeriği zengin render — artık ORTAK saf parser (richBlocks.mjs) kullanır.
// Görsel sınıflar ve DOM yapısı DEĞİŞMEDİ; yalnız sınıflandırma tek kaynağa taşındı.
// İçerik metni ASLA değiştirilmez. dangerouslySetInnerHTML YOK.
import { parseBlog } from '../lib/richBlocks.mjs';

type Seg = { t: 'text' | 'strong' | 'em'; v: string };

function renderSeg(segs: Seg[]) {
  return segs.map((s, i) =>
    s.t === 'strong' ? <strong key={i} className="font-semibold text-slate-900 dark:text-white">{s.v}</strong>
    : s.t === 'em' ? <em key={i} className="italic">{s.v}</em>
    : <span key={i}>{s.v}</span>,
  );
}

// İçerikte markdown yapısı var mı? (BlogPost/MigratedBlogPost bununla RichText'e karar verir)
export function hasMarkdown(text: string) {
  return /(^|\n)#{2,3}\s|(^|\n)[-•]\s|\*\*[^*]+\*\*/.test(text || '');
}

export default function RichText({ text }: { text: string }) {
  const blocks = parseBlog(text) as any[];
  return (
    <div>
      {blocks.map((b, i) => {
        if (b.type === 'h3') return <h3 key={i} className="text-xl font-bold text-slate-900 dark:text-white mt-7 mb-2.5">{renderSeg(b.inline)}</h3>;
        if (b.type === 'h2') return (
          <h2 key={i} className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">
            <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-amber-400 to-orange-500 flex-shrink-0" />
            <span>{renderSeg(b.inline)}</span>
          </h2>
        );
        if (b.type === 'lead') return (
          <div key={i} className="border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-r-xl px-5 py-4 mb-7">
            <p className="text-lg font-medium text-slate-800 dark:text-slate-100 leading-relaxed">{renderSeg(b.inline)}</p>
          </div>
        );
        if (b.type === 'ul') return (
          <ul key={i} className="my-4 space-y-2.5">
            {b.items.map((it: Seg[], j: number) => (
              <li key={j} className="flex gap-3 text-[17px] text-slate-700 dark:text-slate-200 leading-relaxed">
                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span>{renderSeg(it)}</span>
              </li>
            ))}
          </ul>
        );
        return <p key={i} className="text-[17px] text-slate-700 dark:text-slate-200 leading-[1.8] mb-4">{renderSeg(b.inline)}</p>;
      })}
    </div>
  );
}
