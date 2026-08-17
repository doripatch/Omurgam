// Editoryal render — YALNIZ kaleminden + saglikli-yasam blog aileleri.
// ORTAK parser (richBlocks.mjs → parseEditorial) kullanır; Node prerender
// (editorialBlocksToHtml) ile YAPISAL EŞDEĞER çıktı → bot/kullanıcı ayrışmaz.
// İçerik metni/kelime/noktalama/emoji BİREBİR korunur. Anlamsal başlık (h2/h3)
// uydurulmaz: soru/':' satırları yalnız GÖRSEL vurgu (<p><strong>) alır.
// Görsel aksan yalnız CSS + aria-hidden dekoratif öğe; metne hiçbir şey eklenmez.
// dangerouslySetInnerHTML YOK.
import { parseEditorial } from '../lib/richBlocks.mjs';

export default function EditorialText({ text }: { text: string }) {
  const blocks = parseEditorial(text) as any[];
  return (
    <div className="text-[17px] leading-[1.85] text-slate-700 dark:text-slate-200">
      {blocks.map((b, i) => {
        if (b.type === 'lead') {
          return (
            <p key={i} className="relative mb-6 border-l-4 border-amber-400 pl-5 text-lg font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
              {b.text}
            </p>
          );
        }
        if (b.type === 'qhead') {
          return (
            <p key={i} className="mt-8 mb-3 flex items-start gap-2 text-slate-900 dark:text-white">
              <span aria-hidden="true" className="mt-1 h-4 w-1 flex-shrink-0 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
              <strong className="text-lg font-bold">{b.text}</strong>
            </p>
          );
        }
        if (b.type === 'subhead') {
          return <p key={i} className="mt-5 mb-2"><strong className="font-semibold text-slate-900 dark:text-white">{b.text}</strong></p>;
        }
        if (b.type === 'quote') {
          return (
            <p key={i} className="my-5 border-l-4 border-slate-300 dark:border-slate-600 pl-4">
              <em className="italic text-slate-600 dark:text-slate-300">{b.text}</em>
            </p>
          );
        }
        if (b.type === 'concept') {
          return <p key={i} className="mb-4"><strong className="font-semibold text-slate-900 dark:text-white">{b.term}</strong>{b.rest}</p>;
        }
        if (b.type === 'ul') {
          return (
            <ul key={i} className="my-4 space-y-2.5">
              {b.items.map((t: string, j: number) => (
                <li key={j} className="flex gap-3 leading-relaxed">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (b.type === 'ol') {
          // Numaralar CSS ile (list-decimal) üretilir; DOM'a rakam METNİ eklenmez.
          return (
            <ol key={i} className="my-4 space-y-2 list-decimal pl-6 marker:font-bold marker:text-amber-600 dark:marker:text-amber-400">
              {b.items.map((t: string, j: number) => (
                <li key={j} className="pl-1 leading-relaxed">{t}</li>
              ))}
            </ol>
          );
        }
        return <p key={i} className="mb-4">{b.text}</p>;
      })}
    </div>
  );
}
