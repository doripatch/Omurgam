import { type ReactNode } from 'react';

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

// İçerikte markdown yapısı var mı? (varsa zengin render devreye girer)
export function hasMarkdown(text: string) {
  return /(^|\n)#{2,3}\s|(^|\n)[-•]\s|\*\*[^*]+\*\*/.test(text || '');
}

// Markdown-lite'ı (## ### - **kalın** ve tam satır kalın "lead") zengin biçimde render eder.
// İçerik metni ASLA değiştirilmez; yalnızca biçimlendirilir.
export default function RichText({ text }: { text: string }) {
  const lines = (text || '').split('\n');
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flush = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="my-4 space-y-2.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-3 text-[17px] text-slate-700 dark:text-slate-200 leading-relaxed">
              <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
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

    const h2 = line.match(/^##\s+(.*)$/);
    const h3 = line.match(/^###\s+(.*)$/);
    const bullet = line.match(/^[-•]\s+(.+)$/);
    const wholeBold = line.match(/^\*\*(.+)\*\*$/);

    if (h3) {
      flush();
      blocks.push(
        <h3 key={idx} className="text-xl font-bold text-slate-900 dark:text-white mt-7 mb-2.5">
          {renderInline(h3[1])}
        </h3>
      );
    } else if (h2) {
      flush();
      blocks.push(
        <h2 key={idx} className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">
          <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-amber-400 to-orange-500 flex-shrink-0" />
          <span>{renderInline(h2[1])}</span>
        </h2>
      );
    } else if (bullet) {
      bullets.push(bullet[1]);
    } else if (wholeBold && !wholeBold[1].includes('**')) {
      // Tam satır kalın → giriş/özet kutusu (lead)
      flush();
      blocks.push(
        <div key={idx} className="border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-r-xl px-5 py-4 mb-7">
          <p className="text-lg font-medium text-slate-800 dark:text-slate-100 leading-relaxed">{renderInline(wholeBold[1])}</p>
        </div>
      );
    } else {
      flush();
      blocks.push(
        <p key={idx} className="text-[17px] text-slate-700 dark:text-slate-200 leading-[1.8] mb-4">
          {renderInline(line)}
        </p>
      );
    }
  });
  flush();

  return <div>{blocks}</div>;
}
