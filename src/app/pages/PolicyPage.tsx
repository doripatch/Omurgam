import { useParams, Link } from 'react-router';
import { getPolicy } from '../lib/policies';
import PolicyView from '../components/PolicyView';

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

  return <PolicyView slug={policy.slug} title={policy.title} />;
}
