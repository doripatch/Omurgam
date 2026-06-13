import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Cookie } from 'lucide-react';
import { loadGA, trackPageview } from '../lib/analytics';

const KEY = 'omurgam_cookie_consent';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let v: string | null = null;
    try {
      v = localStorage.getItem(KEY);
    } catch {}
    if (v === 'accepted') {
      loadGA();
      trackPageview(window.location.pathname + window.location.search);
    } else if (!v) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(KEY, 'accepted');
    } catch {}
    loadGA();
    trackPageview(window.location.pathname + window.location.search);
    setShow(false);
  };

  const reject = () => {
    try {
      localStorage.setItem(KEY, 'rejected');
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Bu sitede, ziyaret istatistiklerini anlamak ve deneyiminizi iyileştirmek için çerezler kullanıyoruz.
            Detaylar için{' '}
            <Link to="/gizlilik" className="text-amber-700 dark:text-amber-400 font-semibold hover:underline">
              Gizlilik Politikası
            </Link>
            'nı inceleyebilirsiniz.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
          <button
            onClick={reject}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Reddet
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-bold hover:shadow-lg transition-all"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}
