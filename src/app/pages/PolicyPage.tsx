import { useParams, Link } from 'react-router';
import { FileText, ArrowLeft } from 'lucide-react';
import { getPolicy } from '../lib/policies';
import Seo from '../components/Seo';

export default function PolicyPage() {
  const { slug } = useParams();
  const policy = getPolicy(slug);

  if (!policy) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Politika bulunamadı</h1>
          <Link to="/" className="text-amber-700 dark:text-amber-400 font-semibold hover:underline">Ana sayfaya dön</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-16 px-4">
      <Seo title={policy.title} description={`Omurgam — ${policy.title}`} />
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 mb-6">
          <ArrowLeft className="w-4 h-4" /> Ana sayfa
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{policy.title}</h1>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/10 dark:border-slate-700 shadow-sm">
          {policy.body ? (
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {policy.body}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-600 dark:text-slate-300 text-lg mb-2">Bu politikanın metni hazırlanmaktadır.</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">En kısa sürede yayımlanacaktır. Sorularınız için bizimle iletişime geçebilirsiniz.</p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Son güncelleme tarihleri yayım sonrası burada belirtilecektir.
        </p>
      </div>
    </div>
  );
}
