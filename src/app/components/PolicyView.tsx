import { Link } from 'react-router';
import { FileText, ArrowLeft } from 'lucide-react';
import { POLICY_CONTENT } from '../lib/policyContent';
import Seo from './Seo';

const META_RE = /^(Belge No|Yürürlük Tarihi|Son Güncelleme|Versiyon)\s*:/;
const H3_RE = /^\d+\.\d+\.?\s/;
const H2_RE = /^\d+\.\s/;

function renderBody(text: string) {
  const lines = text.split('\n');
  return lines.map((raw, i) => {
    const t = raw.trim();
    if (!t) return null;
    if (META_RE.test(t)) {
      return (
        <p key={i} className="text-xs text-slate-500 dark:text-slate-400">
          {t}
        </p>
      );
    }
    if (H3_RE.test(t)) {
      return (
        <h3 key={i} className="text-base font-semibold text-slate-900 dark:text-white mt-5 mb-1">
          {t}
        </h3>
      );
    }
    if (H2_RE.test(t)) {
      return (
        <h2 key={i} className="text-lg font-bold text-slate-900 dark:text-white mt-7 mb-2">
          {t}
        </h2>
      );
    }
    return (
      <p key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
        {t}
      </p>
    );
  });
}

export default function PolicyView({ slug, title }: { slug: string; title: string }) {
  const body = POLICY_CONTENT[slug];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-16 px-4">
      <Seo title={title} description={`Omurgam — ${title}`} />
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Ana sayfa
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{title}</h1>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
          {body ? (
            <div>{renderBody(body)}</div>
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-600 dark:text-slate-300 text-lg mb-2">Bu politikanın metni hazırlanmaktadır.</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">En kısa sürede yayımlanacaktır.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
